import { api } from "@convex/_generated/api";
import { PlusIcon } from "@heroicons/react/16/solid";
import { useMutation } from "convex/react";
import { deckIdOf, useDeckStore } from "~/hooks/useDeck";
import { useToast } from "~/hooks/useToast";
import { BasicLand } from "~/util/types";

const BasicAdder = ({ type }: { type: BasicLand }) => {
  const { toast } = useToast();
  const { deck } = useDeckStore();
  const addBasics = useMutation(api.deck.decks.addBasics);

  const handleClick = async () => {
    if (!deck) return;
    try {
      await addBasics({ deckId: deckIdOf(deck), lands: [type] });
    } catch {
      toast("Unable to add basic land", "error");
    }
  };

  return (
    <button
      className="btn btn-xs flex items-center justify-start"
      onClick={handleClick}
    >
      <PlusIcon className="h-4 w-4" />
      <span className="ml-2">{type}</span>
    </button>
  );
};

export default BasicAdder;
