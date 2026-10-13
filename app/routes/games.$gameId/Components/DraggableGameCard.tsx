import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import Card from "~/components/Card";
import type { Zone } from "@convex/game/table";
import { GameCard } from "~/hooks/game/useGame";
import { useGameActions } from "~/hooks/game/useGameActions";
import { useZoneRefs } from "~/hooks/game/useZoneRefs";
import { useGlobalStore } from "~/hooks/useGlobalStore";
import { GAME_SCALE } from "~/util/constants";

const DraggableGameCard = ({
  card,
  zone,
  childrenOverride,
}: {
  card: GameCard;
  zone: Zone;
  childrenOverride?: React.ReactNode;
}) => {
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  const dragged = useRef(false);
  const { moveCards, tapCards } = useGameActions();
  const { battlefieldRef, deckRef, handRef, graveyardRef } = useZoneRefs();
  const selected = useGlobalStore((state) => state.selectedCards);
  const select = useGlobalStore((state) => state.setSelectedCards);
  const refs = {
    hand: handRef,
    library: deckRef,
    graveyard: graveyardRef,
    battlefield: battlefieldRef,
  };
  const clear = () =>
    Object.values(refs).forEach((ref) =>
      ref?.current?.classList.remove("ring-2", "ring-primary")
    );
  const targetAt = (x: number, y: number): Zone | null => {
    const element = document.elementFromPoint(x, y);
    for (const target of [
      "hand",
      "library",
      "graveyard",
      "battlefield",
    ] as const) {
      if (element && refs[target]?.current?.contains(element)) return target;
    }
    return null;
  };
  const ids = selected.some((item) => item.id === card.id)
    ? selected.map((item) => item.id)
    : [card.id];
  return (
    <>
      <div
        className="touch-none select-none"
        style={{ opacity: pointer ? 0.35 : 1 }}
        onPointerDown={(event) => {
          if (event.button !== 0) return;
          (event.target as HTMLElement).setPointerCapture(event.pointerId);
          start.current = { x: event.clientX, y: event.clientY };
          dragged.current = false;
        }}
        onPointerMove={(event) => {
          if (!start.current) return;
          if (
            !dragged.current &&
            Math.abs(event.clientX - start.current.x) +
              Math.abs(event.clientY - start.current.y) <
              5
          )
            return;
          event.currentTarget.setPointerCapture(event.pointerId);
          dragged.current = true;
          setPointer({ x: event.clientX, y: event.clientY });
          clear();
          const target = targetAt(event.clientX, event.clientY);
          if (target)
            refs[target]?.current?.classList.add("ring-2", "ring-primary");
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
          if (!dragged.current) return;
          const target = targetAt(event.clientX, event.clientY);
          if (target && target !== zone) {
            select([]);
            void moveCards(ids, target);
          }
        }}
        onClickCapture={(event) => {
          if (dragged.current) {
            event.stopPropagation();
            dragged.current = false;
          }
        }}
        onDoubleClick={() => {
          if (zone === "battlefield") void tapCards([card.id]);
        }}
      >
        {childrenOverride ?? <Card card={card} scale={GAME_SCALE} />}
      </div>
      {pointer &&
        createPortal(
          <div
            className="fixed z-[200] pointer-events-none -rotate-6"
            style={{ left: pointer.x - 55, top: pointer.y - 75 }}
          >
            <Card card={card} scale={GAME_SCALE} readOnly />
            {ids.length > 1 && (
              <span className="badge badge-primary absolute -top-2 -right-2">
                {ids.length} cards
              </span>
            )}
          </div>,
          document.body
        )}
    </>
  );
};
export default DraggableGameCard;
