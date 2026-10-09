import { useEffect, useRef } from "react";
import { GameCard } from "~/hooks/game/useGame";
import { useZoneRefs } from "~/hooks/game/useZoneRefs";
import DraggableGameCard from "~/routes/games.$gameId/Components/DraggableGameCard";

const Hand = ({ cards }: { cards: GameCard[] }) => {
  const setHandRef = useZoneRefs((state) => state.setHandRef);
  const handRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHandRef(handRef);
  }, [handRef, setHandRef]);

  return (
    <div
      className="flex gap-2 w-full border border-base-100 min-h-36"
      ref={handRef}
    >
      {cards.map((card) => (
        <DraggableGameCard key={card.id} card={card} zone="hand" />
      ))}
    </div>
  );
};

export default Hand;
