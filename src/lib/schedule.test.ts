import { describe, expect, it } from "vitest";
import { formatWhen, scheduleOptions, toLocalInput } from "./schedule";

// Local-time dates: the picks follow the writer's own clock.
const local = (y: number, m: number, d: number, h: number, min = 0) => new Date(y, m - 1, d, h, min);

describe("scheduleOptions", () => {
  it("offers later today, tomorrow morning and afternoon, and Monday morning", () => {
    const options = scheduleOptions(local(2026, 11, 4, 10)); // a Wednesday, 10:00
    expect(options.map((o) => [o.id, toLocalInput(o.at)])).toEqual([
      ["laterToday", "2026-11-04T18:00"],
      ["tomorrowMorning", "2026-11-05T08:00"],
      ["tomorrowAfternoon", "2026-11-05T13:00"],
      ["monday", "2026-11-09T08:00"],
    ]);
  });

  it("drops later today in the evening, and Monday when tomorrow is Monday", () => {
    const sundayEvening = scheduleOptions(local(2026, 11, 8, 19));
    expect(sundayEvening.map((o) => o.id)).toEqual(["tomorrowMorning", "tomorrowAfternoon"]);
  });

  it("on a Monday, Monday morning means next week", () => {
    const monday = scheduleOptions(local(2026, 11, 2, 9)).find((o) => o.id === "monday");
    expect(toLocalInput(monday!.at)).toBe("2026-11-09T08:00");
  });
});

describe("formatWhen", () => {
  const now = local(2026, 11, 4, 10);
  it("says today and tomorrow in words, and other days by date", () => {
    expect(formatWhen(local(2026, 11, 4, 18), now)).toMatch(/^Today 18:00$/);
    expect(formatWhen(local(2026, 11, 5, 8), now)).toMatch(/^Tomorrow 08:00$/);
    expect(formatWhen(local(2026, 11, 9, 8), now)).toMatch(/9.*08:00$/);
  });
});
