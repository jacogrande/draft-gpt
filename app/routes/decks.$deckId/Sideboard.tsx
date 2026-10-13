import Card from "~/components/Card";
import { useDeckStore } from "~/hooks/useDeck";
import { useGlobalStore } from "~/hooks/useGlobalStore";
import { BASICS } from "~/util/constants";
import { getCMC } from "~/util/getCMC";
import BasicAdder from "./BasicAdder";
import SideboardItem from "./SideboardItem";

const Sideboard = () => {
  const deck = useDeckStore((state) => state.deck);
  const peeked = useGlobalStore((state) => state.peekedCard);
  const sideboard = [...(deck?.sideboard ?? [])].sort(
    (a, b) => getCMC(a.mana_cost) - getCMC(b.mana_cost)
  );
  return (
    <aside className="flex flex-col w-60 shrink-0 gap-3 min-h-0 overflow-y-auto pr-2">
      <div
        className="h-[273px] shrink-0 flex justify-center rounded-lg bg-base-200/40"
        aria-label="Card preview"
      >
        {peeked ? (
          <Card card={peeked} scale={0.78} disabled />
        ) : (
          <p className="self-center text-sm opacity-60">
            Hover or focus a card to preview
          </p>
        )}
      </div>
      <section className="border border-base-300 rounded-lg p-3 shrink-0">
        <h2 className="font-semibold text-sm mb-2">Basic lands</h2>
        <div className="flex flex-wrap gap-1">
          {BASICS.map((type) => (
            <BasicAdder key={type} type={type} />
          ))}
        </div>
      </section>
      <section
        data-deck-sideboard
        className="border border-base-300 rounded-lg p-3 min-h-40 flex-1"
      >
        <h2 className="font-semibold text-sm mb-2">
          Sideboard · {sideboard.length}
        </h2>
        <p className="text-xs opacity-60 mb-3">
          Drop cards here. Click a card to return it.
        </p>
        <div className="flex flex-col gap-2">
          {sideboard.map((card) => (
            <SideboardItem key={card.id} card={card} />
          ))}
        </div>
      </section>
    </aside>
  );
};
export default Sideboard;
