import { useEffect, useMemo, useRef } from "react";
import Card from "~/components/Card";
import Subheading from "~/components/Subheading";
import { useDeckStore } from "~/hooks/useDeck";
import { useGlobalStore } from "~/hooks/useGlobalStore";
import SideboardItem from "~/routes/decks.$deckId/SideboardItem";
import { useDeckEditorStore } from "~/routes/decks.$deckId/store";
import { BASICS } from "~/util/constants";
import { createBasicLand } from "~/util/createBasicLand";
import { getCMC } from "~/util/getCMC";

const BASIC_LANDS = BASICS.map((type) => createBasicLand(type));

const Sideboard = () => {
  const { deck } = useDeckStore();
  const peekedCard = useGlobalStore((state) => state.peekedCard);
  const containerRef = useRef<HTMLDivElement>(null);
  const trueRef = useRef<HTMLDivElement>(null);
  const setSideboardRect = useDeckEditorStore(
    (state) => state.setSideboardRect
  );
  const setSideboardRef = useDeckEditorStore((state) => state.setSideboardRef);

  const sortedSideboard = useMemo(() => {
    if (!deck || !deck.sideboard) return null;
    return deck.sideboard.sort(
      (a, b) => getCMC(a.mana_cost) - getCMC(b.mana_cost)
    ); // sort by mana cost
  }, [deck]);

  useEffect(() => {
    if (!containerRef.current || !trueRef.current) return;
    setSideboardRect(containerRef.current.getBoundingClientRect());
    setSideboardRef(trueRef.current);
  }, [containerRef, trueRef, setSideboardRect, setSideboardRef]);

  return (
    <div
      className="flex flex-col gap-4 py-4 rounded-lg w-[250px] sticky top-0"
      ref={containerRef}
    >
      <Subheading>
        <span className="ml-2">Card Preview</span>
      </Subheading>
      <div className="w-[250px] h-[350px]">
        {peekedCard && <Card card={peekedCard} scale={1} disabled />}
      </div>
      <div
        className="border w-full rounded p-2 flex-1 flex flex-col gap-2"
        ref={trueRef}
      >
        <Subheading>Sideboard</Subheading>
        {sortedSideboard?.map((card) => (
          <SideboardItem key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
};

export default Sideboard;
