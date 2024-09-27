import Card from "~/components/Card";
import { Card as CardType } from "~/util/types";

const CardListItem = ({ card }: { card: CardType }) => {
  return (
    <li key={card.id} className="dropdown dropdown-hover dropdown-right">
      <div
        tabIndex={0}
        role="button"
        className="flex items-center justify-between rounded-lg tracking-tight border px-2 py-1"
      >
        <p>{card.name}</p>
        <p>{card.mana_cost}</p>
      </div>
      <div className="dropdown-content shadow-xl z-20 p-4 bg-base-100 rounded-xl">
        <Card card={card} disabled />
      </div>
    </li>
  );
};

export default CardListItem;
