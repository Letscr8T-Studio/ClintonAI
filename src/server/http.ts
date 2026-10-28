import "server-only";
import { NextResponse } from "next/server";
import type { z } from "zod";
import { MESSAGES, type ApiResult } from "@/lib/validation/waitlist";

// Small helpers so every API route answers in the same { ok, error } shape.

export function ok(): NextResponse<ApiResult> {
  return NextResponse.json({ ok: true });
}

export function fail(error: string, status: number): NextResponse<ApiResult> {
  return NextResponse.json({ ok: false, error }, { status });
}

type Parsed<T> = { data: T; response?: never } | { data?: never; response: NextResponse<ApiResult> };

/** Reads a JSON body and validates it. On failure returns a ready 400 response. */
export async function parseJson<S extends z.ZodType>(
  request: Request,
  schema: S,
): Promise<Parsed<z.output<S>>> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return { response: fail(MESSAGES.invalidRequest, 400) };
  }
  const result = schema.safeParse(body ?? {});
  if (!result.success) {
    return { response: fail(result.error.issues[0]?.message ?? MESSAGES.invalidRequest, 400) };
  }
  return { data: result.data };
}

/** Best-effort client IP from the proxy headers Vercel sets. */
export function clientIp(headers: Headers): string {
  return (headers.get("x-forwarded-for")?.split(",")[0] ?? headers.get("x-real-ip") ?? "unknown").trim();
}
