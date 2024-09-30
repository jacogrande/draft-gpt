import { useGameStore } from "~/hooks/game/useGame";
import { useUser } from "~/hooks/useUser";
import DraggableGameCard from "~/routes/games.$gameId/Components/DraggableGameCard";

const Hand = () => {
  const { game } = useGameStore();
  const { user } = useUser();

  if (!game || !user) return null;
  return (
    <div className="flex gap-2 w-full">
      {game.decks[user.uid]?.hand?.map((card) => (
        <DraggableGameCard key={card.id} card={card} />
      ))}
    </div>
  );
};

export default Hand;
