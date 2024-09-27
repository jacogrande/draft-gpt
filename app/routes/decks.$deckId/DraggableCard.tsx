import Draggable, { DraggableEventHandler } from "react-draggable";
import Card from "~/components/Card";
import { Card as CardType } from "~/util/types";
import { useDeckEditorStore } from "~/routes/decks.$deckId/store";
import { moveCardToSideboard } from "~/model/decks";
import { useUser } from "~/hooks/useUser";
import { useDeckStore } from "~/hooks/useDeck";

const DraggableCard = ({ card }: { card: CardType }) => {
  const sideboardRect = useDeckEditorStore((state) => state.sideboardRect);
  const sideboardRef = useDeckEditorStore((state) => state.sideboardRef);
  const deck = useDeckStore((state) => state.deck);
  const { user } = useUser();

  const isCardInSideboard = (rect: DOMRect) => {
    if (!sideboardRect) return false;
    // check if the card is in the sideboard
    return (
      rect.x >= sideboardRect.x &&
      rect.x <= sideboardRect.x + sideboardRect.width &&
      rect.y >= sideboardRect.y &&
      rect.y <= sideboardRect.y + sideboardRect.height
    );
  };

  const highlightSideboard = () => {
    if (!sideboardRef) return;
    sideboardRef.classList.add("border-primary");
  };

  const removeHighlight = () => {
    if (!sideboardRef) return;
    sideboardRef.classList.remove("border-primary");
  };

  const onDrag: DraggableEventHandler = (_e, data) => {
    const { node } = data;
    const rect = node.getBoundingClientRect();
    if (!sideboardRect || !sideboardRef) return;
    if (!isCardInSideboard(rect)) {
      removeHighlight();
    } else {
      highlightSideboard();
    }
  };

  const onStop: DraggableEventHandler = (_e, data) => {
    if (!deck || !user) return;
    const { node } = data;
    const rect = node.getBoundingClientRect();
    if (!sideboardRect) return;
    if (!isCardInSideboard(rect)) return;
    moveCardToSideboard(deck.id, user.uid, card.id);
  };

  const SCALE = 0.65;
  return (
    <Draggable
      axis="both"
      handle=".handle"
      defaultPosition={{ x: 0, y: 0 }}
      grid={[10, 10]}
      scale={1}
      onStop={onStop}
      onDrag={onDrag}
    >
      <div>
        <Card card={card} scale={SCALE} />
      </div>
    </Draggable>
  );
};

export default DraggableCard;
