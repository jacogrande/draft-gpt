import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.daily(
  "close abandoned lobbies",
  { hourUTC: 9, minuteUTC: 0 },
  internal.lobby.cleanup.closeAbandoned
);

crons.daily(
  "close abandoned games",
  { hourUTC: 9, minuteUTC: 30 },
  internal.game.cleanup.closeAbandoned
);

export default crons;
