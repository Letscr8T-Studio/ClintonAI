"use client";

import { useState } from "react";
import { attachCopy as copy } from "@/content/app/compose-options";
import { ATTACHMENT_MAX_BYTES, LIMITS } from "@/lib/validation/compose";
import type { AttachmentRef } from "@/types/emails";

export type Attachment = {
  key: string;
  name: string;
  size: number;
  type: string;
  status: "uploading" | "ready" | "failed";
  /** Where it was uploaded, once it has been. */
  path?: string;
};

const fromRef = (ref: AttachmentRef): Attachment => ({ ...ref, key: ref.path, status: "ready" });
/** Names go into a mail header and a storage path: no slashes or line breaks. */
const safeName = (name: string) => name.replace(/[/\\\r\n]+/g, "_").slice(0, 200) || "file";

/** Asks for a one-time upload URL, then sends the file straight to storage. Returns its path. */
async function upload(file: File, name: string, type: string): Promise<string> {
  const res = await fetch("/api/attachments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, size: file.size, type }),
  });
  const json = (await res.json()) as { ok: boolean; path?: string; url?: string };
  if (!json.ok || !json.path || !json.url) throw new Error("No upload URL");
  const form = new FormData();
  form.append("cacheControl", "3600");
  form.append("", file);
  const put = await fetch(json.url, { method: "PUT", body: form, headers: { "x-upsert": "false" } });
  if (!put.ok) throw new Error(`Upload failed (${put.status})`);
  return json.path;
}

/**
 * Files attached in Compose: each uploads as soon as it's picked (to the user's own folder), and
 * is sent with the email. Removing one before sending deletes it.
 */
export function useAttachments(initial: AttachmentRef[] = []) {
  const [items, setItems] = useState<Attachment[]>(() => initial.map(fromRef));
  const [notice, setNotice] = useState<string | null>(null);
  const update = (key: string, patch: Partial<Attachment>) =>
    setItems((list) => list.map((i) => (i.key === key ? { ...i, ...patch } : i)));

  const add = (files: File[]) => {
    setNotice(null);
    let room = LIMITS.attachments - items.length;
    let total = items.reduce((sum, i) => sum + i.size, 0);
    for (const file of files) {
      if (room <= 0) return setNotice(copy.tooMany);
      if (total + file.size > ATTACHMENT_MAX_BYTES) {
        setNotice(copy.tooBig);
        continue;
      }
      room -= 1;
      total += file.size;
      const item: Attachment = {
        key: crypto.randomUUID(),
        name: safeName(file.name),
        size: file.size,
        type: file.type || "application/octet-stream",
        status: "uploading",
      };
      setItems((list) => [...list, item]);
      upload(file, item.name, item.type)
        .then((path) => update(item.key, { status: "ready", path }))
        .catch(() => update(item.key, { status: "failed" }));
    }
  };

  const remove = (key: string) => {
    const item = items.find((i) => i.key === key);
    setItems((list) => list.filter((i) => i.key !== key));
    setNotice(null);
    if (item?.path) {
      void fetch("/api/attachments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: item.path }),
      }).catch(() => {}); // anything left is swept within a day
    }
  };

  const refs = (): AttachmentRef[] =>
    items.flatMap((i) =>
      i.status === "ready" && i.path ? [{ path: i.path, name: i.name, size: i.size, type: i.type }] : [],
    );

  /** A new email (after sending: the files went with it) or one taken back (Undo). */
  const reset = (next: AttachmentRef[] = []) => {
    setItems(next.map(fromRef));
    setNotice(null);
  };

  return {
    items,
    notice,
    add,
    remove,
    refs,
    reset,
    /** Shows a message under the files (e.g. why sending has to wait). */
    notify: setNotice,
    uploading: items.some((i) => i.status === "uploading"),
  };
}
