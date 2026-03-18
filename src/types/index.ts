// Shared type definitions for QuickConnect

export type BatchStatus =
  | "draft"
  | "running"
  | "paused"
  | "completed"
  | "cancelled"
  | "daily_limit_reached"
  | "weekly_limit_reached"
  | "error_disconnected";

export type LeadStatus =
  | "pending"
  | "sent"
  | "accepted"
  | "replied"
  | "already_connected"
  | "error"
  | "cancelled";

export type RateTier = "conservative" | "normal" | "aggressive";

export interface BatchStats {
  sent: number;
  accepted: number;
  replied: number;
  alreadyConnected: number;
  errors: number;
  pending: number;
}

export type ActivityType =
  | "batch_created"
  | "outreach_started"
  | "connection_sent"
  | "connection_accepted"
  | "reply_received"
  | "error"
  | "batch_paused"
  | "batch_resumed"
  | "batch_cancelled"
  | "batch_completed"
  | "linkedin_disconnected"
  | "linkedin_reconnected"
  | "rate_limit_hit"
  | "weekly_limit_warning";
