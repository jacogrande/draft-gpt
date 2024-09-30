import { CheckIcon } from "@heroicons/react/16/solid";
import { IoCopy } from "react-icons/io5";
import Subheading from "~/components/Subheading";
import { useGameStore } from "~/hooks/game/useGame";
import { useToast } from "~/hooks/useToast";
import CardPreview from "~/routes/games.$gameId/Components/CardPreview";
import InteractionLog from "~/routes/games.$gameId/InteractionLog";
import LifeTotalEditor from "~/routes/games.$gameId/LifeTotalEditor";
import { REQUIRED_PLAYERS_FOR_GAME } from "~/util/constants";

const GameDetails = () => {
  const { game } = useGameStore();
  const { toast } = useToast();
  const allReady =
    game && Object.keys(game.readyMap).length === REQUIRED_PLAYERS_FOR_GAME;

  const onCopy = () => {
    try {
      navigator.clipboard.writeText(game?.name || "");
      toast("Game ID copied to clipboard", "success");
    } catch (error) {
      console.error("Failed to copy game ID:", error);
      toast("Failed to copy game ID", "error");
    }
  };

  const renderPlayerList = () => {
    if (!game) return null;
    return (
      <ul className="flex flex-col gap-2">
        <Subheading>Players</Subheading>
        {game.activeUsers.map((user) => (
          <li key={user.uid} className="flex items-center gap-2">
            {user.username}
            {game.readyMap[user.uid] && <CheckIcon className="h-4 w-4 text-success" />}
          </li>
        ))}
      </ul>
    );
  };

  const renderGameStatus = () => {
    if (!game) return null;
    return (
      <div className="flex flex-col gap-8 flex-1">
        <CardPreview />
        <ul className="flex flex-col gap-8">
          {game.activeUsers.map((activeUser) => (
            <li key={activeUser.uid} className="flex flex-col gap-2">
              <Subheading>{activeUser.username}</Subheading>
              <LifeTotalEditor userId={activeUser.uid} />
            </li>
          ))}
        </ul>
        <InteractionLog />
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4 min-w-48 rounded-lg p-4">
      <h1 className="text-2xl font-bold text-primary mb-8 flex items-center gap-2">
        {game?.name}
        <div className="tooltip" data-tip="Copy Game ID">
          <button onClick={onCopy}>
            <IoCopy className="h-5 w-5" />
          </button>
        </div>
      </h1>
      {allReady ? renderGameStatus() : renderPlayerList()}
    </div>
  );
};

export default GameDetails;
