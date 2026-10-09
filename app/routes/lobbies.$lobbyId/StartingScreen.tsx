import { api } from "@convex/_generated/api";
import { useNavigate } from "@remix-run/react";
import { useMutation } from "convex/react";
import Heading from "~/components/Heading";
import { LobbyView, viewerMember } from "~/hooks/lobby/useLobby";
import { useToast } from "~/hooks/useToast";
import WorldbuildingChat from "~/routes/lobbies.$lobbyId/WorldbuildingChat";
import { rejectionCode } from "~/util/rejection";

const START_REFUSALS: Record<string, string> = {
  NEED_TWO_PLAYERS: "A draft needs at least two players",
  PLAYERS_NOT_READY: "Everyone needs to ready up first",
};

const StartingScreen = ({ lobby }: { lobby: LobbyView }) => {
  const setReady = useMutation(api.lobby.lobbies.setReady);
  const startDraft = useMutation(api.draft.start.startDraft);
  const leave = useMutation(api.lobby.lobbies.leave);
  const navigate = useNavigate();
  const { toast } = useToast();

  const lobbyId = lobby.id;
  const isReady = viewerMember(lobby)?.ready ?? false;
  const readyCount = lobby.members.filter((member) => member.ready).length;
  const canStart =
    lobby.members.length >= 2 && readyCount === lobby.members.length;

  const handleStart = async () => {
    try {
      await startDraft({ lobbyId });
    } catch (error) {
      const reason = START_REFUSALS[rejectionCode(error) ?? ""];
      toast(reason ?? "Unable to start the draft", "error");
    }
  };

  const handleLeave = async () => {
    await leave({ lobbyId });
    navigate("/lobbies");
  };

  return (
    <div className="flex flex-col gap-8 flex-1 items-center justify-center relative">
      <Heading>
        {readyCount} / {lobby.members.length} players are ready
      </Heading>
      <div className="flex gap-2">
        <button
          className="btn btn-primary"
          onClick={() => setReady({ lobbyId, ready: !isReady })}
        >
          {isReady ? "Not Ready" : "Ready Up"}
        </button>
        {canStart && (
          <button className="btn btn-primary" onClick={handleStart}>
            Start Draft
          </button>
        )}
        <button className="btn btn-ghost" onClick={handleLeave}>
          Leave Lobby
        </button>
      </div>
      <WorldbuildingChat lobby={lobby} />
    </div>
  );
};

export default StartingScreen;
