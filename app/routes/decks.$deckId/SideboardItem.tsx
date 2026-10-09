import { api } from "@convex/_generated/api";
import { useMutation } from "convex/react";
import ManaCost from "~/components/ManaCost";
import { deckIdOf, useDeckStore } from "~/hooks/useDeck";
import { useGlobalStore } from "~/hooks/useGlobalStore";
import { Card } from "~/util/types";

const SideboardItem = ({ card }: { card: Card }) => {
  const moveToMainboard = useMutation(api.deck.decks.moveToMainboard);
  const { deck } = useDeckStore();
  const setPeekedCard = useGlobalStore((state) => state.setPeekedCard);

  const handleMouseOver = () => {
    setPeekedCard(card);
  };

  const returnToMainboard = async () => {
    if (!card || !deck) return;
    await moveToMainboard({ deckId: deckIdOf(deck), cardId: card.id });
  };

  return (
    <button className="flex" onClick={returnToMainboard}>
      <li
        onMouseOver={handleMouseOver}
        onFocus={handleMouseOver}
        key={card.id}
        className="flex items-center flex-1 justify-between rounded-lg tracking-tight border px-2 py-1 text-sm"
      >
        <p>{card.name}</p>
        <div className="text-2xs">
          <ManaCost manaCost={card.mana_cost} />
        </div>
      </li>
    </button>
  );
};

export default SideboardItem;
