import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
    "autopilot_processor",
    { minutes: 5 }, // Run every 5 minutes
    internal.actions.autopilot.processBatch,
    {}
);

export default crons;
