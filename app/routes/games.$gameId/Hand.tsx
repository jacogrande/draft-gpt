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
      data-hand
      aria-label="Your hand"
      className="flex gap-3 w-full min-w-0 shrink-0 overflow-x-auto border border-base-300 rounded-lg h-48 p-3"
      ref={handRef}
    >
      {cards.map((card) => (
        <div key={card.id} className="shrink-0">
          <DraggableGameCard card={card} zone="hand" />
        </div>
      ))}
    </div>
  );
};

export default Hand;
