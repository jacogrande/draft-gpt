import Subheading from "~/components/Subheading";
import { useGameStore } from "~/hooks/game/useGame";
import { getCardNameFromGame } from "~/util/getCardNameFromGame";

const InteractionLog = () => {
  const { game } = useGameStore();

  const getUsername = (uid: string) => {
    if (!game) return null;
    const username = game.activeUsers.find(
      (user) => user.uid === uid
    )?.username;
    return username;
  };

  return (
    <div className="h-64">
      <Subheading>Interaction Log</Subheading>
      <div className="flex h-full overflow-y-auto flex-col w-full border rounded-md gap-2 mt-2 p-2">
        {game?.log?.map((log) => (
          <p
            key={
              log.timestamp.nanoseconds + log.uid + log.message + Math.random()
            }
            className="text-xs flex items-center gap-2"
          >
            {getUsername(log.uid)}: {log.message}{" "}
            {log.targetCard && getCardNameFromGame(log.targetCard, game)}
          </p>
        ))}
      </div>
    </div>
  );
};

export default InteractionLog;
