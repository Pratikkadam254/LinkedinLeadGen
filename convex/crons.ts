import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "process_outreach",
  { minutes: 2 },
  internal.actions.outreach.processOutreach,
  {}
);

crons.interval(
  "check_connections",
  { minutes: 10 },
  internal.actions.monitoring.checkConnections,
  {}
);

crons.interval(
  "detect_replies",
  { minutes: 15 },
  internal.actions.monitoring.detectReplies,
  {}
);

crons.interval(
  "health_check",
  { minutes: 30 },
  internal.actions.monitoring.healthCheckAll,
  {}
);

crons.interval(
  "auto_resume",
  { minutes: 5 },
  internal.actions.monitoring.autoResume,
  {}
);

crons.cron(
  "reset_daily_counts",
  "0 0 * * *",
  internal.actions.monitoring.resetDailyCounts,
  {}
);

crons.cron(
  "reset_weekly_counts",
  "0 0 * * 1",
  internal.actions.monitoring.resetWeeklyCounts,
  {}
);

export default crons;
