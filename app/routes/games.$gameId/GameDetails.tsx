import { IoCopy } from "react-icons/io5";
import { useGameStore } from "~/hooks/game/useGame";
import { useToast } from "~/hooks/useToast";

const GameDetails = () => {
  const { game } = useGameStore();
  const { toast } = useToast();

  const onCopy = () => {
    try {
      navigator.clipboard.writeText(game?.name || "");
      toast("Game ID copied to clipboard", "success");
    } catch (error) {
      console.error("Failed to copy game ID:", error);
      toast("Failed to copy game ID", "error");
    }
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
    </div>
  );
};

export default GameDetails;
