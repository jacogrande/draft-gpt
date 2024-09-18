import Heading from "~/components/Heading";
import { useLobbyStore } from "~/hooks/lobby/useLobby";
import { useToast } from "~/hooks/useToast";
import { useUser } from "~/hooks/useUser";
import { readyUp } from "~/model/lobby";
import WorldbuildingChat from "~/routes/lobbies.$lobbyId/WorldbuildingChat";

const StartingScreen = () => {
  const { lobby } = useLobbyStore();
  const { user } = useUser();
  const { toast } = useToast();

  const handleReadyUp = async () => {
    if (!user || !lobby) {
      toast("Unable to get user or lobby data", "error");
      return;
    }
    await readyUp(lobby.id, user.uid);
  };

  if (!user || !lobby) return null;
  const readyCount = lobby.readyMap ? Object.keys(lobby.readyMap).length : 0;
  const isReady = lobby.readyMap && lobby.readyMap[user.uid];
  const playerCount = lobby.activeUsers.length;
  const allReady = readyCount === playerCount;
  return (
    <div className="flex flex-col gap-8 flex-1 items-center justify-center relative">
      <Heading>
        {readyCount} / {playerCount} players are ready
      </Heading>
      {!isReady && (
        <button className="btn btn-primary" onClick={handleReadyUp}>
          Ready Up
        </button>
      )}
      {allReady && (
        <button className="btn btn-primary" onClick={handleReadyUp}>
          Start Game
        </button>
      )}
      <WorldbuildingChat />
    </div>
  );
};

export default StartingScreen;
