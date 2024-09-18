import Heading from "~/components/Heading";
import { useLobbyStore } from "~/hooks/lobby/useLobby";
import { useToast } from "~/hooks/useToast";
import { useUser } from "~/hooks/useUser";
import { readyUp } from "~/model/lobby";

const StartingScreen = () => {
  const { lobby } = useLobbyStore();
  const { user } = useUser();
  const { toast } = useToast();
  const readyCount = lobby?.readyMap ? Object.keys(lobby.readyMap).length : 0;
  const playerCount = lobby?.activeUsers.length;

  const handleReadyUp = async () => {
    if (!user || !lobby) {
      toast("Unable to get user or lobby data", "error");
      return;
    }
    await readyUp(lobby.id, user.uid);
  };

  if (!user) return null;
  return (
    <div className="flex flex-col gap-8 flex-1 p-4 items-center justify-center">
      <Heading>
        {readyCount} / {playerCount} players are ready
      </Heading>
      <button className="btn btn-primary" onClick={handleReadyUp}>
        Ready Up
      </button>
    </div>
  );
};

export default StartingScreen;
