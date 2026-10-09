import { api } from "@convex/_generated/api";
import { CheckIcon } from "@heroicons/react/16/solid";
import { useNavigate } from "@remix-run/react";
import { useMutation } from "convex/react";
import { IoCopy } from "react-icons/io5";
import Subheading from "~/components/Subheading";
import { GamePlayer, GameView } from "~/hooks/game/useGame";
import { usePresentPlayerIds } from "~/hooks/game/useGamePresence";
import { useToast } from "~/hooks/useToast";
import CardPreview from "~/routes/games.$gameId/Components/CardPreview";
import InteractionLog from "~/routes/games.$gameId/InteractionLog";
import LifeTotalEditor from "~/routes/games.$gameId/LifeTotalEditor";

const PlayerName = ({ player, away }: { player: GamePlayer; away: boolean }) => (
  <span className="flex items-center gap-2" data-away={away}>
    <span className={away ? "opacity-50" : ""}>{player.username}</span>
    {away && <span className="text-xs italic opacity-50">away</span>}
  </span>
);

const GameDetails = ({ game }: { game: GameView }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const leave = useMutation(api.game.games.leave);
  const present = usePresentPlayerIds(game.id);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(game.code);
      toast("Game ID copied to clipboard", "success");
    } catch {
      toast("Failed to copy game ID", "error");
    }
  };

  const handleLeave = async () => {
    await leave({ gameId: game.id });
    navigate("/");
  };

  const playerList = (
    <ul className="flex flex-col gap-2">
      <Subheading>Players</Subheading>
      {game.players.map((player) => (
        <li key={player.userId} className="flex items-center gap-2">
          <PlayerName player={player} away={!present.has(player.userId)} />
          {player.ready && <CheckIcon className="h-4 w-4 text-success" />}
        </li>
      ))}
      <button className="btn btn-ghost btn-sm mt-4" onClick={handleLeave}>
        Leave game
      </button>
    </ul>
  );

  const gameStatus = (
    <div className="flex flex-col gap-8 flex-1">
      <CardPreview />
      <ul className="flex flex-col gap-8">
        {game.players.map((player) => (
          <li key={player.userId} className="flex flex-col gap-2">
            <Subheading>
              <PlayerName player={player} away={!present.has(player.userId)} />
            </Subheading>
            <LifeTotalEditor
              player={player}
              editable={player.userId === game.viewerId}
            />
          </li>
        ))}
      </ul>
      <InteractionLog game={game} />
    </div>
  );

  return (
    <div className="flex flex-col gap-4 h-full w-[264px] rounded-lg p-4">
      <h1 className="text-2xl font-bold text-primary mb-8 flex items-center gap-2">
        {game.code}
        <div className="tooltip" data-tip="Copy Game ID">
          <button onClick={onCopy} aria-label="Copy Game ID">
            <IoCopy className="h-5 w-5" />
          </button>
        </div>
      </h1>
      {game.status === "playing" ? gameStatus : playerList}
    </div>
  );
};

export default GameDetails;
