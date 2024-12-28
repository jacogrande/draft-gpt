import { useEffect, useMemo, useRef } from "react";
import { useGameStore } from "~/hooks/game/useGame";
import { useZoneRefs } from "~/hooks/game/useZoneRefs";
import { useUser } from "~/hooks/useUser";

import DeckDisplay from "~/routes/games.$gameId/Components/DeckDisplay";
import DraggableGameCard from "~/routes/games.$gameId/Components/DraggableGameCard";
import DraggableGameToken from "~/routes/games.$gameId/Components/DraggableGameToken";
import GraveyardDisplay from "~/routes/games.$gameId/Components/GraveyardDisplay";
import useContextMenu from "~/routes/games.$gameId/Components/useContextMenu";
import { GAME_SCALE } from "~/util/constants";

const PlayerField = () => {
  const { game } = useGameStore();
  const { setDeckRef, setBattlefieldRef, setGraveyardRef } = useZoneRefs();
  const { user } = useUser();

  // ========= ZONE LOADING ========= //
  const playerDeck = user && game && game.decks[user.uid];
  const deckRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const graveyardRef = useRef<HTMLDivElement>(null);

  const { lands, battlefieldCards } = useMemo(() => {
    const battlefield = playerDeck?.battlefield ?? [];
    const lands = battlefield.filter(
      (card) => card.type === "Land" || card.type === "Basic Land"
    );
    const otherCards = battlefield.filter(
      (card) => card.type !== "Land" && card.type !== "Basic Land"
    );
    return { lands, battlefieldCards: otherCards };
  }, [playerDeck]);

  // ========= TOKENS FOR THIS USER ========= //
  const playerTokens = useMemo(() => {
    if (!game?.tokens || !user?.uid) return [];
    return game.tokens.filter((token) => token.ownerId === user.uid);
  }, [game, user]);

  // ========= CONTEXT MENU ========= //
  const { handleContextMenu, component: contextMenu } = useContextMenu();

  // ========= REF EFFECT ========= //
  useEffect(() => {
    setDeckRef(deckRef);
    setBattlefieldRef(fieldRef);
    setGraveyardRef(graveyardRef);
  }, [
    deckRef,
    fieldRef,
    graveyardRef,
    setDeckRef,
    setBattlefieldRef,
    setGraveyardRef,
  ]);

  if (!playerDeck) return null;

  return (
    <div
      className="flex-1 flex flex-col border border-base-100 relative"
      ref={fieldRef}
      onContextMenu={handleContextMenu}
    >
      {/* Battlefield: Non-land cards + tokens */}
      <div className="flex-1 flex gap-2 items-center">
        {battlefieldCards.map((card) => (
          <DraggableGameCard key={card.id} card={card} zone="battlefield" />
        ))}
        {/* Render the tokens that belong to this user */}
        {playerTokens.map((token) => (
          <DraggableGameToken key={token.id} token={token} scale={GAME_SCALE} />
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

        <div className="border border-base-100 mt-3 ml-2" ref={graveyardRef}>
          <GraveyardDisplay deck={playerDeck} scale={GAME_SCALE} />
        </div>
      </div>

      {/* Custom context menu (rendered by useContextMenu) */}
      {contextMenu}
    </div>
  );
};

export default PlayerField;
