export enum EnvironmentEnum {
  DEVELOPMENT = "development",
  PRODUCTION = "production",
}

export enum PikPakActionTypeEnum {
  MANUAL = "manual",
  TELEGRAM_WEBHOOK = "telegram_webhook",
}

export enum ActionStatusEnum {
  QUEUED = "queued",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  WAITING = "waiting",
  PENDING = "pending",
}

export enum ActionConclusionEnum {
  SUCCESS = "success",
  FAILURE = "failure",
  NEUTRAL = "neutral",
  CANCELLED = "cancelled",
  SKIPPED = "skipped",
  TIMED_OUT = "timed_out",
  ACTION_REQUIRED = "action_required",
}
