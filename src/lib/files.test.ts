import { describe, expect, it } from "vitest";
import { formatBytes } from "./files";

describe("formatBytes", () => {
  it("says sizes the way people do", () => {
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(820 * 1024)).toBe("820 KB");
    expect(formatBytes(4.24 * 1024 * 1024)).toBe("4.2 MB");
    expect(formatBytes(17.6 * 1024 * 1024)).toBe("18 MB");
  });
});
