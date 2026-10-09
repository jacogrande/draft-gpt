import { useEffect, useState } from "react";
import { HEARTBEAT_INTERVAL_MS, presentUserIds } from "~/util/presence";

export const usePulse = (beat: () => void, enabled: boolean) => {
  useEffect(() => {
    if (!enabled) return;
    const pulse = () => {
      if (document.visibilityState === "visible") beat();
    };
    pulse();
    const interval = setInterval(pulse, HEARTBEAT_INTERVAL_MS);
    document.addEventListener("visibilitychange", pulse);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", pulse);
    };
  }, [beat, enabled]);
};

type Sighting = { userId: string; lastSeenAt: number };

export const usePresent = (sightings: Sighting[] | undefined) => {
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
