import { useParams } from "@remix-run/react";
import { useEffect } from "react";
import Page from "~/components/Page";
import { useLobby } from "~/hooks/lobby/useLobby";
import useIdToken from "~/hooks/useIdToken";
import { useUser } from "~/hooks/useUser";
import LobbyDetails from "~/routes/lobbies.$lobbyId/LobbyDetails";
import { joinLobby } from "~/model/lobby";
import useHeartbeat from "~/hooks/lobby/useHeartbeat";
import StartingScreen from "~/routes/lobbies.$lobbyId/StartingScreen";

const Lobby = () => {
  //========= PARAM VALIDATION =========//
  const params = useParams();
  const lobbyId = params.lobbyId as string;
  const { user } = useUser();
  const { lobby } = useLobby(lobbyId);
  const idToken = useIdToken();
  useHeartbeat({ lobbyId });

  /**
   * Join the lobby once user is loaded
   */
  useEffect(() => {
    (async () => {
      if (!user) return;
      await joinLobby(user, lobbyId);
    })();
  }, [lobbyId, user]);

  /**
   * Attempt to leave the lobby when the user navigates away from the page
   * This isn't guaranteed to work, but it's a best effort
   * Hence the heartbeat system
   */
  useEffect(() => {
    const unloadListener = () => {
      console.log("leaving lobby");
      fetch("/api/leaveLobby", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: idToken,
          lobbyId,
        }),
      });
    };
    window.addEventListener("onhashchange", unloadListener);
    window.addEventListener("beforeunload", unloadListener);
    return () => {
      window.removeEventListener("beforeunload", unloadListener);
      window.removeEventListener("onhashchange", unloadListener);
    };
  }, [idToken, lobbyId]);

  return (
    <Page>
      <div className="flex flex-1 w-full h-full">
        <LobbyDetails lobby={lobby} />
        <StartingScreen />
      </div>
    </Page>
  );
};

export default Lobby;
