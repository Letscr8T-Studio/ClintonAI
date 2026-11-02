import type { ActivityAction, EmailStatus } from "./database";

/** The four numbers at the top of Home. Counts only, for the signed-in user. */
export type DashboardStats = {
  sent: number;
  caught: number;
  fixed: number;
  safeSendPeople: number;
  safeSendOpened: number;
  /** Right now: still in the Smart Delay countdown. */
  waiting: number;
  /** Right now: Safe Send emails that can still be withdrawn. */
  withdrawable: number;
};

/** An email Clinton flagged something on. Kinds are finding types, never the email text. */
export type CaughtEmail = {
  id: string;
  subject: string;
  status: EmailStatus;
  caught: number;
  fixed: number;
  kinds: string[];
  createdAt: string;
};

export type ActivityItem = {
  id: number;
  action: ActivityAction;
  recipient: string | null;
  /** Null when the email row no longer exists. */
  subject: string | null;
  at: string;
};
