import { GameView, opponentSeat, viewerSeat } from "~/hooks/game/useGame";
import CounterRenderer from "~/routes/games.$gameId/Components/CounterRenderer";
import OpponentField from "~/routes/games.$gameId/Components/OpponentField";
import PlayerField from "~/routes/games.$gameId/Components/PlayerField";

const GameScreen = ({ game }: { game: GameView }) => {
  const viewer = viewerSeat(game);
  const opponent = opponentSeat(game);
  return (
    <div className="flex-1 flex flex-col">
      {opponent?.side && (
        <OpponentField ownerId={opponent.userId} side={opponent.side} />
      )}
      {viewer?.side && (
        <PlayerField ownerId={viewer.userId} side={viewer.side} />
      )}
      <CounterRenderer viewerId={game.viewerId} />
    </div>
  );
};

export default GameScreen;
