import { api } from "@convex/_generated/api";
import { useQuery } from "convex/react";
import CardListItem from "~/components/CardListItem";
import { useLobbyId } from "~/hooks/lobby/useLobby";
import { getCMC } from "~/util/getCMC";

const DeckList = () => {
  const deck = useQuery(api.deck.decks.forLobby, { lobbyId: useLobbyId() });
  const sorted = [...(deck?.cards ?? [])].sort(
    (a, b) => getCMC(a.mana_cost) - getCMC(b.mana_cost)
  );

  return (
    <ul
      className="flex flex-col gap-2 text-2xs"
      style={{ maxHeight: "calc(100vh - 200px)" }}
    >
      {sorted.map((card) => (
        <CardListItem key={card.id} card={card} />
      ))}
    </ul>
  );
};

export default DeckList;
