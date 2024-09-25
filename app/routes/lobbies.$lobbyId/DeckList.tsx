import { useMemo } from "react";
import Card from "~/components/Card";
import { Card as CardType } from "~/util/types";
import { useLobbyStore } from "~/hooks/lobby/useLobby";
import useDeck from "~/hooks/useDeck";
import { getCMC } from "~/util/getCMC";
import { getCardColor } from "~/util/getCardColor";
import { CARD_COLORS } from "~/util/constants";

const DeckList = () => {
  const { lobby } = useLobbyStore();
  const { deck } = useDeck(lobby?.id || "");
  const sortedDeck = useMemo(() => {
    if (!deck) return null;
    return deck.cards.sort((a, b) => getCMC(a.mana_cost) - getCMC(b.mana_cost)); // sort by name
  }, [deck]);

  return (
    <ul className="flex flex-col gap-2 text-2xs">
      {sortedDeck?.map((card) => (
        <CardItem key={card.id} card={card} />
      ))}
    </ul>
  );
};

const CardItem = ({ card }: { card: CardType }) => {
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

export default DeckList;
