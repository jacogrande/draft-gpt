import { useMemo } from "react";
import { Deck } from "~/util/types";

type GraveyardDisplayProps = {
  deck: Deck;
  scale?: number;
};

const GraveyardDisplay = ({ deck, scale = 1 }: GraveyardDisplayProps) => {
  const styles = useMemo(
    () => ({
      width: 250 * scale,
      height: 350 * scale,
    }),
    [scale]
  );
  const textStyles = useMemo(
    () => ({
      fontSize: 32 * scale,
      lineHeight: 14 * scale,
    }),
    [scale]
  );
  return (
    <div className="drawer drawer-end">
      <input id="my-drawer-4" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content">
        <label
          htmlFor="my-drawer-4"
          style={styles}
          className="border rounded-md bg-base-200 flex items-center justify-center hover:cursor-pointer"
        >
          <p style={textStyles} className="font-bold">
            {deck.graveyard?.length || 0}
          </p>
        </label>
      </div>
      <div className="drawer-side">
        <label
          htmlFor="my-drawer-4"
          aria-label="close sidebar"
          className="drawer-overlay"
        ></label>
        <ul className="menu bg-base-200 text-base-content min-h-full w-80 p-4">
          {/* Sidebar content here */}
          <li>
            <a>Sidebar Item 1</a>
          </li>
          <li>
            <a>Sidebar Item 2</a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default GraveyardDisplay;
