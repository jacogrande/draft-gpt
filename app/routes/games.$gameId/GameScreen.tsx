import CounterRenderer from "~/routes/games.$gameId/Components/CounterRenderer";
import OpponentField from "~/routes/games.$gameId/Components/OpponentField";
import PlayerField from "~/routes/games.$gameId/Components/PlayerField";

const GameScreen = () => {
  return (
    <div className="flex-1 flex flex-col">
      <OpponentField />
      <PlayerField />
      <CounterRenderer />
    </div>
  );
};

export default GameScreen;
