import { useEffect, useMemo, useRef } from "react";
import { useGameStore } from "~/hooks/game/useGame";
import { useZoneRefs } from "~/hooks/game/useZoneRefs";
import { useUser } from "~/hooks/useUser";
import DeckDisplay from "~/routes/games.$gameId/Components/DeckDisplay";
import DraggableGameCard from "~/routes/games.$gameId/Components/DraggableGameCard";
import useContextMenu from "~/routes/games.$gameId/Components/useContextMenu";
import { GAME_SCALE } from "~/util/constants";

const PlayerField = () => {
  const { game } = useGameStore();
  const { setDeckRef, setBattlefieldRef } = useZoneRefs();
  const { user } = useUser();
  const { handleRightClick, contextMenu } = useContextMenu();
  //========= ZONE LOADING =========//
  const playerDeck = user && game && game.decks[user.uid];
  const deckRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const { lands, battlefieldCards } = useMemo(() => {
    const battlefield = playerDeck?.battlefield || [];
    const lands =
      battlefield.filter(
        (card) => card.type === "Land" || card.type === "Basic Land"
      ) || [];
    const otherCards =
      battlefield.filter(
        (card) => card.type !== "Land" && card.type !== "Basic Land"
      ) || [];
    return { lands, battlefieldCards: otherCards };
  }, [playerDeck]);

  useEffect(() => {
    setDeckRef(deckRef);
    setBattlefieldRef(fieldRef);
  }, [deckRef, fieldRef, setDeckRef, setBattlefieldRef]);

  if (!playerDeck) return null;
  return (
    <div
      className="flex-1 flex flex-col border border-base-100 relative"
      ref={fieldRef}
    >
      <div className="flex-1 flex gap-2 items-center">
        {battlefieldCards.map((card) => (
          <DraggableGameCard key={card.id} card={card} zone="battlefield" />
        ))}
      </div>
      {/* Deck / Lands */}
      <div className="flex">
        <div className="flex-1 flex gap-2">
          {lands.map((card) => (
            <DraggableGameCard key={card.id} card={card} zone="battlefield" />
          ))}
        </div>
        <div className="border border-base-100" ref={deckRef}>
          <DeckDisplay deck={playerDeck} scale={GAME_SCALE} />
        </div>
        <div className="border border-base-100"></div>
      </div>
      {contextMenu}
    </div>
  );
};

export default PlayerField;
