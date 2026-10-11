import { useState } from "react";
import Draggable, { DraggableEventHandler } from "react-draggable";
import Card from "~/components/Card";
import type { Zone } from "@convex/game/table";
import { GameCard } from "~/hooks/game/useGame";
import { useGameActions } from "~/hooks/game/useGameActions";
import { useZoneRefs } from "~/hooks/game/useZoneRefs";
import { useGlobalStore } from "~/hooks/useGlobalStore";
import { GAME_SCALE } from "~/util/constants";

type DraggableGameCardProps = {
  card: GameCard;
  zone: Zone;
  childrenOverride?: React.ReactNode;
};

const ORIGIN = { x: 0, y: 0 };

const DraggableGameCard = ({
  card,
  zone,
  childrenOverride,
}: DraggableGameCardProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const { moveCards, tapCards } = useGameActions();
  const { battlefieldRef, deckRef, handRef, graveyardRef } = useZoneRefs();
  const selectedCards = useGlobalStore((state) => state.selectedCards);
  const setSelectedCards = useGlobalStore((state) => state.setSelectedCards);

  type ZoneRef = React.RefObject<HTMLDivElement> | null;

  const highlightZone = (ref: ZoneRef) => {
    if (!ref?.current) return;
    ref.current.classList.remove("border-base-100");
    ref.current.classList.add("border-primary");
  };

  const removeHighlight = (ref: ZoneRef) => {
    if (!ref?.current) return;
    ref.current.classList.add("border-base-100");
    ref.current.classList.remove("border-primary");
  };

  const checkZone = (ref: ZoneRef, cardRect: DOMRect) => {
    if (!ref?.current) return false;
    const rect = ref.current.getBoundingClientRect();
    const centerX = cardRect.x + cardRect.width / 2;
    const centerY = cardRect.y + cardRect.height / 2;
    return (
      rect.x <= centerX &&
      rect.x + rect.width >= centerX &&
      rect.y <= centerY &&
      rect.y + rect.height >= centerY
    );
  };

  const zoneUnder = (cardRect: DOMRect): Zone | null => {
    if (checkZone(handRef, cardRect)) return "hand";
    if (checkZone(deckRef, cardRect)) return "library";
    if (checkZone(graveyardRef, cardRect)) return "graveyard";
    if (checkZone(battlefieldRef, cardRect)) return "battlefield";
    return null;
  };

  const refFor = (target: Zone) =>
    ({
      hand: handRef,
      library: deckRef,
      graveyard: graveyardRef,
      battlefield: battlefieldRef,
    }[target]);

  const clearHighlights = () => {
    removeHighlight(battlefieldRef);
    removeHighlight(deckRef);
    removeHighlight(handRef);
    removeHighlight(graveyardRef);
  };

  const onDrag: DraggableEventHandler = (_e, data) => {
    const target = zoneUnder(data.node.getBoundingClientRect());
    clearHighlights();
    if (target) highlightZone(refFor(target));
  };

  const handleMoveCard = async (targetZone: Zone) => {
    const dragged = selectedCards.some((selected) => selected.id === card.id);
    const cardIds = dragged
      ? selectedCards.map((selected) => selected.id)
      : [card.id];
    setSelectedCards([]);
    await moveCards(cardIds, targetZone);
  };

  const handleStop: DraggableEventHandler = (_e, data) => {
    setIsDragging(false);
    const target = zoneUnder(data.node.getBoundingClientRect());
    clearHighlights();
    if (target && target !== zone) void handleMoveCard(target);
  };

  const handleStart: DraggableEventHandler = () => {
    setIsDragging(true);
  };

  const handleDoubleClick = () => tapCards([card.id]);

  return (
    <Draggable
      axis="both"
      handle=".handle"
      position={ORIGIN}
      grid={[1, 1]}
      scale={1}
      onStop={handleStop}
      onDrag={onDrag}
      onStart={handleStart}
    >
      <div onDoubleClick={handleDoubleClick}>
        <div className={`transition-transform ${isDragging && "-rotate-12"}`}>
          {childrenOverride || <Card card={card} scale={GAME_SCALE} />}
        </div>
      </div>
    </Draggable>
  );
};

export default DraggableGameCard;
