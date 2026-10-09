import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useQuery } from "convex/react";

export const useAbsences = (lobbyId: Id<"lobbies">) =>
  useQuery(api.draft.absences.list, { lobbyId }) ?? [];

export type Absence = ReturnType<typeof useAbsences>[number];
