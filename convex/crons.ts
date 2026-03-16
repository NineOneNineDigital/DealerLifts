import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.daily(
  "full product sync",
  { hourUTC: 3, minuteUTC: 0 },
  internal.turn14.syncProducts.startSync,
);

crons.interval(
  "inventory delta sync",
  { minutes: 15 },
  internal.turn14.syncInventory.syncDelta,
);

export default crons;
