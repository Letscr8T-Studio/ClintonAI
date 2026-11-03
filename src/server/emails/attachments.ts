import "server-only";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { ATTACHMENT_MAX_BYTES, attachmentSchema } from "@/lib/validation/compose";
import type { MailFile } from "@/server/google/mime";
import { getSupabaseAdmin } from "@/server/supabase";
import type { AttachmentRef } from "@/types/emails";

// Attached files, in the private "attachments" bucket (service role only). The browser uploads
// straight to storage with a one-time signed URL, so large files never pass through our server.
// Files live only while their email waits: deleted when it leaves or is cancelled, and anything
// unused after 24 hours is swept by the dispatcher (stale_attachments).

const BUCKET = "attachments";
const storage = () => getSupabaseAdmin().storage.from(BUCKET);

/** The attachment list stored on an email row (jsonb); anything malformed is dropped. */
export function attachmentRefs(value: unknown): AttachmentRef[] {
  const parsed = z.array(attachmentSchema).safeParse(value);
  return parsed.success ? parsed.data : [];
}

/** A one-time URL to upload one file into the user's own folder. */
export async function createUpload(userId: string): Promise<{ path: string; url: string }> {
  const path = `${userId}/${randomUUID()}`;
  const { data, error } = await storage().createSignedUploadUrl(path);
  if (error || !data) throw new Error(`Could not prepare the upload: ${error?.message ?? "no URL"}`);
  return { path, url: data.signedUrl };
}

/** The files for sending, or null if any is missing or they add up to more than Gmail allows. */
export async function downloadAttachments(refs: AttachmentRef[]): Promise<MailFile[] | null> {
  const files: MailFile[] = [];
  let total = 0;
  for (const ref of refs) {
    const { data, error } = await storage().download(ref.path);
    if (error || !data) return null;
    const bytes = Buffer.from(await data.arrayBuffer());
    total += bytes.length;
    if (total > ATTACHMENT_MAX_BYTES) return null;
    files.push({ name: ref.name, type: ref.type, data: bytes });
  }
  return files;
}

/** Best effort: whatever is left is swept within a day. */
export async function removeAttachments(paths: string[]): Promise<void> {
  if (paths.length === 0) return;
  const { error } = await storage().remove(paths);
  if (error) console.warn("Attachments not removed", error.message);
}

/** Deletes uploads older than a day that no waiting email uses. Returns how many went. */
export async function removeStaleAttachments(limit = 100): Promise<number> {
  const { data, error } = await getSupabaseAdmin().rpc("stale_attachments", { p_limit: limit });
  if (error) throw new Error(`Could not list stale attachments: ${error.message}`);
  const paths = (data ?? []) as string[];
  await removeAttachments(paths);
  return paths.length;
}
