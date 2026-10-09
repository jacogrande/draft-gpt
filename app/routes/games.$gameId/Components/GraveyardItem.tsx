import ManaCost from "~/components/ManaCost";
import { GameCard } from "~/hooks/game/useGame";
import { useGlobalStore } from "~/hooks/useGlobalStore";
import DraggableGameCard from "~/routes/games.$gameId/Components/DraggableGameCard";

const GraveyardItem = ({ card }: { card: GameCard }) => {
  const setPeekedCard = useGlobalStore((state) => state.setPeekedCard);

  const handleMouseOver = () => {
    setPeekedCard(card);
  };

  const listItem = (
    <li
      onMouseOver={handleMouseOver}
      onFocus={handleMouseOver}
      key={card.id}
      className="flex items-center hover:cursor-pointer flex-1 justify-between rounded-lg tracking-tight border px-2 py-1 handle border-black"
    >
      <p>{card.name}</p>
      <div className="text-2xs">
        <ManaCost manaCost={card.mana_cost} />
      </div>
    </li>
  );

  return (
    <DraggableGameCard
      card={card}
      zone="graveyard"
      childrenOverride={listItem}
    />
  );
};

export default GraveyardItem;
