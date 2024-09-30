import Subheading from "~/components/Subheading";
import { useGameStore } from "~/hooks/game/useGame";

const InteractionLog = () => {
  const { game } = useGameStore();

  return (
    <div className="flex-1">
      <Subheading>Interaction Log</Subheading>
      <div className="flex flex-col w-full h-full border rounded-md gap-4 mt-2 overflow-y-auto">
        {game?.log?.map((log) => (
          <p key={log.timestamp.toDate().toString()} className="text-xs">
            {log.username}: {log.message}
          </p>
        ))}
      </div>
    </div>
  );
};

export default InteractionLog;
