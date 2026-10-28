import type { Signup } from "@/types/waitlist";

let seq = 0;

/** Builds a signup row; override only what a test cares about. */
export function makeSignup(overrides: Partial<Signup> = {}): Signup {
  seq += 1;
  return {
    id: `id-${seq}`,
    email: `person${seq}@example.com`,
    source: "direct",
    did_survey: false,
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

/** A JSON POST request for route-handler tests. */
export function jsonRequest(url: string, body: unknown, headers: Record<string, string> = {}): Request {
  return new Request(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}
