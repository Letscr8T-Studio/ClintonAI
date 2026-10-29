import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";
import { getSupabaseAuthEnv } from "@/server/env";

/**
 * A Supabase client acting as the signed-in user (session in cookies), so row-level security
 * applies to every query. Create one per request; never share it between users.
 */
export async function getSupabaseForUser() {
  const { url, publishableKey } = getSupabaseAuthEnv();
  const store = await cookies();

  return createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          for (const { name, value, options } of list) store.set(name, value, options);
        } catch {
          // Server Components can't set cookies. The proxy refreshes the session instead.
        }
      },
    },
  });
}
