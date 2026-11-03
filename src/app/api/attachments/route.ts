import { NextResponse } from "next/server";
import { z } from "zod";
import { attachCopy } from "@/content/app/compose-options";
import { emailActionErrors as errors } from "@/content/app/outbox";
import { attachmentSchema, uploadRequestSchema } from "@/lib/validation/compose";
import { getCurrentUser } from "@/server/auth/user";
import { createUpload, removeAttachments } from "@/server/emails/attachments";
import { fail, ok, parseJson } from "@/server/http";
import { createRateLimiter } from "@/server/rate-limit";

/** 60 files per user per minute. */
const limiter = createRateLimiter({ max: 60, windowMs: 60_000 });

// POST /api/attachments: a one-time URL to upload one file to the user's own folder (the browser
// sends the file straight to storage). DELETE: remove a file the user took off before sending.
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return fail("Unauthorized", 401);
  if (limiter.isLimited(user.id)) return fail(errors.rateLimited, 429);
  limiter.hit(user.id);

  const parsed = await parseJson(request, uploadRequestSchema);
  if (parsed.response) return parsed.response;
  try {
    const { path, url } = await createUpload(user.id);
    return NextResponse.json({ ok: true, path, url });
  } catch (error) {
    console.error("Upload not prepared", error instanceof Error ? error.message : error);
    return fail(attachCopy.failed, 500);
  }
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user) return fail("Unauthorized", 401);
  const parsed = await parseJson(request, z.object({ path: attachmentSchema.shape.path }));
  if (parsed.response) return parsed.response;
  // Only ever the user's own folder.
  if (!parsed.data.path.startsWith(`${user.id}/`)) return fail(errors.badAttachment, 403);
  await removeAttachments([parsed.data.path]);
  return ok();
}
