import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
    "autopilot_processor",
    { minutes: 5 }, // Run every 5 minutes
    internal.actions.autopilot.processBatch,
    {}
);

// Monthly credit reset - runs daily at midnight
crons.daily(
    "monthly_credit_reset",
    { hourUTC: 0, minuteUTC: 0 },
    internal.credits.resetMonthlyCredits,
    {}
);

// Stale extraction cleanup - runs every hour
crons.interval(
    "stale_extraction_cleanup",
    { hours: 1 },
    internal.extensions.cleanupStaleExtractions,
    {}
);

export default crons;
