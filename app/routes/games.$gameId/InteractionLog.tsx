import { useEffect, useRef } from "react";
import Subheading from "~/components/Subheading";
import { GameView, useGameLog } from "~/hooks/game/useGame";

const InteractionLog = ({ game }: { game: GameView }) => {
  const log = useGameLog();
  const logContainerRef = useRef<HTMLDivElement>(null);

  const usernameOf = (userId: string) =>
    game.players.find((player) => player.userId === userId)?.username;

  useEffect(() => {
    logContainerRef.current?.scrollTo({
      top: logContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [log.length]);

  return (
    <div className="h-64">
      <Subheading>Interaction Log</Subheading>
      <div
        className="flex h-full overflow-y-auto flex-col w-full border rounded-md gap-2 mt-2 p-2"
        ref={logContainerRef}
      >
        {log.map((entry) => (
          <p key={entry.id} className="text-xs flex items-center gap-1">
            <span className="font-bold">{usernameOf(entry.userId)}</span>
            {entry.message}
          </p>
        ))}
      </div>
    </div>
  );
};

export default InteractionLog;
