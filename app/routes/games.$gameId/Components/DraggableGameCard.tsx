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

const DraggableGameCard = ({
  card,
  zone,
  childrenOverride,
}: DraggableGameCardProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const { moveCards, tapCards } = useGameActions();
  const { battlefieldRef, deckRef, handRef, graveyardRef } = useZoneRefs();
  const { selectedCards, setSelectedCards } = useGlobalStore();

  const highlightZone = (ref: React.RefObject<HTMLDivElement>) => {
    if (!ref.current) return;
    ref.current.classList.remove("border-base-100");
    ref.current.classList.add("border-primary");
  };

  const removeHighlight = (ref: React.RefObject<HTMLDivElement>) => {
    if (!ref.current) return;
    ref.current.classList.add("border-base-100");
    ref.current.classList.remove("border-primary");
  };

  const checkZone = (
    ref: React.RefObject<HTMLDivElement>,
    cardRect: DOMRect
  ) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    // check if the cardRect is within the ref's bounds
    if (
      rect.x <= cardRect.x + cardRect.width / 2 &&
      rect.x + rect.width >= cardRect.x + cardRect.width / 2 &&
      rect.y <= cardRect.y + cardRect.height / 2 &&
      rect.y + rect.height >= cardRect.y + cardRect.height / 2
    ) {
      return true;
    }
    return false;
  };

  const onDrag: DraggableEventHandler = (_e, data) => {
    if (!battlefieldRef || !deckRef || !handRef || !graveyardRef) return;
    const { node } = data;
    const cardRect = node.getBoundingClientRect();
    const inBattlefield = checkZone(battlefieldRef, cardRect);
    const inDeck = checkZone(deckRef, cardRect);
    const inHand = checkZone(handRef, cardRect);
    const inGraveyard = checkZone(graveyardRef, cardRect);
    // highlight based on zone priority (hand -> deck -> battlefield)
    if (inHand) {
      highlightZone(handRef);
      removeHighlight(battlefieldRef);
      removeHighlight(deckRef);
      removeHighlight(graveyardRef);
    } else if (inDeck) {
      highlightZone(deckRef);
      removeHighlight(battlefieldRef);
      removeHighlight(handRef);
      removeHighlight(graveyardRef);
    } else if (inGraveyard) {
      highlightZone(graveyardRef);
      removeHighlight(deckRef);
      removeHighlight(handRef);
      removeHighlight(battlefieldRef);
    } else if (inBattlefield) {
      highlightZone(battlefieldRef);
      removeHighlight(deckRef);
      removeHighlight(handRef);
    } else {
      removeHighlight(battlefieldRef);
      removeHighlight(deckRef);
      removeHighlight(handRef);
      removeHighlight(graveyardRef);
    }
  };

  const handleMoveCard = async (targetZone: Zone) => {
    if (selectedCards.length === 0) return moveCards([card.id], targetZone);
    await moveCards(
      selectedCards.map((selected) => selected.id),
      targetZone
    );
    setSelectedCards([]);
  };

  const handleStop: DraggableEventHandler = (_e, data) => {
    setIsDragging(false);
    if (!battlefieldRef || !deckRef || !handRef || !graveyardRef) return;
    const { node } = data;
    const cardRect = node.getBoundingClientRect();
    const inBattlefield = checkZone(battlefieldRef, cardRect);
    const inDeck = checkZone(deckRef, cardRect);
    const inHand = checkZone(handRef, cardRect);
    const inGraveyard = checkZone(graveyardRef, cardRect);
    // remove all highlights
    removeHighlight(battlefieldRef);
    removeHighlight(deckRef);
    removeHighlight(handRef);
    removeHighlight(graveyardRef);
    // move card to the appropriate zone
    if (inHand && zone !== "hand") {
      handleMoveCard("hand");
    } else if (inDeck && zone !== "library") {
      handleMoveCard("library");
    } else if (inGraveyard && zone !== "graveyard") {
      handleMoveCard("graveyard");
    } else if (inBattlefield && zone !== "battlefield") {
      handleMoveCard("battlefield");
    }
  };

  const handleStart: DraggableEventHandler = () => {
    // if (data.deltaX === 0 && data.deltaY === 0) return;
    setIsDragging(true);
  };

  const handleDoubleClick = () => tapCards([card.id]);

  return (
    <Draggable
      axis="both"
      handle=".handle"
      defaultPosition={{ x: 0, y: 0 }}
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
