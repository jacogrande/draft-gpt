import ManaCost from "~/components/ManaCost";
import { useDeckStore } from "~/hooks/useDeck";
import { useGlobalStore } from "~/hooks/useGlobalStore";
import { useUser } from "~/hooks/useUser";
import { moveCardToMainboard } from "~/model/decks";
import { Card } from "~/util/types";

const SideboardItem = ({ card }: { card: Card }) => {
  const { user } = useUser();
  const { deck } = useDeckStore();
  const setPeekedCard = useGlobalStore((state) => state.setPeekedCard);

  const handleMouseOver = () => {
    setPeekedCard(card);
  };

  const returnToMainboard = async () => {
    if (!card || !deck || !user) return;
    await moveCardToMainboard(deck.id, user.uid, card.id);
  };

  return (
    <button className="flex flex-1" onClick={returnToMainboard}>
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
