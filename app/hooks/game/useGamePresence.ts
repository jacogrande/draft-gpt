import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useCallback } from "react";
import { usePresent, usePulse } from "~/hooks/usePulse";

export const useGameHeartbeat = (gameId: Id<"games">, enabled: boolean) => {
  const heartbeat = useMutation(api.game.presence.heartbeat);
  const beat = useCallback(
    () => void heartbeat({ gameId }),
    [heartbeat, gameId]
  );
  usePulse(beat, enabled);
};

export const usePresentPlayerIds = (gameId: Id<"games">) =>
  usePresent(useQuery(api.game.presence.list, { gameId }));
