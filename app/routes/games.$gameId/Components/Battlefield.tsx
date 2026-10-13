import { useEffect, useRef } from "react";
import Card from "~/components/Card";
import { GameCard, GameSide, splitBattlefield } from "~/hooks/game/useGame";
import { useZoneRefs } from "~/hooks/game/useZoneRefs";
import { GAME_SCALE } from "~/util/constants";
import DeckDisplay from "./DeckDisplay";
import DraggableGameCard from "./DraggableGameCard";
import GraveyardDisplay from "./GraveyardDisplay";
import PieceArea from "./PieceArea";
import useContextMenu from "./useContextMenu";

const CardRow = ({
  cards,
  opponent,
}: {
  cards: GameCard[];
  opponent: boolean;
}) => (
  <div className="overflow-x-auto min-w-0 flex-1">
    <div
      className={`flex w-max min-w-full gap-2 p-3 ${
        opponent ? "flex-row-reverse" : ""
      }`}
    >
      {cards.map((card) => (
        <div
          key={card.id}
          className="w-[170px] h-[170px] shrink-0 flex items-center justify-center"
        >
          {opponent ? (
            <div className="rotate-180">
              <Card card={card} scale={GAME_SCALE} readOnly />
            </div>
          ) : (
            <DraggableGameCard card={card} zone="battlefield" />
          )}
        </div>
      ))}
    </div>
  </div>
);

const Battlefield = ({
  ownerId,
  side,
  opponent = false,
}: {
  ownerId: string;
  side: GameSide;
  opponent?: boolean;
}) => {
  const field = useRef<HTMLDivElement>(null);
  const deck = useRef<HTMLDivElement>(null);
  const graveyard = useRef<HTMLDivElement>(null);
  const { setBattlefieldRef, setDeckRef, setGraveyardRef } = useZoneRefs();
  const { lands, spells } = splitBattlefield(side.battlefield);
  const menu = useContextMenu();
  useEffect(() => {
    if (opponent) return;
    setBattlefieldRef(field);
    setDeckRef(deck);
    setGraveyardRef(graveyard);
    return () => {
      setBattlefieldRef(null);
      setDeckRef(null);
      setGraveyardRef(null);
    };
  }, [opponent, setBattlefieldRef, setDeckRef, setGraveyardRef]);
  return (
    <section
      ref={field}
      data-field={opponent ? "opponent" : "player"}
      aria-label={opponent ? "Opponent battlefield" : "Your battlefield"}
      onContextMenu={opponent ? undefined : menu.handleContextMenu}
      className={`shrink-0 min-w-0 border border-base-300 rounded-lg p-2 flex gap-2 ${
        opponent ? "flex-col-reverse" : "flex-col"
      }`}
    >
      <div className="flex items-center justify-between text-xs opacity-70 px-2">
        <span>{opponent ? "Opponent battlefield" : "Your battlefield"}</span>
        {opponent ? (
          <span data-opponent-hand>
            {side.handCount} in hand · {side.graveyard.length} in graveyard
          </span>
        ) : (
          <button
            className="btn btn-xs btn-ghost"
            onClick={menu.handleContextMenu}
          >
            Add token / counter
          </button>
        )}
      </div>
      {spells.length > 0 && <CardRow cards={spells} opponent={opponent} />}
      <div
        className={`flex min-w-0 items-center gap-2 ${
          opponent ? "flex-row-reverse" : ""
        }`}
      >
        <div className="flex-1 min-w-0">
          <PieceArea ownerId={ownerId} opponent={opponent} />
        </div>
        <div
          ref={opponent ? undefined : deck}
          className="shrink-0 border border-base-100 p-1"
        >
          <DeckDisplay
            count={side.libraryCount}
            scale={GAME_SCALE}
            own={!opponent}
          />
        </div>
        <div
          ref={opponent ? undefined : graveyard}
          className="shrink-0 border border-base-100 p-1"
        >
          <GraveyardDisplay
            cards={side.graveyard}
            scale={GAME_SCALE}
            own={!opponent}
          />
        </div>
      </div>
      {lands.length > 0 && <CardRow cards={lands} opponent={opponent} />}
      {!opponent && menu.component}
    </section>
  );
};
export default Battlefield;
