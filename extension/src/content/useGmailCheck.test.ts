import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Finding } from "@/lib/check/types";
import type { CheckRequest } from "@/lib/validation/compose";
import type { CheckReply } from "../check";
import type { GmailDraft } from "../gmail/compose";
import { toCheckRequest, useGmailCheck } from "./useGmailCheck";

const draft = (patch: Partial<GmailDraft> = {}): GmailDraft => ({
  to: ["ada@example.com"],
  cc: [],
  bcc: [],
  subject: "Contract",
  body: "Thanks for the contract",
  attachments: [],
  signature: "",
  quoted: false,
  gmailAttachments: 0,
  rich: { links: false, images: false, formatting: false },
  ...patch,
});
const thanks: Finding = {
  id: "a",
  source: "model",
  type: "tone",
  field: "body",
  message: "x",
  excerpt: "Thanks",
};

function setup(reply: CheckReply, first = draft(), enabled = true) {
  const requestCheck = vi.fn<(request: CheckRequest) => Promise<CheckReply>>(async () => reply);
  const hook = renderHook(({ d, on }) => useGmailCheck(d, on, requestCheck, 0), {
    initialProps: { d: first, on: enabled },
  });
  return { requestCheck, ...hook };
}

describe("useGmailCheck", () => {
  it("needs a recipient and some text before it checks", () => {
    expect(toCheckRequest(draft({ to: [] }))).toBeNull();
    expect(toCheckRequest(draft({ body: "  " }))).toBeNull();
    expect(toCheckRequest(draft({ gmailAttachments: 2 }))?.attachments).toHaveLength(2);
  });

  it("checks once per version of the email, not on every re-read", async () => {
    const { requestCheck, result, rerender } = setup({ kind: "ok", findings: [thanks], modelUsed: true });
    await waitFor(() => expect(result.current.status).toBe("done"));
    rerender({ d: draft(), on: true }); // same content, new object
    await new Promise((r) => setTimeout(r, 20));
    expect(requestCheck).toHaveBeenCalledTimes(1);
    rerender({ d: draft({ subject: "Signed contract" }), on: true });
    await waitFor(() => expect(requestCheck).toHaveBeenCalledTimes(2));
  });

  it("drops a finding once its words change, and keeps ignored ones ignored after re-checks", async () => {
    const { result, rerender } = setup({ kind: "ok", findings: [thanks], modelUsed: true });
    await waitFor(() => expect(result.current.findings).toEqual([thanks]));
    rerender({ d: draft({ body: "Thank you for the contract" }), on: true });
    expect(result.current.findings).toEqual([]);

    rerender({ d: draft(), on: true });
    await waitFor(() => expect(result.current.findings).toEqual([thanks]));
    act(() => result.current.settle(thanks));
    expect(result.current.findings).toEqual([]);
    rerender({ d: draft({ subject: "New subject" }), on: true });
    await waitFor(() => expect(result.current.status).toBe("done"));
    expect(result.current.findings).toEqual([]);
  });

  it("does nothing while signed out", async () => {
    const { requestCheck, result } = setup({ kind: "ok", findings: [], modelUsed: true }, draft(), false);
    await new Promise((r) => setTimeout(r, 20));
    expect(requestCheck).not.toHaveBeenCalled();
    expect(result.current.status).toBe("idle");
  });
});
