import { GlobeAmericasIcon } from "@heroicons/react/16/solid";
import { useParams } from "@remix-run/react";
import { useEffect } from "react";
import { verifySession } from "~/.server/session";
import Page from "~/components/Page";
import useHeartbeat from "~/hooks/lobby/useHeartbeat";
import { useLobby } from "~/hooks/lobby/useLobby";
import { usePacks } from "~/hooks/lobby/usePacks";
import useSetting from "~/hooks/lobby/useSetting";
import useIdToken from "~/hooks/useIdToken";
import { useUser } from "~/hooks/useUser";
import { joinLobby } from "~/model/lobby";
import DraftStartingScreen from "~/routes/lobbies.$lobbyId/DraftStartingScreen";
import LobbyDetails from "~/routes/lobbies.$lobbyId/LobbyDetails";
import SettingInfo from "~/routes/lobbies.$lobbyId/SettingInfo";
import StartingScreen from "~/routes/lobbies.$lobbyId/StartingScreen";

export const loader = verifySession;

const Lobby = () => {
  //========= PARAM VALIDATION =========//
  const params = useParams();
  const lobbyId = params.lobbyId as string;
  const { user } = useUser();
  const { lobby, loading } = useLobby(lobbyId); // setup lobby listener
  useSetting(lobbyId); // setup setting listener
  const packs = usePacks(lobbyId); // setup pack listener
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
    if (!idToken || !lobbyId) return;
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

  const getCurrentScreen = () => {
    if (!lobby) return null;
    const { draftStarted } = lobby;
    if (!draftStarted) return <StartingScreen />;
    if (packs.length === 0) return <DraftStartingScreen />;
    // return <DraftStartingScreen />;
  };

  if (loading)
    return (
      <Page>
        <span className="loading loading-dots loading-lg"></span>
      </Page>
    );
  return (
    <Page>
      <div className="flex flex-col flex-1 w-full h-full">
        <div className="flex justify-between items-center items-start">
          <h1 className="text-2xl font-bold text-primary mb-8 flex items-center gap-2">
            {lobby?.name}
            <GlobeAmericasIcon className="h-5 w-5" />
          </h1>
          <SettingInfo />
        </div>
        <div className="flex flex-1 justify-between ">
          <LobbyDetails />
          {getCurrentScreen()}
        </div>
      </div>
    </Page>
  );
};

export default Lobby;
