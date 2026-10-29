import "server-only";
import { getSupabaseAdmin } from "@/server/supabase";

// The encrypted content files, in the private "safe-send" bucket (service role only).

const BUCKET = "safe-send";

export async function uploadContent(path: string, sealed: string): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .storage.from(BUCKET)
    .upload(path, Buffer.from(sealed, "utf8"), { contentType: "application/octet-stream", upsert: false });
  if (error) throw new Error(`Could not store Safe Send content: ${error.message}`);
}

export async function downloadContent(path: string): Promise<string | null> {
  const { data, error } = await getSupabaseAdmin().storage.from(BUCKET).download(path);
  if (error || !data) return null;
  return data.text();
}

/** Best effort: the key is already destroyed, so a leftover file is unreadable anyway. */
export async function removeContent(paths: string[]): Promise<void> {
  if (paths.length === 0) return;
  const { error } = await getSupabaseAdmin().storage.from(BUCKET).remove(paths);
  if (error) console.warn("Safe Send file not removed", error.message);
}
