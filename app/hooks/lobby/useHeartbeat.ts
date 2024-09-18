import { useEffect } from "react";
import { useUser } from "~/hooks/useUser";
import { cleanupLobbyUsers, sendPulse } from "~/model/lobby";

export const HEARTBEAT_INTERVAL = 20 * 1000;
export const CLEANUP_INTERVAL = 0.5 * 60 * 1000; // 1 minute
export const MAX_IDLE_TIME = 3 * 60 * 1000; // 3 minutes

/**
 * Hook to manage lobby heartbeats
 */
const useHeartbeat = ({ lobbyId }: { lobbyId: string }) => {
  const { user } = useUser();

  /*
   * Periodically updated the current user's `lastSeen` timestamp in the lobby
   * as well as the lobby's `lastActive` timestamp
   */
  useEffect(() => {
    const interval = setInterval(async () => {
      if (!user) return;
      await sendPulse(user, lobbyId);
    }, HEARTBEAT_INTERVAL);
    return () => clearInterval(interval);
  }, [user, lobbyId]);

  /*
   * Periodically clean up the lobby by removing users
   * who haven't been active within the last CLEANUP_INTERVAL
   */
  useEffect(() => {
    const interval = setInterval(async () => {
      await cleanupLobbyUsers(lobbyId);
    }, CLEANUP_INTERVAL);
    return () => clearInterval(interval);
  }, [lobbyId]);
};

export default useHeartbeat;
