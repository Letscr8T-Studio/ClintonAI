import { describe, expect, it } from "vitest";
import { guessApp, replyOptions } from "./reply-links";

describe("reply links", () => {
  it("guesses the webmail from the address the message went to", () => {
    expect(guessApp("kemi@gmail.com")).toBe("gmail");
    expect(guessApp("kemi@hotmail.co.uk")).toBe("outlook");
    expect(guessApp("kemi@yahoo.com")).toBe("yahoo");
    expect(guessApp("kemi@northstar.vc")).toBeNull();
    expect(guessApp(undefined)).toBeNull();
  });

  it("puts the guessed app first, and addresses each one with Re: subject", () => {
    const options = replyOptions("preye@gmail.com", "Q4 & plans", "kemi@yahoo.com");
    expect(options.map((o) => o.app)).toEqual(["yahoo", "gmail", "outlook", "mailto"]);
    expect(options[0].href).toBe(
      "https://compose.mail.yahoo.com/?to=preye%40gmail.com&subject=Re%3A%20Q4%20%26%20plans",
    );
    expect(options.find((o) => o.app === "mailto")?.href).toBe(
      "mailto:preye@gmail.com?subject=Re%3A%20Q4%20%26%20plans",
    );
  });

  it("opens Gmail in the account that received the message", () => {
    const [gmail] = replyOptions("preye@gmail.com", "Hi", "kemi@gmail.com");
    const url = new URL(gmail.href);
    expect(Object.fromEntries(url.searchParams)).toEqual({
      authuser: "kemi@gmail.com",
      view: "cm",
      fs: "1",
      to: "preye@gmail.com",
      su: "Re: Hi",
    });
  });

  it("uses Outlook for work for custom domains, Outlook.com for personal ones, and works without a subject", () => {
    expect(replyOptions("p@x.com", "", "kemi@northstar.vc").find((o) => o.app === "outlook")?.href).toBe(
      "https://outlook.office.com/mail/deeplink/compose?to=p%40x.com",
    );
    expect(replyOptions("p@x.com", "", "kemi@live.com")[0].href).toBe(
      "https://outlook.live.com/mail/deeplink/compose?to=p%40x.com",
    );
  });
});
