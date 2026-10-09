import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import Heading from "~/components/Heading";
import { GameView, viewerSeat } from "~/hooks/game/useGame";
import { useToast } from "~/hooks/useToast";

const DeckPicker = ({ game }: { game: GameView }) => {
  const { toast } = useToast();
  const decks = useQuery(api.deck.decks.list);
  const chooseDeck = useMutation(api.game.setup.chooseDeck);
  const [deckId, setDeckId] = useState<string>("");

  const handleReadyUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await chooseDeck({ gameId: game.id, deckId: deckId as Id<"decks"> });
    } catch {
      toast("Unable to ready up", "error");
    }
  };

  if (viewerSeat(game)?.ready)
    return <Heading>Waiting for your opponent</Heading>;
  return (
    <div className="flex flex-col items-center gap-8">
      <Heading>Setup Game</Heading>
      <form className="flex items-center gap-2" onSubmit={handleReadyUp}>
        <select
          className="select select-bordered w-full max-w-xs"
          aria-label="Deck"
          onChange={(e) => setDeckId(e.currentTarget.value)}
          value={deckId}
        >
          <option disabled value="">
            Pick a deck
          </option>
          {decks?.map((deck) => (
            <option key={deck.id} value={deck.id}>
              {deck.name}
            </option>
          ))}
        </select>
        <button className="btn btn-primary" disabled={!deckId}>
          Ready Up
        </button>
      </form>
    </div>
  );
};

export default DeckPicker;
