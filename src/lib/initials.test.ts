import { describe, expect, it } from "vitest";
import { initialsOf } from "./initials";

describe("initialsOf", () => {
  it("takes the first and last name's first letters, or one for a single name or address", () => {
    expect(initialsOf("Preye Omusuku")).toBe("PO");
    expect(initialsOf("Ada Kemi Obi")).toBe("AO");
    expect(initialsOf("ada")).toBe("A");
    expect(initialsOf("ada.obi@x.com")).toBe("AO");
    expect(initialsOf("")).toBe("?");
  });
});
