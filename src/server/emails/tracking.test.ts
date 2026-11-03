// @vitest-environment node
import { describe, expect, it } from "vitest";
import { OPEN_TOKEN, hashOpenToken, newOpenToken, trackedHtml } from "./tracking";

describe("open tokens", () => {
  it("are random, URL-safe, and stored only as a SHA-256 hash", () => {
    const a = newOpenToken();
    const b = newOpenToken();
    expect(a.token).toMatch(OPEN_TOKEN);
    expect(a.token).not.toBe(b.token);
    expect(a.hash).toMatch(/^[0-9a-f]{64}$/);
    expect(a.hash).toBe(hashOpenToken(a.token));
  });
});

describe("trackedHtml", () => {
  it("keeps the words and line breaks, escapes HTML, and ends with the pixel", () => {
    const html = trackedHtml('Hi <Dami> & "team"\nSee you', "https://tryclinton.com/api/o/abc");
    expect(html).toContain("Hi &#60;Dami&#62; &#38; &#34;team&#34;<br>See you");
    expect(html).toMatch(/<img src="https:\/\/tryclinton\.com\/api\/o\/abc" width="1" height="1" alt=""/);
    expect(html.indexOf("<img")).toBeGreaterThan(html.indexOf("See you"));
  });
});
