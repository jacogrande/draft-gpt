import { PlusIcon, Square3Stack3DIcon } from "@heroicons/react/16/solid";
import { FaMountainSun } from "react-icons/fa6";
import Subheading from "~/components/Subheading";
import { useDeckStore } from "~/hooks/useDeck";
import DraggableCard from "~/routes/decks.$deckId/DraggableCard";
import { getCMC } from "~/util/getCMC";
import { Card as CardType } from "~/util/types";

const Mainboard = () => {
  const { deck } = useDeckStore();

  const renderMainboard = () => {
    if (!deck) return null;
    const { cards } = deck;
    const CMCs: Record<number, CardType[]> = {};
    for (const card of cards) {
      const cmc = getCMC(card.mana_cost);
      if (!CMCs[cmc]) CMCs[cmc] = [];
      CMCs[cmc].push(card);
    }
    return Object.keys(CMCs).map((cmc) => (
      <CMCSlot key={cmc} cards={CMCs[Number(cmc)]} />
    ));
  };

  return (
    <div className="flex flex-col gap-4 flex-1 p-4 max-w-full ">
      <div className="flex justify-between items-center">
        <Subheading>
          Mainboard <Square3Stack3DIcon className="h-4 w-4 ml-4" />
          {deck?.cards.length}
        </Subheading>
        <button className="btn btn-primary btn-sm text-xs uppercase">
          {/* <PlusIcon className="h-5 w-5" /> */}
          <FaMountainSun className="h-5 w-5" />
          Add Lands
        </button>
      </div>
      <div className="flex gap-4">{renderMainboard()}</div>
    </div>
  );
};

const CMCSlot = ({ cards }: { cards: CardType[] }) => {
  const renderOffsetCards = () => {
    if (!cards) return null;
    return cards.map((card, i) => {
      const offset = i * 25;
      if (i === 0) return <DraggableCard key={card.id} card={card} />;
      return (
        <div className="absolute" style={{ top: offset }} key={card.id}>
          <DraggableCard card={card} />
        </div>
      );
    });
  };

  return <div className="relative">{renderOffsetCards()}</div>;
};

export default Mainboard;
