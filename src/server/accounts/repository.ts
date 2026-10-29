import "server-only";
import type { AccountStatus } from "@/types/database";
import type { GmailAccount } from "@/types/accounts";
import { getSupabaseForUser } from "@/server/auth/user-client";
import { getSupabaseAdmin } from "@/server/supabase";

// Reads run as the user (RLS: own rows, no secret columns). Token storage and deletes run with the
// service role through locked-down functions; callers must have checked ownership first.

const COLUMNS = "id, email, status, created_at";

type Row = { id: string; email: string; status: AccountStatus; created_at: string };
const toAccount = (row: Row): GmailAccount => ({
  id: row.id,
  email: row.email,
  status: row.status,
  connectedAt: row.created_at,
});

export async function listAccounts(): Promise<GmailAccount[]> {
  const supabase = await getSupabaseForUser();
  const { data, error } = await supabase
    .from("connected_accounts")
    .select(COLUMNS)
    .eq("provider", "google")
    .order("created_at");
  if (error) throw new Error(`Could not load accounts: ${error.message}`);
  return data.map(toAccount);
}

/** The account if it belongs to the signed-in user (RLS enforces it), else null. */
export async function findOwnAccount(accountId: string): Promise<GmailAccount | null> {
  const supabase = await getSupabaseForUser();
  const { data, error } = await supabase
    .from("connected_accounts")
    .select(COLUMNS)
    .eq("id", accountId)
    .maybeSingle();
  if (error) throw new Error(`Could not load account: ${error.message}`);
  return data ? toAccount(data) : null;
}

export async function saveGoogleAccount(input: {
  userId: string;
  email: string;
  scopes: string[];
  refreshToken: string;
}): Promise<string> {
  const { data, error } = await getSupabaseAdmin().rpc("save_google_account", {
    p_user_id: input.userId,
    p_email: input.email,
    p_scopes: input.scopes,
    p_refresh_token: input.refreshToken,
  });
  if (error) throw new Error(`Could not save account: ${error.message}`);
  return data;
}

export async function getRefreshToken(accountId: string): Promise<string | null> {
  const { data, error } = await getSupabaseAdmin().rpc("get_account_refresh_token", {
    p_account_id: accountId,
  });
  if (error) throw new Error(`Could not read token: ${error.message}`);
  return data ?? null;
}

export async function setAccountStatus(accountId: string, status: AccountStatus): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from("connected_accounts")
    .update({ status })
    .eq("id", accountId);
  if (error) throw new Error(`Could not update account: ${error.message}`);
}

/** Deletes the account; a trigger destroys its Vault secret. */
export async function deleteAccount(userId: string, accountId: string): Promise<void> {
  const { error } = await getSupabaseAdmin()
    .from("connected_accounts")
    .delete()
    .eq("id", accountId)
    .eq("user_id", userId);
  if (error) throw new Error(`Could not disconnect account: ${error.message}`);
}
