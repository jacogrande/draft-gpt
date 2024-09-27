import { useMemo } from "react";
import CardListItem from "~/components/CardListItem";
import { useLobbyStore } from "~/hooks/lobby/useLobby";
import useDeck from "~/hooks/useDeck";
import { getCMC } from "~/util/getCMC";

const DeckList = () => {
  const { lobby } = useLobbyStore();
  const { deck } = useDeck(lobby?.id || "");
  const sortedDeck = useMemo(() => {
    if (!deck) return null;
    return deck.cards.sort((a, b) => getCMC(a.mana_cost) - getCMC(b.mana_cost)); // sort by name
  }, [deck]);

  return (
    <ul
      className="flex flex-col gap-2 text-2xs"
      style={{ maxHeight: "calc(100vh - 200px)" }}
    >
      {sortedDeck?.map((card) => (
        <CardListItem key={card.id} card={card} />
      ))}
    </ul>
  );
};

export default DeckList;
