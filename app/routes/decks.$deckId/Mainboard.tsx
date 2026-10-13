import { MAX_DECK_SIZE } from "@convex/deck/zones";
import { api } from "@convex/_generated/api";
import { isLand, TARGET_LANDS } from "@convex/deck/manaBase";
import { useMutation } from "convex/react";
import { useState } from "react";
import ManaCost from "~/components/ManaCost";
import { deckIdOf, useDeckStore } from "~/hooks/useDeck";
import { useGlobalStore } from "~/hooks/useGlobalStore";
import { useToast } from "~/hooks/useToast";
import { getCMC } from "~/util/getCMC";
import { Card } from "~/util/types";
import DraggableCard from "./DraggableCard";
import { useDeckEdits } from "./useDeckEdits";

const Mainboard = () => {
  const deck = useDeckStore((state) => state.deck);
  const [view, setView] = useState<"stacks" | "list">("stacks");
  const [adding, setAdding] = useState(false);
  const autoAdd = useMutation(api.deck.decks.autoAddBasics);
  const toast = useToast((state) => state.toast);
  const groups: Record<number, Card[]> = {};
  for (const card of deck?.cards ?? [])
    (groups[getCMC(card.mana_cost)] ??= []).push(card);
  const landCount = deck?.cards.filter(isLand).length ?? 0;
  const addLands = async () => {
    if (!deck || adding) return;
    setAdding(true);
    try {
      const result = await autoAdd({ deckId: deckIdOf(deck) });
      toast(
        result.reason === "no-colors"
          ? "No colored mana costs found. Choose basic lands manually."
          : result.added
          ? `Added ${result.added} basic lands`
          : "No more lands needed",
        result.reason === "no-colors" ? "info" : "success"
      );
    } catch {
      toast("Could not add lands. Please try again.", "error");
    } finally {
      setAdding(false);
    }
  };
  return (
    <section
      data-deck-mainboard
      className="flex flex-col flex-1 min-w-0 min-h-0 gap-3"
    >
      <div className="flex items-center flex-wrap justify-between gap-3">
        <div>
          <h2 className="font-semibold">
            Mainboard · {deck?.cards.length ?? 0}
          </h2>
          <p className="text-xs opacity-60">
            {landCount} lands · {(deck?.cards.length ?? 0) - landCount} spells
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="join" aria-label="Mainboard view">
            {(["stacks", "list"] as const).map((mode) => (
              <button
                key={mode}
                aria-pressed={view === mode}
                onClick={() => setView(mode)}
                className={`btn btn-sm join-item ${
                  view === mode ? "btn-active" : ""
                }`}
              >
                {mode === "stacks" ? "Stacks" : "List"}
              </button>
            ))}
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => void addLands()}
            disabled={
              adding ||
              landCount >= TARGET_LANDS ||
              (deck?.cards.length ?? 0) >= MAX_DECK_SIZE
            }
            title="Top up to 17 lands using mainboard mana costs"
          >
            {adding ? "Adding…" : "Add Lands"}
          </button>
        </div>
      </div>
      <p className="text-xs opacity-60">
        Drag or double-click cards to sideboard them. Basic lands are removed
        instead.
      </p>
      <div className="overflow-auto min-h-0 flex-1 p-1" data-deck-scroll>
        {deck?.cards.length === 0 ? (
          <p className="p-8 text-center opacity-60">
            The mainboard is empty. Return cards from the sideboard or add basic
            lands.
          </p>
        ) : view === "stacks" ? (
          <div className="flex gap-4 w-max min-w-full items-start">
            {Object.entries(groups).map(([cmc, cards]) => (
              <section key={cmc} className="w-[163px] shrink-0">
                <h3 className="text-xs font-semibold mb-2">
                  Mana value {cmc} · {cards.length}
                </h3>
                <div
                  className="relative"
                  style={{ height: 228 + (cards.length - 1) * 28 }}
                >
                  {cards.map((card, index) => (
                    <div
                      key={card.id}
                      className="absolute"
                      style={{ top: index * 28 }}
                    >
                      <DraggableCard card={card} />
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {Object.entries(groups).map(([cmc, cards]) => (
              <section key={cmc}>
                <h3 className="font-semibold text-sm mb-2">
                  Mana value {cmc} · {cards.length}
                </h3>
                <ul className="flex flex-col gap-1">
                  {cards.map((card) => (
                    <CardRow key={card.id} card={card} />
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

const CardRow = ({ card }: { card: Card }) => {
  const peek = useGlobalStore((state) => state.setPeekedCard);
  const { toSideboard } = useDeckEdits();
  return (
    <li className="flex items-center justify-between gap-3 rounded border border-base-300 px-3 py-2">
      <button
        className="flex items-center gap-3 flex-1 text-left text-sm"
        onMouseEnter={() => peek(card)}
        onFocus={() => peek(card)}
        onClick={() => peek(card)}
      >
        <span>{card.name}</span>
        <ManaCost manaCost={card.mana_cost} />
      </button>
      <button
        className="btn btn-xs btn-ghost"
        aria-label={`${card.type === "Basic Land" ? "Remove" : "Sideboard"} ${
          card.name
        }`}
        onClick={() => void toSideboard(card.id)}
      >
        {card.type === "Basic Land" ? "Remove" : "Sideboard"}
      </button>
    </li>
  );
};
export default Mainboard;
