import { useGameStore } from "~/hooks/game/useGame";
import OpponentField from "~/routes/games.$gameId/Components/OpponentField";
import PlayerField from "~/routes/games.$gameId/Components/PlayerField";

const GameScreen = () => {
  const { game } = useGameStore();

  return (
    <div className="flex-1 flex flex-col">
      <OpponentField />
      <PlayerField />
    </div>
  );
};

export default GameScreen;
