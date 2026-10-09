import { GlobeAmericasIcon } from "@heroicons/react/16/solid";
import Page from "~/components/Page";
import { requireAuth } from "~/components/RequireAuth";
import { useJoinLobby } from "~/hooks/lobby/useJoinLobby";
import {
  LobbyView,
  useLobby,
  useLobbyId,
  viewerMember,
} from "~/hooks/lobby/useLobby";
import { useHeartbeat } from "~/hooks/lobby/usePresence";
import DraftFinished from "~/routes/lobbies.$lobbyId/DraftFinished";
import GeneratingScreen from "~/routes/lobbies.$lobbyId/GeneratingScreen";
import LobbyDetails from "~/routes/lobbies.$lobbyId/LobbyDetails";
import LobbyNotice from "~/routes/lobbies.$lobbyId/LobbyNotice";
import PackDisplayScreen from "~/routes/lobbies.$lobbyId/PackDisplayScreen";
import SettingInfo from "~/routes/lobbies.$lobbyId/SettingInfo";
import StartingScreen from "~/routes/lobbies.$lobbyId/StartingScreen";

const REFUSALS = {
  full: "This lobby is full.",
  "in-progress": "This draft is already in progress.",
  closed: "This lobby is closed.",
};

const Screen = ({ lobby }: { lobby: LobbyView }) => {
  if (lobby.status === "open") return <StartingScreen lobby={lobby} />;
  if (lobby.status === "generating") return <GeneratingScreen lobby={lobby} />;
  if (lobby.status === "drafting") return <PackDisplayScreen lobby={lobby} />;
  return <DraftFinished lobby={lobby} />;
};

const Lobby = () => {
  const lobbyId = useLobbyId();
  const lobby = useLobby();
  const admission = useJoinLobby(lobbyId);
  const isMember = Boolean(lobby && viewerMember(lobby));
  useHeartbeat(lobbyId, isMember);

  if (lobby === undefined || admission === "joining")
    return (
      <Page>
        <span className="loading loading-dots loading-lg"></span>
      </Page>
    );
  if (lobby === null) return <LobbyNotice>Lobby not found.</LobbyNotice>;
  if (admission !== "joined")
    return <LobbyNotice>{REFUSALS[admission]}</LobbyNotice>;
  if (!isMember || lobby.status === "closed")
    return <LobbyNotice>You are no longer in this lobby.</LobbyNotice>;
  return (
    <Page>
      <div className="flex flex-col flex-1 w-full h-full">
        <div className="flex justify-between items-start">
          <h1 className="text-2xl font-bold text-primary mb-8 flex items-center gap-2">
            {lobby.name}
            <GlobeAmericasIcon className="h-5 w-5" />
          </h1>
          <SettingInfo />
        </div>
        <div className="flex flex-1 justify-between ">
          <LobbyDetails lobby={lobby} />
          <Screen lobby={lobby} />
        </div>
      </div>
    </Page>
  );
};

export default requireAuth(Lobby);
