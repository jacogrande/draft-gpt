import { useEffect, useRef } from "react";
import Subheading from "~/components/Subheading";
import { useGameStore } from "~/hooks/game/useGame";
import { getCardNameFromGame } from "~/util/getCardNameFromGame";

const InteractionLog = () => {
  const { game } = useGameStore();
  const logContainerRef = useRef<HTMLDivElement>(null);

  const getUsername = (uid: string) => {
    if (!game) return null;
    const username = game.activeUsers.find(
      (user) => user.uid === uid
    )?.username;
    return username;
  };

  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTo({
        top: logContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [game?.log]);

  return (
    <div className="h-64">
      <Subheading>Interaction Log</Subheading>
      <div
        className="flex h-full overflow-y-auto flex-col w-full border rounded-md gap-2 mt-2 p-2"
        ref={logContainerRef}
      >
        {game?.log?.map((log) => (
          <p
            key={
              log.timestamp.nanoseconds + log.uid + log.message + Math.random()
            }
            className="text-xs flex items-center gap-1"
          >
            <span className="font-bold">{getUsername(log.uid)}</span>
            {log.message}{" "}
            {log.targetCard && getCardNameFromGame(log.targetCard, game)}
          </p>
        ))}
      </div>
    </div>
  );
};

export default InteractionLog;
