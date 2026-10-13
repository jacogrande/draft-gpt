import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { GameCard } from "~/hooks/game/useGame";
import GraveyardItem from "./GraveyardItem";

const GraveyardDisplay = ({
  cards,
  scale = 1,
  own = true,
}: {
  cards: GameCard[];
  scale?: number;
  own?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const title = own ? "Your graveyard" : "Opponent graveyard";
  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, [open]);
  return (
    <>
      <button
        aria-label={`${title}: ${cards.length} cards`}
        onClick={() => setOpen(true)}
        style={{ width: 250 * scale, height: 350 * scale }}
        className="border border-base-300 rounded-md bg-base-200 flex flex-col gap-2 items-center justify-center text-xs"
      >
        <span>Graveyard</span>
        <strong>{cards.length}</strong>
      </button>
      {open &&
        createPortal(
          <section
            role="dialog"
            aria-label={title}
            className="fixed z-50 right-4 top-4 w-80 max-w-[calc(100vw-2rem)] max-h-[80vh] overflow-y-auto bg-base-100 text-base-content border border-base-300 rounded-lg shadow-xl p-4"
          >
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-bold">{title}</h2>
              <button
                className="btn btn-sm btn-ghost"
                aria-label={`Close ${title.toLowerCase()}`}
                onClick={() => setOpen(false)}
              >
                ✕
              </button>
            </div>
            {cards.length === 0 ? (
              <p className="text-sm opacity-60">No cards here.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {cards.map((card) => (
                  <GraveyardItem key={card.id} card={card} own={own} />
                ))}
              </ul>
            )}
          </section>,
          document.body
        )}
    </>
  );
};
export default GraveyardDisplay;
