import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { HEARTBEAT_INTERVAL_MS, presentUserIds } from "~/util/presence";

export const useHeartbeat = (lobbyId: Id<"lobbies">, enabled: boolean) => {
  const heartbeat = useMutation(api.lobby.presence.heartbeat);

  useEffect(() => {
    if (!enabled) return;
    const beat = () => {
      if (document.visibilityState === "visible") void heartbeat({ lobbyId });
    };
    beat();
    const interval = setInterval(beat, HEARTBEAT_INTERVAL_MS);
    document.addEventListener("visibilitychange", beat);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", beat);
    };
  }, [heartbeat, lobbyId, enabled]);
};

export const usePresentUserIds = (lobbyId: Id<"lobbies">) => {
  const sightings = useQuery(api.lobby.presence.list, { lobbyId });
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(
      () => setNow(Date.now()),
      HEARTBEAT_INTERVAL_MS / 2
    );
    return () => clearInterval(interval);
  }, []);

  return presentUserIds(sightings ?? [], Math.max(now, Date.now()));
};
