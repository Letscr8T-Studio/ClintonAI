// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { GmailSendError, sendRawMessage } from "./gmail";

afterEach(() => vi.unstubAllGlobals());

describe("sendRawMessage", () => {
  it("uploads the message bytes as message/rfc822 and returns Gmail's id", async () => {
    const fetchMock = vi.fn<typeof fetch>(async () => new Response(JSON.stringify({ id: "msg-1" })));
    vi.stubGlobal("fetch", fetchMock);
    const raw = Buffer.from("Subject: Hi\r\n\r\nHello", "utf8").toString("base64url");

    expect(await sendRawMessage("token", raw)).toBe("msg-1");
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(String(url)).toContain("/upload/gmail/v1/users/me/messages/send?uploadType=media");
    expect(init!.headers).toMatchObject({ Authorization: "Bearer token", "Content-Type": "message/rfc822" });
    expect(Buffer.from(init!.body as Uint8Array).toString("utf8")).toBe("Subject: Hi\r\n\r\nHello");
  });

  it("throws with the status when Gmail refuses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("no", { status: 429 })),
    );
    await expect(sendRawMessage("token", "eA")).rejects.toMatchObject({ status: 429 });
    await expect(sendRawMessage("token", "eA")).rejects.toBeInstanceOf(GmailSendError);
  });
});
