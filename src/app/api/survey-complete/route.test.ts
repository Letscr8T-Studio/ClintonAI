// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { jsonRequest } from "@/test/fixtures";
import { POST } from "./route";

const markSurveyDone = vi.fn();
vi.mock("@/server/waitlist/repository", () => ({
  markSurveyDone: (...args: unknown[]) => markSurveyDone(...args),
}));

const post = (body: unknown) => jsonRequest("http://localhost/api/survey-complete", body);

beforeEach(() => {
  markSurveyDone.mockReset();
  markSurveyDone.mockResolvedValue(undefined);
});

describe("POST /api/survey-complete", () => {
  it("marks the normalised email as surveyed", async () => {
    const res = await POST(post({ email: "Ada@Example.com" }));
    expect(res.status).toBe(200);
    expect(markSurveyDone).toHaveBeenCalledWith("ada@example.com");
  });

  it("rejects a missing or invalid email", async () => {
    expect((await POST(post({}))).status).toBe(400);
    expect(markSurveyDone).not.toHaveBeenCalled();
  });

  it("returns 500 when the update fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    markSurveyDone.mockRejectedValue(new Error("db down"));
    expect((await POST(post({ email: "ada@example.com" }))).status).toBe(500);
  });
});
