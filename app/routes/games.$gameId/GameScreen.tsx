import { GameView, opponentSeat, viewerSeat } from "~/hooks/game/useGame";
import OpponentField from "~/routes/games.$gameId/Components/OpponentField";
import PlayerField from "~/routes/games.$gameId/Components/PlayerField";

const GameScreen = ({ game }: { game: GameView }) => {
  const viewer = viewerSeat(game);
  const opponent = opponentSeat(game);
  return (
    <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden flex flex-col gap-4">
      {opponent?.side && (
        <OpponentField ownerId={opponent.userId} side={opponent.side} />
      )}
      {viewer?.side && (
        <PlayerField ownerId={viewer.userId} side={viewer.side} />
      )}
    </div>
  );
};

export default GameScreen;
