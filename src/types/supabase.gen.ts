export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      activity_log: {
        Row: {
          action: Database["public"]["Enums"]["activity_action"];
          created_at: string;
          email_id: string | null;
          id: number;
          recipient_email: string | null;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          action: Database["public"]["Enums"]["activity_action"];
          created_at?: string;
          email_id?: string | null;
          id?: never;
          recipient_email?: string | null;
          user_id: string;
        };
        Update: {
          action?: Database["public"]["Enums"]["activity_action"];
          created_at?: string;
          email_id?: string | null;
          id?: never;
          recipient_email?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "activity_log_email_id_fkey";
            columns: ["email_id"];
            isOneToOne: false;
            referencedRelation: "emails";
            referencedColumns: ["id"];
          },
        ];
      };
      ai_check_events: {
        Row: {
          accepted: number;
          created_at: string;
          dismissed: number;
          email_id: string | null;
          finding_types: string[];
          id: string;
          latency_ms: number | null;
          model: string | null;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          accepted?: number;
          created_at?: string;
          dismissed?: number;
          email_id?: string | null;
          finding_types?: string[];
          id?: string;
          latency_ms?: number | null;
          model?: string | null;
          user_id: string;
        };
        Update: {
          accepted?: number;
          created_at?: string;
          dismissed?: number;
          email_id?: string | null;
          finding_types?: string[];
          id?: string;
          latency_ms?: number | null;
          model?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ai_check_events_email_id_fkey";
            columns: ["email_id"];
            isOneToOne: false;
            referencedRelation: "emails";
            referencedColumns: ["id"];
          },
        ];
      };
      connected_accounts: {
        Row: {
          created_at: string;
          email: string;
          id: string;
          provider: string;
          scopes: string[];
          status: Database["public"]["Enums"]["account_status"];
          updated_at: string;
          user_id: string;
          vault_secret_id: string | null;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          email: string;
          id?: string;
          provider: string;
          scopes?: string[];
          status?: Database["public"]["Enums"]["account_status"];
          updated_at?: string;
          user_id: string;
          vault_secret_id?: string | null;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
          provider?: string;
          scopes?: string[];
          status?: Database["public"]["Enums"]["account_status"];
          updated_at?: string;
          user_id?: string;
          vault_secret_id?: string | null;
        };
        Relationships: [];
      };
      emails: {
        Row: {
          account_id: string | null;
          attempt_count: number;
          bcc_recipients: NonNullable<Json>;
          body_encrypted: string | null;
          cc_recipients: NonNullable<Json>;
          created_at: string;
          failure_reason: string | null;
          findings_accepted: number;
          findings_count: number;
          id: string;
          provider_message_id: string | null;
          safe_send: boolean;
          send_at: string;
          sent_at: string | null;
          status: Database["public"]["Enums"]["email_status"];
          subject: string;
          to_recipients: NonNullable<Json>;
          updated_at: string;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          account_id?: string | null;
          attempt_count?: number;
          bcc_recipients?: NonNullable<Json>;
          body_encrypted?: string | null;
          cc_recipients?: NonNullable<Json>;
          created_at?: string;
          failure_reason?: string | null;
          findings_accepted?: number;
          findings_count?: number;
          id?: string;
          provider_message_id?: string | null;
          safe_send?: boolean;
          send_at: string;
          sent_at?: string | null;
          status?: Database["public"]["Enums"]["email_status"];
          subject?: string;
          to_recipients: NonNullable<Json>;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          account_id?: string | null;
          attempt_count?: number;
          bcc_recipients?: NonNullable<Json>;
          body_encrypted?: string | null;
          cc_recipients?: NonNullable<Json>;
          created_at?: string;
          failure_reason?: string | null;
          findings_accepted?: number;
          findings_count?: number;
          id?: string;
          provider_message_id?: string | null;
          safe_send?: boolean;
          send_at?: string;
          sent_at?: string | null;
          status?: Database["public"]["Enums"]["email_status"];
          subject?: string;
          to_recipients?: NonNullable<Json>;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "emails_account_id_user_id_fkey";
            columns: ["account_id", "user_id"];
            isOneToOne: false;
            referencedRelation: "connected_accounts";
            referencedColumns: ["id", "user_id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          default_delay_seconds: number;
          display_name: string | null;
          onboarded_at: string | null;
          open_tracking: boolean;
          updated_at: string;
          user_id: string;
        };
        ComputedFields: never;
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          default_delay_seconds?: number;
          display_name?: string | null;
          onboarded_at?: string | null;
          open_tracking?: boolean;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          default_delay_seconds?: number;
          display_name?: string | null;
          onboarded_at?: string | null;
          open_tracking?: boolean;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      safe_send_messages: {
        Row: {
          content_deleted_at: string | null;
          created_at: string;
          email_id: string;
          expires_at: string;
          id: string;
          key_ref: string | null;
          storage_path: string;
          user_id: string;
          withdrawn_at: string | null;
        };
        ComputedFields: never;
        Insert: {
          content_deleted_at?: string | null;
          created_at?: string;
          email_id: string;
          expires_at: string;
          id?: string;
          key_ref?: string | null;
          storage_path: string;
          user_id: string;
          withdrawn_at?: string | null;
        };
        Update: {
          content_deleted_at?: string | null;
          created_at?: string;
          email_id?: string;
          expires_at?: string;
          id?: string;
          key_ref?: string | null;
          storage_path?: string;
          user_id?: string;
          withdrawn_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "safe_send_messages_email_id_fkey";
            columns: ["email_id"];
            isOneToOne: true;
            referencedRelation: "emails";
            referencedColumns: ["id"];
          },
        ];
      };
      safe_send_recipients: {
        Row: {
          created_at: string;
          first_opened_at: string | null;
          id: string;
          last_opened_at: string | null;
          message_id: string;
          open_count: number;
          recipient_email: string;
          token_hash: string;
          user_id: string;
          withdrawn_at: string | null;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          first_opened_at?: string | null;
          id?: string;
          last_opened_at?: string | null;
          message_id: string;
          open_count?: number;
          recipient_email: string;
          token_hash: string;
          user_id: string;
          withdrawn_at?: string | null;
        };
        Update: {
          created_at?: string;
          first_opened_at?: string | null;
          id?: string;
          last_opened_at?: string | null;
          message_id?: string;
          open_count?: number;
          recipient_email?: string;
          token_hash?: string;
          user_id?: string;
          withdrawn_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "safe_send_recipients_message_id_fkey";
            columns: ["message_id"];
            isOneToOne: false;
            referencedRelation: "safe_send_messages";
            referencedColumns: ["id"];
          },
        ];
      };
      waitlist: {
        Row: {
          created_at: string;
          did_survey: boolean;
          email: string;
          id: string;
          source: string | null;
          survey_completed_at: string | null;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          did_survey?: boolean;
          email: string;
          id?: string;
          source?: string | null;
          survey_completed_at?: string | null;
        };
        Update: {
          created_at?: string;
          did_survey?: boolean;
          email?: string;
          id?: string;
          source?: string | null;
          survey_completed_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      waitlist_stats: {
        Row: {
          did_survey: number | null;
          signups_last_7_days: number | null;
          survey_rate_pct: number | null;
          total_signups: number | null;
        };
        ComputedFields: never;
        Relationships: [];
      };
    };
    Functions: {
      claim_emails: {
        Args: { p_email_id?: string; p_limit?: number; p_user_id?: string };
        Returns: {
          account_id: string | null;
          attempt_count: number;
          bcc_recipients: NonNullable<Json>;
          body_encrypted: string | null;
          cc_recipients: NonNullable<Json>;
          created_at: string;
          failure_reason: string | null;
          findings_accepted: number;
          findings_count: number;
          id: string;
          provider_message_id: string | null;
          safe_send: boolean;
          send_at: string;
          sent_at: string | null;
          status: Database["public"]["Enums"]["email_status"];
          subject: string;
          to_recipients: NonNullable<Json>;
          updated_at: string;
          user_id: string;
        }[];
        SetofOptions: {
          from: "*";
          to: "emails";
          isOneToOne: false;
          isSetofReturn: true;
        };
      };
      configure_dispatcher: { Args: { p_secret: string; p_url: string }; Returns: undefined };
      create_safe_send: {
        Args: {
          p_data_key: string;
          p_email_id: string;
          p_recipients: Json;
          p_storage_path: string;
          p_user_id: string;
        };
        Returns: {
          expires_at: string;
          message_id: string;
        }[];
      };
      dashboard_stats: {
        Args: { p_since: string };
        Returns: {
          caught: number;
          fixed: number;
          safe_send_opened: number;
          safe_send_people: number;
          sent: number;
          waiting: number;
          withdrawable: number;
        }[];
      };
      get_account_refresh_token: { Args: { p_account_id: string }; Returns: string };
      get_safe_send_key: { Args: { p_message_id: string }; Returns: string };
      invoke_dispatcher: { Args: Record<PropertyKey, never>; Returns: undefined };
      open_safe_send: {
        Args: { p_token_hash: string };
        Returns: {
          content_deleted_at: string;
          expires_at: string;
          message_id: string;
          recipient_email: string;
          recipient_id: string;
          sender_email: string;
          sender_name: string;
          sent_at: string;
          storage_path: string;
          subject: string;
          withdrawn_at: string;
        }[];
      };
      save_google_account: {
        Args: { p_email: string; p_refresh_token: string; p_scopes: string[]; p_user_id: string };
        Returns: string;
      };
      shred_safe_send: {
        Args: { p_limit?: number; p_message_id?: string };
        Returns: {
          email_id: string;
          id: string;
          storage_path: string;
          user_id: string;
        }[];
      };
    };
    Enums: {
      account_status: "active" | "revoked" | "error";
      activity_action:
        "held" | "edited" | "sent" | "cancelled" | "failed" | "withdrawn" | "expired" | "opened";
      email_status: "held" | "sending" | "sent" | "cancelled" | "failed";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    keyof (DefaultSchema["Tables"] & DefaultSchema["Views"]) | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      account_status: ["active", "revoked", "error"],
      activity_action: ["held", "edited", "sent", "cancelled", "failed", "withdrawn", "expired", "opened"],
      email_status: ["held", "sending", "sent", "cancelled", "failed"],
    },
  },
} as const;
