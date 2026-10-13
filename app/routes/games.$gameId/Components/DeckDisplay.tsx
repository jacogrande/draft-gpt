import { useState } from "react";
import { useGameActions } from "~/hooks/game/useGameActions";
import CustomContextMenu from "./CustomContextMenu";

const DeckDisplay = ({
  count,
  scale = 1,
  own = false,
}: {
  count: number;
  scale?: number;
  own?: boolean;
}) => {
  const { shuffle, draw } = useGameActions();
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  return (
    <>
      <button
        aria-label={`${own ? "Your" : "Opponent"} library: ${count} cards`}
        aria-disabled={!own}
        data-library-count={count}
        className="relative rounded-md bg-black border border-base-content/30 shrink-0"
        style={{ width: 250 * scale, height: 350 * scale }}
        onClick={(event) => {
          if (!own) return;
          const rect = event.currentTarget.getBoundingClientRect();
          setMenu({ x: rect.left, y: rect.bottom });
        }}
        onContextMenu={(event) => {
          if (!own) return;
          event.preventDefault();
          event.stopPropagation();
          setMenu({ x: event.clientX, y: event.clientY });
        }}
      >
        <img
          src="/textures/back.jpg"
          alt=""
          draggable={false}
          className={`rounded ${own ? "" : "rotate-180"}`}
        />
        <span className="absolute bottom-1 left-1 right-1 rounded bg-black/80 text-white text-xs">
          Library · {count}
        </span>
      </button>
      <CustomContextMenu
        x={menu?.x ?? 0}
        y={menu?.y ?? 0}
        isVisible={menu !== null}
        onClose={() => setMenu(null)}
        menuItems={[
          { label: "Draw card", action: () => void draw(1) },
          { label: "Draw seven", action: () => void draw(7) },
          { label: "Shuffle", action: () => void shuffle() },
        ]}
      />
    </>
  );
};
export default DeckDisplay;
