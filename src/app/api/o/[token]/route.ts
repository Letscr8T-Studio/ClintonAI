import { recordOpen } from "@/server/emails/repository";
import { OPEN_TOKEN, hashOpenToken } from "@/server/emails/tracking";

/** The smallest transparent GIF. */
const PIXEL = Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64");

type Params = { params: Promise<{ token: string }> };

// GET /api/o/:token: the "Likely opened" pixel. Public (mail apps load it). Always answers with
// the image, whatever happens, and never caches, so each load is seen. Only the hash is looked up.
export async function GET(_request: Request, { params }: Params) {
  const { token } = await params;
  if (OPEN_TOKEN.test(token)) {
    await recordOpen(hashOpenToken(token)).catch((error: unknown) =>
      console.error("Open not recorded", error instanceof Error ? error.message : error),
    );
  }
  return new Response(new Uint8Array(PIXEL), {
    headers: {
      "Content-Type": "image/gif",
      "Cache-Control": "no-store, max-age=0",
      "Referrer-Policy": "no-referrer",
    },
  });
}
