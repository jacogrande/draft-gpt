import { authTables } from "@convex-dev/auth/server";
import { defineSchema } from "convex/server";
import { deckTables } from "./deck/tables";
import { draftTables } from "./draft/tables";
import { gameTables } from "./game/tables";
import { identityTables } from "./identity/tables";
import { lobbyTables } from "./lobby/tables";

export default defineSchema({
  ...authTables,
  ...identityTables,
  ...lobbyTables,
  ...draftTables,
  ...deckTables,
  ...gameTables,
});
