import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.daily(
  "full product sync",
  { hourUTC: 3, minuteUTC: 0 },
  internal.turn14.syncProducts.startSync
);

crons.interval(
  "inventory delta sync",
  { minutes: 15 },
  internal.turn14.syncInventory.syncDelta
);

// Fitment data changes rarely — weekly is enough and avoids overlapping with the
// nightly product sync (which holds pricing for hours on a big catalog).
crons.weekly(
  "fitments sync",
  { dayOfWeek: "sunday", hourUTC: 6, minuteUTC: 0 },
  internal.turn14.syncFitments.startSync
);

export default crons;
