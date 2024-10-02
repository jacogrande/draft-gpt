import { useState } from "react";
import Draggable, { DraggableEventHandler } from "react-draggable";
import Card from "~/components/Card";
import { useGameStore } from "~/hooks/game/useGame";
import { useZoneRefs } from "~/hooks/game/useZoneRefs";
import { useGlobalStore } from "~/hooks/useGlobalStore";
import { useUser } from "~/hooks/useUser";
import { tapCard } from "~/model/game/card";
import { moveCardToZone, moveManyCardsToZone } from "~/model/game/zone";
import { GAME_SCALE } from "~/util/constants";
import { Card as CardType, CardZone } from "~/util/types";

type DraggableGameCardProps = {
  card: CardType;
  zone: CardZone;
};

const DraggableGameCard = ({ card, zone }: DraggableGameCardProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const { game } = useGameStore();
  const { user } = useUser();
  const { battlefieldRef, deckRef, handRef } = useZoneRefs();
  const { selectedCards } = useGlobalStore();

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
    if (!battlefieldRef || !deckRef || !handRef) return;
    const { node } = data;
    const cardRect = node.getBoundingClientRect();
    const inBattlefield = checkZone(battlefieldRef, cardRect);
    const inDeck = checkZone(deckRef, cardRect);
    const inHand = checkZone(handRef, cardRect);
    // highlight based on zone priority (hand -> deck -> battlefield)
    if (inHand) {
      highlightZone(handRef);
      removeHighlight(battlefieldRef);
      removeHighlight(deckRef);
    } else if (inDeck) {
      highlightZone(deckRef);
      removeHighlight(battlefieldRef);
      removeHighlight(handRef);
    } else if (inBattlefield) {
      highlightZone(battlefieldRef);
      removeHighlight(deckRef);
      removeHighlight(handRef);
    } else {
      removeHighlight(battlefieldRef);
      removeHighlight(deckRef);
    }
  };

  const handleMoveCard = async (targetZone: CardZone) => {
    if (!user || !game) return;
    // move all selected cards to the target zone
    if (selectedCards.length > 0) {
      await moveManyCardsToZone(game.id, user.uid, selectedCards, targetZone);
      return;
    }
    // move the card being dragged to the target zone
    await moveCardToZone(
      game.id,
      user.uid,
      card,
      card.zone || "deck",
      targetZone
    );
  };

  const handleStop: DraggableEventHandler = (_e, data) => {
    setIsDragging(false);
    if (!battlefieldRef || !deckRef || !handRef || !game || !user) return;
    const { node } = data;
    const cardRect = node.getBoundingClientRect();
    const inBattlefield = checkZone(battlefieldRef, cardRect);
    const inDeck = checkZone(deckRef, cardRect);
    const inHand = checkZone(handRef, cardRect);
    // remove all highlights
    removeHighlight(battlefieldRef);
    removeHighlight(deckRef);
    removeHighlight(handRef);
    // move card to the appropriate zone
    if (inHand && zone !== "hand") {
      handleMoveCard("hand");
    } else if (inDeck && zone !== "deck") {
      handleMoveCard("deck");
    } else if (inBattlefield && zone !== "battlefield") {
      handleMoveCard("battlefield");
    }
  };

  const handleStart: DraggableEventHandler = () => {
    // if (data.deltaX === 0 && data.deltaY === 0) return;
    setIsDragging(true);
  };

  const handleDoubleClick = async () => {
    if (!user || !game) return;
    console.log("tapping card");
    await tapCard(game.id, user.uid, card.id);
  };

  return (
    <Draggable
      axis="both"
      handle=".handle"
      defaultPosition={{ x: 0, y: 0 }}
      grid={[10, 10]}
      scale={1}
      onStop={handleStop}
      onDrag={onDrag}
      onStart={handleStart}
    >
      <div onDoubleClick={handleDoubleClick}>
        <div className={`transition-transform ${isDragging && "-rotate-12"}`}>
          <Card card={card} scale={GAME_SCALE} />
        </div>
      </div>
    </Draggable>
  );
};

export default DraggableGameCard;
