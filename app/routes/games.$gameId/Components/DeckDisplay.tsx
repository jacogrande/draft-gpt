import { useMemo, useState } from "react";
import { useGameStore } from "~/hooks/game/useGame";
import { useUser } from "~/hooks/useUser";
import { shuffleDeck, drawCards } from "~/model/game/deck";
import { Deck } from "~/util/types";

type DeckDisplayProps = {
  deck: Deck;
  scale?: number;
};

const DeckDisplay = ({ deck, scale = 1 }: DeckDisplayProps) => {
  const { game } = useGameStore();
  const { user } = useUser();
  const [isHovered, setIsHovered] = useState(false);
  const isPlayerDeck = user && deck.createdBy === user.uid;

  const styles = useMemo(
    () => ({
      width: 250 * scale,
      height: 350 * scale,
      boxShadow: `-${7 * scale}px ${7 * scale}px 0px rgba(0, 0, 0, 1), ${
        -14 * scale
      }px ${14 * scale}px 0px rgba(0, 0, 0, 1), -${21 * scale}px ${
        21 * scale
      }px 0px rgba(0, 0, 0, 1)`,
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

  const handleShuffle = async () => {
    if (!user || !game) return;
    await shuffleDeck(game.id, user.uid);
  };

  const handleDrawCard = (amount: number) => async () => {
    if (!user || !game) return;
    await drawCards(game.id, deck, user.uid, amount);
  };

  const drawOne = handleDrawCard(1);
  const drawSeven = handleDrawCard(7);

  return (
    <div className="dropdown dropdown-top dropdown-end">
      <div
        style={styles}
        role="button"
        tabIndex={0}
        className="relative rounded-md ml-4 bg-black"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <img
          src="/textures/back.jpg"
          alt="card back"
          className={`rounded ${!isPlayerDeck && "rotate-180"}`}
        />
        <div
          className={`absolute top-0 flex items-center justify-center left-0 w-full h-full bg-black transition-opacity rounded-md ${
            isHovered ? "opacity-70" : "opacity-0"
          }`}
        >
          <p className="text-white font-bold" style={textStyles}>
            {deck.cards.length}
          </p>
        </div>

        {isPlayerDeck && (
          <ul className="dropdown-content flex flex-col shadow bg-base-100 rounded-md z-10 min-w-36 prose">
            <li className="flex-1 w-full m-0 p-0">
              <button
                className="btn btn-ghost btn-sm w-full"
                onClick={handleShuffle}
              >
                Shuffle
              </button>
            </li>
            <li className="flex-1 w-full m-0 p-0">
              <button className="btn btn-ghost btn-sm w-full" onClick={drawOne}>
                Draw Card
              </button>
            </li>

            <li className="flex-1 w-full m-0 p-0">
              <button
                className="btn btn-ghost btn-sm w-full"
                onClick={drawSeven}
              >
                Draw Hand
              </button>
            </li>
          </ul>
        )}
      </div>
    </div>
  );
};

export default DeckDisplay;
