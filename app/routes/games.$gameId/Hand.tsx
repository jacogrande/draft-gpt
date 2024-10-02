import { useEffect, useRef } from "react";
import { useGameStore } from "~/hooks/game/useGame";
import { useZoneRefs } from "~/hooks/game/useZoneRefs";
import { useUser } from "~/hooks/useUser";
import DraggableGameCard from "~/routes/games.$gameId/Components/DraggableGameCard";

const Hand = () => {
  const { game } = useGameStore();
  const { user } = useUser();
  const setHandRef = useZoneRefs((state) => state.setHandRef);
  const handRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHandRef(handRef);
  }, [handRef, setHandRef]);

  if (!game || !user) return null;
  return (
    <div
      className="flex gap-2 w-full border border-base-100 min-h-36 order-last"
      ref={handRef}
    >
      {game.decks[user.uid]?.hand?.map((card) => (
        <DraggableGameCard key={card.id} card={card} zone="hand" />
      ))}
    </div>
  );
};

export default Hand;
