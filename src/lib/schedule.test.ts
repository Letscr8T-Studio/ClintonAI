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
  // Times follow the reader's own locale ("18:00" in Lagos and London, "06:00 PM" in New York), so
  // compare with the same formatter instead of one machine's clock style.
  const time = (date: Date) =>
    new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(date);

  it("says today and tomorrow in words, and other days by date", () => {
    const evening = local(2026, 11, 4, 18);
    const morning = local(2026, 11, 5, 8);
    const monday = local(2026, 11, 9, 8);
    expect(formatWhen(evening, now)).toBe(`Today ${time(evening)}`);
    expect(formatWhen(morning, now)).toBe(`Tomorrow ${time(morning)}`);
    expect(formatWhen(monday, now)).toMatch(new RegExp(`9.*${time(monday)}$`));
  });
});
