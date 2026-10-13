import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import Card from "~/components/Card";
import { Card as CardType } from "~/util/types";
import { useDeckEdits } from "./useDeckEdits";

export const DECK_CARD_SCALE = 0.65;
const DraggableCard = ({ card }: { card: CardType }) => {
  const { toSideboard } = useDeckEdits();
  const start = useRef<{ x: number; y: number } | null>(null);
  const moved = useRef(false);
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);
  const sideboard = () => document.querySelector("[data-deck-sideboard]");
  const isOver = (x: number, y: number) =>
    Boolean(document.elementFromPoint(x, y)?.closest("[data-deck-sideboard]"));
  const clear = () => sideboard()?.classList.remove("ring-2", "ring-primary");
  return (
    <>
      <div
        className="touch-none select-none"
        style={{ opacity: pointer ? 0.35 : 1 }}
        onPointerDown={(event) => {
          if (event.button !== 0) return;
          (event.target as Element).setPointerCapture(event.pointerId);
          start.current = { x: event.clientX, y: event.clientY };
          moved.current = false;
        }}
        onPointerMove={(event) => {
          if (!start.current) return;
          if (
            !moved.current &&
            Math.abs(event.clientX - start.current.x) +
              Math.abs(event.clientY - start.current.y) <
              5
          )
            return;
          moved.current = true;
          event.currentTarget.setPointerCapture(event.pointerId);
          setPointer({ x: event.clientX, y: event.clientY });
          clear();
          if (isOver(event.clientX, event.clientY))
            sideboard()?.classList.add("ring-2", "ring-primary");
        }}
        onPointerCancel={() => {
          start.current = null;
          setPointer(null);
          clear();
        }}
        onPointerUp={(event) => {
          start.current = null;
          setPointer(null);
          clear();
          if (event.currentTarget.hasPointerCapture(event.pointerId))
            event.currentTarget.releasePointerCapture(event.pointerId);
          if (moved.current && isOver(event.clientX, event.clientY))
            void toSideboard(card.id);
        }}
        onDoubleClick={() => void toSideboard(card.id)}
      >
        <Card card={card} scale={DECK_CARD_SCALE} readOnly />
      </div>
      {pointer &&
        createPortal(
          <div
            className="fixed z-[200] pointer-events-none -rotate-6"
            style={{ left: pointer.x - 80, top: pointer.y - 110 }}
          >
            <Card card={card} scale={DECK_CARD_SCALE} readOnly />
          </div>,
          document.body
        )}
    </>
  );
};
export default DraggableCard;
