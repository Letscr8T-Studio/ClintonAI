import { describe, expect, it } from "vitest";
import { delayOptions } from "@/content/app/onboarding";
import { SMART_DELAY, delayClock, formatDelay, onboardingSchema } from "./profile";

describe("onboardingSchema", () => {
  it("accepts form strings within 1-30 minutes", () => {
    expect(onboardingSchema.parse({ delaySeconds: "300" })).toEqual({ delaySeconds: 300 });
  });

  it("accepts Off (0): no Smart Delay", () => {
    expect(onboardingSchema.parse({ delaySeconds: "0" })).toEqual({ delaySeconds: 0 });
  });

  it.each(["59", "1", "1801", "abc", "", " ", "120.5", "-60"])("rejects %j", (value) => {
    expect(onboardingSchema.safeParse({ delaySeconds: value }).success).toBe(false);
  });

  it("accepts every option offered in onboarding, and offers the default", () => {
    for (const option of delayOptions) {
      expect(onboardingSchema.safeParse({ delaySeconds: option.seconds }).success).toBe(true);
    }
    expect(delayOptions.map((o) => o.seconds)).toContain(SMART_DELAY.default);
  });
});

describe("formatDelay", () => {
  it("shows whole minutes", () => {
    expect(formatDelay(60)).toBe("1 min");
    expect(formatDelay(300)).toBe("5 min");
    expect(formatDelay(1800)).toBe("30 min");
  });

  it("says Off when there is no Smart Delay, on the ring too", () => {
    expect(formatDelay(0)).toBe("Off");
    expect(delayClock(0)).toBe("Off");
    expect(delayClock(300)).toBe("05:00");
  });
});
