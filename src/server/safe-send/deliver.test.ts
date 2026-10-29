// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { EmailRow } from "@/types/database";
import type * as Gmail from "@/server/google/gmail";
import { GmailSendError } from "@/server/google/gmail";
import { sendSafeSendCopies } from "./deliver";

const m = vi.hoisted(() => ({ prepare: vi.fn(), send: vi.fn(), deleteUnsent: vi.fn(), withdraw: vi.fn() }));
vi.mock("./service", () => ({ prepareSafeSend: m.prepare }));
vi.mock("./repository", () => ({ deleteUnsent: m.deleteUnsent, withdrawRecipients: m.withdraw }));
vi.mock("@/server/google/gmail", async (orig) => ({
  ...(await orig<typeof Gmail>()),
  sendRawMessage: m.send,
}));

const email = {
  id: "e1",
  user_id: "u1",
  subject: "Pricing deck v2",
  to_recipients: ["kemi@client.co"],
  cc_recipients: ["tunde@client.co"],
  bcc_recipients: ["boss@me.co"],
} as unknown as EmailRow;
const from = { email: "ada@gmail.com", name: "Ada Obi" };
const links = ["kemi@client.co", "tunde@client.co", "boss@me.co"].map((e, i) => ({
  email: e,
  url: `http://localhost:3000/m/token${i}`,
}));
const decode = (raw: string) => Buffer.from(raw, "base64url").toString("utf8");

beforeEach(() => {
  Object.values(m).forEach((fn) => fn.mockReset());
  m.prepare.mockResolvedValue({ messageId: "m1", links });
  m.send.mockResolvedValue("gmail-id");
});

describe("sendSafeSendCopies", () => {
  it("sends each person their own card and link, and never reveals Bcc", async () => {
    expect(await sendSafeSendCopies(email, "secret body", from, "token")).toEqual({
      providerMessageId: "gmail-id",
      notDelivered: [],
    });
    const messages = m.send.mock.calls.map(([, raw]) => decode(raw as string));
    expect(messages).toHaveLength(3);
    expect(messages[0]).toContain("To: kemi@client.co");
    for (const msg of messages) {
      expect(msg).not.toContain("secret body"); // card only
      expect(msg).not.toMatch(/^Cc:/m);
    }
    const kemiHtml = Buffer.from(
      messages[0]!
        .split("text/html")[1]!
        .split("\r\n\r\n")[1]!
        .replace(/\r\n|--.*$/gs, ""),
      "base64",
    ).toString();
    expect(kemiHtml).toContain("token0");
    expect(kemiHtml).toContain("Also sent to tunde@client.co");
    expect(kemiHtml).not.toContain("boss@me.co");
  });

  it("undoes everything if the first copy fails, so retries start clean", async () => {
    m.send.mockRejectedValueOnce(new GmailSendError("busy", 503));
    await expect(sendSafeSendCopies(email, "b", from, "t")).rejects.toThrow(GmailSendError);
    expect(m.deleteUnsent).toHaveBeenCalledWith("m1");
  });

  it("withdraws the links of anyone a later copy failed for, and reports them", async () => {
    m.send
      .mockResolvedValueOnce("g1")
      .mockRejectedValueOnce(new GmailSendError("bad", 400))
      .mockResolvedValueOnce("g3");
    const result = await sendSafeSendCopies(email, "b", from, "t");
    expect(result.notDelivered).toEqual(["tunde@client.co"]);
    expect(m.withdraw).toHaveBeenCalledWith("u1", "m1", { emails: ["tunde@client.co"] });
    expect(m.deleteUnsent).not.toHaveBeenCalled();
  });
});
