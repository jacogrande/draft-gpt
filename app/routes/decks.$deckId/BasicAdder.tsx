import { PlusIcon } from "@heroicons/react/16/solid";
import { useDeckStore } from "~/hooks/useDeck";
import { useToast } from "~/hooks/useToast";
import { useUser } from "~/hooks/useUser";
import { addBasicLandToMainboard } from "~/model/decks";
import { createBasicLand } from "~/util/createBasicLand";
import { BasicLand } from "~/util/types";

const BasicAdder = ({ type }: { type: BasicLand }) => {
  const { toast } = useToast();
  const { deck } = useDeckStore();
  const { user } = useUser();

  const handleClick = async () => {
    if (!deck || !user) return;
    try {
      const card = createBasicLand(type);
      await addBasicLandToMainboard(deck.id, user.uid, card);
    } catch (error) {
      console.error(error);
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
