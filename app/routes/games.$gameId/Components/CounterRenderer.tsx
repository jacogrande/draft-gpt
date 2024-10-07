import { useGameStore } from "~/hooks/game/useGame";
import Counter from "~/routes/games.$gameId/Components/Counter";

const CounterRenderer = () => {
  const { game } = useGameStore();

  if (!game) return null;
  return (
    <div className="absolute top-0 left-0">
      {game.counters?.map((counter) => (
        <Counter key={counter.id} counter={counter} />
      ))}
    </div>
  );
};

export default CounterRenderer;
