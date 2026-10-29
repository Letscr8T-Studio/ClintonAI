// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GMAIL_SEND_SCOPE, GoogleAuthError } from "@/server/google/oauth";
import type * as OAuth from "@/server/google/oauth";
import type { GmailAccount } from "@/types/accounts";
import { connectGoogleAccount, disconnectAccount, sendTestEmail } from "./service";

const repo = vi.hoisted(() => ({
  findOwnAccount: vi.fn(),
  getRefreshToken: vi.fn(),
  saveGoogleAccount: vi.fn(),
  setAccountStatus: vi.fn(),
  deleteAccount: vi.fn(),
}));
vi.mock("./repository", () => repo);

const google = vi.hoisted(() => ({
  refreshAccessToken: vi.fn(),
  revokeToken: vi.fn(),
  sendRawMessage: vi.fn(),
}));
vi.mock("@/server/google/oauth", async (importOriginal) => ({
  ...(await importOriginal<typeof OAuth>()),
  refreshAccessToken: google.refreshAccessToken,
  revokeToken: google.revokeToken,
}));
vi.mock("@/server/google/gmail", () => ({ sendRawMessage: google.sendRawMessage }));

const cancelHeldForAccount = vi.hoisted(() => vi.fn());
vi.mock("@/server/emails/service", () => ({ cancelHeldForAccount }));

const idToken = (email: string) =>
  `h.${Buffer.from(JSON.stringify({ email, email_verified: true })).toString("base64url")}.s`;
const account: GmailAccount = {
  id: "acc-1",
  email: "ada@example.com",
  status: "active",
  connectedAt: "2026-10-29",
};
const email = { subject: "Test", body: "Hi" };

beforeEach(() => {
  Object.values(repo).forEach((fn) => fn.mockReset());
  Object.values(google).forEach((fn) => fn.mockReset());
});

describe("connectGoogleAccount", () => {
  const tokens = (scope: string, extra = {}) => ({
    access_token: "a",
    expires_in: 3600,
    scope,
    refresh_token: "r",
    id_token: idToken("Ada@Example.com"),
    ...extra,
  });

  it("stores the refresh token when send permission was granted", async () => {
    expect(await connectGoogleAccount("u1", tokens(`openid ${GMAIL_SEND_SCOPE}`))).toBe("connected");
    expect(repo.saveGoogleAccount).toHaveBeenCalledWith({
      userId: "u1",
      email: "Ada@Example.com",
      scopes: ["openid", GMAIL_SEND_SCOPE],
      refreshToken: "r",
    });
  });

  it("stores nothing when the user unticked send permission", async () => {
    expect(await connectGoogleAccount("u1", tokens("openid email"))).toBe("missing_scope");
    expect(repo.saveGoogleAccount).not.toHaveBeenCalled();
  });

  it("fails without a refresh token or a verified address", async () => {
    expect(await connectGoogleAccount("u1", tokens(GMAIL_SEND_SCOPE, { refresh_token: undefined }))).toBe(
      "failed",
    );
    expect(await connectGoogleAccount("u1", tokens(GMAIL_SEND_SCOPE, { id_token: undefined }))).toBe(
      "failed",
    );
    expect(repo.saveGoogleAccount).not.toHaveBeenCalled();
  });
});

describe("sendTestEmail", () => {
  it("sends from the account to itself", async () => {
    repo.findOwnAccount.mockResolvedValue(account);
    repo.getRefreshToken.mockResolvedValue("refresh");
    google.refreshAccessToken.mockResolvedValue("access");
    google.sendRawMessage.mockResolvedValue("msg-1");

    expect(await sendTestEmail("acc-1", { name: "Ada" }, email)).toEqual({
      ok: true,
      email: "ada@example.com",
    });
    const [token, raw] = google.sendRawMessage.mock.calls[0]!;
    expect(token).toBe("access");
    const message = Buffer.from(raw, "base64url").toString("utf8");
    expect(message).toContain('From: "Ada" <ada@example.com>');
    expect(message).toContain("To: ada@example.com");
  });

  it("refuses accounts the user doesn't own", async () => {
    repo.findOwnAccount.mockResolvedValue(null);
    expect(await sendTestEmail("other", { name: null }, email)).toEqual({ ok: false, reason: "not_found" });
    expect(repo.getRefreshToken).not.toHaveBeenCalled();
  });

  it("marks the account revoked when Google rejects the token", async () => {
    repo.findOwnAccount.mockResolvedValue(account);
    repo.getRefreshToken.mockResolvedValue("refresh");
    google.refreshAccessToken.mockRejectedValue(new GoogleAuthError("bad", "invalid_grant"));

    expect(await sendTestEmail("acc-1", { name: null }, email)).toEqual({ ok: false, reason: "revoked" });
    expect(repo.setAccountStatus).toHaveBeenCalledWith("acc-1", "revoked");
    expect(google.sendRawMessage).not.toHaveBeenCalled();
  });
});

describe("disconnectAccount", () => {
  it("cancels waiting emails, revokes at Google, then deletes the account", async () => {
    repo.findOwnAccount.mockResolvedValue(account);
    repo.getRefreshToken.mockResolvedValue("refresh");
    expect(await disconnectAccount("u1", "acc-1")).toBe(true);
    expect(cancelHeldForAccount).toHaveBeenCalledWith({ id: "u1" }, "acc-1");
    expect(google.revokeToken).toHaveBeenCalledWith("refresh");
    expect(repo.deleteAccount).toHaveBeenCalledWith("u1", "acc-1");
    // Nothing may leave from the account after it is gone.
    expect(cancelHeldForAccount.mock.invocationCallOrder[0]!).toBeLessThan(
      repo.deleteAccount.mock.invocationCallOrder[0]!,
    );
  });

  it("does nothing for someone else's account", async () => {
    repo.findOwnAccount.mockResolvedValue(null);
    expect(await disconnectAccount("u1", "acc-x")).toBe(false);
    expect(repo.deleteAccount).not.toHaveBeenCalled();
  });
});
