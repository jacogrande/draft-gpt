import ManaCost from "~/components/ManaCost";
import { useGlobalStore } from "~/hooks/useGlobalStore";
import { Card } from "~/util/types";
import { useDeckEdits } from "./useDeckEdits";

const SideboardItem = ({ card }: { card: Card }) => {
  const { toMainboard } = useDeckEdits();
  const peek = useGlobalStore((state) => state.setPeekedCard);
  return (
    <button
      className="flex items-center justify-between gap-2 rounded border border-base-300 p-2 text-sm text-left hover:bg-base-200 w-full"
      title="Return to mainboard"
      aria-label={`Return ${card.name} to mainboard`}
      onMouseEnter={() => peek(card)}
      onFocus={() => peek(card)}
      onClick={() => void toMainboard(card.id)}
    >
      <span>{card.name}</span>
      <ManaCost manaCost={card.mana_cost} />
    </button>
  );
};
export default SideboardItem;
