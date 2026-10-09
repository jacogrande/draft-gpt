import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useCallback } from "react";
import { usePresent, usePulse } from "~/hooks/usePulse";

export const useHeartbeat = (lobbyId: Id<"lobbies">, enabled: boolean) => {
  const heartbeat = useMutation(api.lobby.presence.heartbeat);
  const beat = useCallback(
    () => void heartbeat({ lobbyId }),
    [heartbeat, lobbyId]
  );
  usePulse(beat, enabled);
};

export const usePresentUserIds = (lobbyId: Id<"lobbies">) =>
  usePresent(useQuery(api.lobby.presence.list, { lobbyId }));
