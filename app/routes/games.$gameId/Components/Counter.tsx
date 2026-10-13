import { api } from "@convex/_generated/api";
import { Position, Size } from "@convex/game/placement";
import { useMutation } from "convex/react";
import { useEffect, useRef, useState } from "react";
import colors from "tailwindcss/colors";
import { COUNTER_COLORS } from "@convex/game/extras";
import { GameCounter } from "~/hooks/game/useGame";
import { useToast } from "~/hooks/useToast";
import CustomContextMenu from "./CustomContextMenu";
import PositionedPiece from "./PositionedPiece";

const Counter = ({
  counter,
  area,
  position,
  opponent,
}: {
  counter: GameCounter;
  area: Size;
  position: Position;
  opponent: boolean;
}) => {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(counter.value);
  const [menu, setMenu] = useState<Position | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const setValueOnServer = useMutation(api.game.counters.setValue);
  const move = useMutation(api.game.counters.move);
  const remove = useMutation(api.game.counters.remove);
  const toast = useToast((state) => state.toast);
  useEffect(() => {
    if (!editing) setValue(counter.value);
  }, [counter.value, editing]);
  useEffect(() => {
    if (editing) input.current?.focus();
  }, [editing]);
  const act = async (operation: Promise<unknown>) => {
    try {
      await operation;
    } catch {
      toast("Could not update counter", "error");
    }
  };
  return (
    <PositionedPiece
      label="counter"
      position={position}
      area={area}
      size={{ width: 32, height: 32 }}
      opponent={opponent}
      onMove={
        opponent
          ? undefined
          : (position) => move({ counterId: counter.id, position })
      }
    >
      <div
        role="button"
        tabIndex={opponent ? -1 : 0}
        aria-label={`Counter ${counter.value}`}
        className="rounded-full w-8 h-8 border-2 border-base-content/30 text-black font-bold flex items-center justify-center shadow"
        style={{
          backgroundColor:
            colors[counter.color as (typeof COUNTER_COLORS)[number]][300],
        }}
        onDoubleClick={opponent ? undefined : () => setEditing(true)}
        onKeyDown={(event) => {
          if (!opponent && !editing && event.key === "Enter") setEditing(true);
        }}
        onContextMenu={
          opponent
            ? undefined
            : (event) => {
                event.preventDefault();
                event.stopPropagation();
                setMenu({ x: event.clientX, y: event.clientY });
              }
        }
      >
        {editing ? (
          <input
            ref={input}
            aria-label="Counter value"
            value={value}
            maxLength={4}
            className="w-full bg-transparent text-center outline-none"
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.currentTarget.blur();
            }}
            onBlur={() => {
              setEditing(false);
              if (value !== counter.value)
                void act(setValueOnServer({ counterId: counter.id, value }));
            }}
          />
        ) : (
          value
        )}
      </div>
      <CustomContextMenu
        x={menu?.x ?? 0}
        y={menu?.y ?? 0}
        isVisible={menu !== null}
        onClose={() => setMenu(null)}
        menuItems={[
          { label: "Edit counter", action: () => setEditing(true) },
          {
            label: "Delete counter",
            action: () => void act(remove({ counterId: counter.id })),
          },
        ]}
      />
    </PositionedPiece>
  );
};
export default Counter;
