import { useState, useEffect } from "react";
import Heading from "~/components/Heading";
import { useGameStore } from "~/hooks/game/useGame";
import { useToast } from "~/hooks/useToast";
import { useUser } from "~/hooks/useUser";
import { getAllDecks } from "~/model/decks";
import { submitDeck } from "~/model/game/deck";
import { Deck } from "~/util/types";

const DeckPicker = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const game = useGameStore((state) => state.game);
  const [decks, setDecks] = useState<Deck[] | null>(null);
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const decks = await getAllDecks(user.uid);
      setDecks(decks);
    })();
  }, [user]);

  const handleReadyUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user || !selectedDeck || !game) return;
    try {
      await submitDeck(game.id, user.uid, selectedDeck);
    } catch (error) {
      console.error(error);
      toast("Unable to ready up", "error");
    }
  };

  const handleSelectDeck = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const deckId = e.currentTarget.value;
    setSelectedDeck(decks?.find((deck) => deck.id === deckId) || null);
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <Heading>Setup Game</Heading>
      <form className="flex items-center gap-2" onSubmit={handleReadyUp}>
        <select
          className="select select-bordered w-full max-w-xs"
          onChange={handleSelectDeck}
          value={selectedDeck?.id}
        >
          <option disabled selected>
            Pick a deck
          </option>
          {decks?.map((deck) => (
            <option key={deck.id} value={deck.id}>
              {deck.name}
            </option>
          ))}
        </select>
        <button className="btn btn-primary">Ready Up</button>
      </form>
    </div>
  );
};

export default DeckPicker;
