import { cronJobs } from "convex/server";

const crons = cronJobs();

// Cron jobs removed - autopilot processor no longer needed
// Future: Add scheduled outreach processing here

export default crons;
