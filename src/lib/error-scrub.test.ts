import { describe, expect, it } from "vitest";
import { REDACTED_EMAIL, redactEmails, scrubEvent } from "./error-scrub";

describe("redactEmails", () => {
  it("replaces every address, wherever it appears", () => {
    expect(redactEmails("Send to ada.obi+work@brightlane.co.uk failed (cc tunde@x.io)")).toBe(
      `Send to ${REDACTED_EMAIL} failed (cc ${REDACTED_EMAIL})`,
    );
  });
});

describe("scrubEvent", () => {
  it("drops the user, request bodies, cookies, headers and query strings", () => {
    const event = scrubEvent({
      user: { email: "ada@x.co", id: "u1" },
      request: {
        url: "https://tryclinton.com/login?next=/compose&email=ada@x.co",
        data: { body: "Dear Kemi, the salary is 5m" },
        cookies: { "sb-access-token": "secret" },
        headers: { authorization: "Bearer x" },
      },
      message: "boom",
    });
    expect(event).toEqual({ request: { url: "https://tryclinton.com/login" }, message: "boom" });
  });

  it("redacts addresses in messages, exceptions, breadcrumbs and extras", () => {
    const event = scrubEvent({
      exception: { values: [{ value: "Invalid address: ada@x.co" }] },
      breadcrumbs: [{ message: "fetch /api/check for dami@y.io" }],
      extra: { recipients: ["a@b.co"] },
    });
    expect(JSON.stringify(event)).not.toMatch(/@\w/);
    expect(JSON.stringify(event)).toContain(REDACTED_EMAIL);
  });
});
