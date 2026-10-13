import { counterPosition, defaultPosition } from "@convex/game/placement";
import { useEffect, useRef, useState } from "react";
import { useGameExtras } from "~/hooks/game/useGame";
import Counter from "./Counter";
import DraggableGameToken from "./DraggableGameToken";

const PieceArea = ({
  ownerId,
  opponent,
}: {
  ownerId: string;
  opponent: boolean;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const extras = useGameExtras();
  const tokens = extras.tokens.filter((piece) => piece.ownerId === ownerId);
  const counters = extras.counters.filter((piece) => piece.ownerId === ownerId);
  useEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver(([entry]) =>
      setSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      })
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      data-piece-area={opponent ? "opponent" : "player"}
      className="relative min-h-52 w-full rounded bg-base-200/40"
    >
      {tokens.map((token, index) => (
        <DraggableGameToken
          key={token.id}
          token={token}
          area={size}
          opponent={opponent}
          position={token.position ?? defaultPosition(index)}
        />
      ))}
      {counters.map((counter, index) => (
        <Counter
          key={counter.id}
          counter={counter}
          area={size}
          opponent={opponent}
          position={counterPosition(
            counter.position,
            counter.positionSpace,
            index
          )}
        />
      ))}
    </div>
  );
};
export default PieceArea;
