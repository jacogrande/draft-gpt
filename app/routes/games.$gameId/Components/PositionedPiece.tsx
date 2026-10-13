import {
  fromPixels,
  Position,
  Size,
  toPixels,
  viewPosition,
} from "@convex/game/placement";
import { ReactNode, useRef, useState } from "react";
import { useToast } from "~/hooks/useToast";

type Props = {
  position: Position;
  area: Size;
  size: Size;
  opponent: boolean;
  label: string;
  onMove?: (position: Position) => Promise<unknown>;
  children: ReactNode;
};

const PositionedPiece = ({
  position,
  area,
  size,
  opponent,
  label,
  onMove,
  children,
}: Props) => {
  const [draft, setDraft] = useState<Position | null>(null);
  const [saving, setSaving] = useState(false);
  const drag = useRef<{
    x: number;
    y: number;
    origin: Position;
    moved: boolean;
  } | null>(null);
  const toast = useToast((state) => state.toast);
  const shown = draft ?? viewPosition(position, opponent);
  const pixel = toPixels(shown, area, size);

  return (
    <div
      data-piece={label}
      className={`absolute flex items-center justify-center touch-none select-none ${
        onMove ? "cursor-grab active:cursor-grabbing" : ""
      }`}
      style={{
        left: pixel.x,
        top: pixel.y,
        width: size.width,
        height: size.height,
        zIndex: draft ? 20 : 1,
      }}
      onPointerDown={(event) => {
        if (
          !onMove ||
          saving ||
          event.button !== 0 ||
          (event.target as HTMLElement).closest("input, button, a")
        )
          return;
        (event.target as HTMLElement).setPointerCapture(event.pointerId);
        drag.current = {
          x: event.clientX,
          y: event.clientY,
          origin: pixel,
          moved: false,
        };
      }}
      onPointerMove={(event) => {
        const start = drag.current;
        if (!start) return;
        const dx = event.clientX - start.x;
        const dy = event.clientY - start.y;
        if (Math.abs(dx) + Math.abs(dy) < 4 && !start.moved) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        start.moved = true;
        setDraft(
          fromPixels(
            { x: start.origin.x + dx, y: start.origin.y + dy },
            area,
            size
          )
        );
      }}
      onPointerCancel={() => {
        drag.current = null;
        setDraft(null);
      }}
      onPointerUp={async (event) => {
        const start = drag.current;
        drag.current = null;
        if (event.currentTarget.hasPointerCapture(event.pointerId))
          event.currentTarget.releasePointerCapture(event.pointerId);
        if (!start?.moved || !onMove) return;
        setSaving(true);
        try {
          await onMove(
            fromPixels(
              {
                x: start.origin.x + event.clientX - start.x,
                y: start.origin.y + event.clientY - start.y,
              },
              area,
              size
            )
          );
        } catch {
          toast(`Could not move ${label}`, "error");
        } finally {
          setDraft(null);
          setSaving(false);
        }
      }}
    >
      {children}
    </div>
  );
};

export default PositionedPiece;
