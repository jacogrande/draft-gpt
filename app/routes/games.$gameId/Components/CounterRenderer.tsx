import { useGameStore } from "~/hooks/game/useGame";
import { useUser } from "~/hooks/useUser";
import Counter from "~/routes/games.$gameId/Components/Counter";
import OpponentCounter from "~/routes/games.$gameId/Components/OpponentCounter";

const CounterRenderer = () => {
  const { game } = useGameStore();
  const { user } = useUser();
  if (!game) return null;

  const playerCounters = game.counters?.filter(
    (counter) => counter.ownerId === user?.uid
  );
  const opponentCounters = game.counters?.filter(
    (counter) => counter.ownerId !== user?.uid
  );

  return (
    <div className="absolute top-0 left-0">
      {playerCounters?.map((counter) => (
        <Counter key={counter.id} counter={counter} />
      ))}
      {opponentCounters?.map((counter) => (
        <OpponentCounter key={counter.id} counter={counter} />
      ))}
    </div>
  );
};

export default CounterRenderer;
