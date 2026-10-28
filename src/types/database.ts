// Supabase schema types. Keep in step with supabase/migrations/.
// Once the Supabase CLI is linked, regenerate with:
//   npx supabase gen types typescript --linked > src/types/database.ts

export type WaitlistRow = {
  id: string;
  email: string;
  source: string | null;
  did_survey: boolean;
  survey_completed_at: string | null;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      waitlist: {
        Row: WaitlistRow;
        Insert: Partial<WaitlistRow> & Pick<WaitlistRow, "email">;
        Update: Partial<WaitlistRow>;
        Relationships: [];
      };
    };
    Views: {
      waitlist_stats: {
        Row: {
          total_signups: number;
          did_survey: number;
          survey_rate_pct: number | null;
          signups_last_7_days: number;
        };
        Relationships: [];
      };
    };
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
