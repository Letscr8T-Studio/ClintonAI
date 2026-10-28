// Supabase schema types. The source of truth is supabase/migrations/; the types are generated
// from the local database into supabase.gen.ts (never edit that file by hand):
//   npm run db:start && npm run db:types
// CI fails if the generated file drifts from the migrations.

import type { Database, Enums, Tables } from "./supabase.gen";

export type { Database, Enums, Tables };

export type WaitlistRow = Tables<"waitlist">;
export type Profile = Tables<"profiles">;
export type ConnectedAccount = Tables<"connected_accounts">;
export type EmailRow = Tables<"emails">;
export type SafeSendMessage = Tables<"safe_send_messages">;
export type SafeSendRecipient = Tables<"safe_send_recipients">;
export type AiCheckEvent = Tables<"ai_check_events">;
export type ActivityEntry = Tables<"activity_log">;

export type EmailStatus = Enums<"email_status">;
export type AccountStatus = Enums<"account_status">;
export type ActivityAction = Enums<"activity_action">;
