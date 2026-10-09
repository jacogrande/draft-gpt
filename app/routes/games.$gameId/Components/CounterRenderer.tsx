import { useGameExtras } from "~/hooks/game/useGame";
import Counter from "~/routes/games.$gameId/Components/Counter";
import OpponentCounter from "~/routes/games.$gameId/Components/OpponentCounter";

const CounterRenderer = ({ viewerId }: { viewerId: string }) => {
  const { counters } = useGameExtras();
  return (
    <div className="absolute top-0 left-0">
      {counters.map((counter) =>
        counter.ownerId === viewerId ? (
          <Counter key={counter.id} counter={counter} />
        ) : (
          <OpponentCounter key={counter.id} counter={counter} />
        )
      )}
    </div>
  );
};

export default CounterRenderer;
