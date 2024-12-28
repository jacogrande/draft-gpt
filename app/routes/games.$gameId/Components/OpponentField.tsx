import { useMemo } from "react";
import Card from "~/components/Card";
import { useGameStore } from "~/hooks/game/useGame";
import { useUser } from "~/hooks/useUser";
import DeckDisplay from "~/routes/games.$gameId/Components/DeckDisplay";
import DraggableGameToken from "~/routes/games.$gameId/Components/DraggableGameToken";
import { GAME_SCALE } from "~/util/constants";

const OpponentField = () => {
  const { game } = useGameStore();
  const { user } = useUser();
  const opponentDeck = useMemo(() => {
    if (!game || !user) return null;
    const opponentId = game.activeUsers.find(
      (activeUser) => activeUser.uid !== user.uid
    )?.uid;
    if (!opponentId) return null;
    return game.decks[opponentId];
  }, [game, user]);

  const { lands, battlefieldCards } = useMemo(() => {
    const battlefield = opponentDeck?.battlefield || [];
    const lands =
      battlefield.filter(
        (card) => card.type === "Land" || card.type === "Basic Land"
      ) || [];
    const otherCards =
      battlefield.filter(
        (card) => card.type !== "Land" && card.type !== "Basic Land"
      ) || [];
    return { lands, battlefieldCards: otherCards };
  }, [opponentDeck]);

  // ========= TOKENS FOR THIS USER ========= //
  const opponentTokens = useMemo(() => {
    if (!game?.tokens || !user?.uid) return [];
    return game.tokens.filter((token) => token.ownerId !== user.uid);
  }, [game, user]);

  if (!opponentDeck) return null;
  return (
    <div className="flex-1 flex flex-col gap-4">
      {/* Deck / Lands */}
      <div className="flex">
        <DeckDisplay deck={opponentDeck} scale={GAME_SCALE} />
        <div className="flex-1 flex gap-2">
          {lands.map((card) => (
            <div key={card.id} className="rotate-180">
              <Card card={card} scale={GAME_SCALE} />
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 flex gap-2 items-center">
        {battlefieldCards.map((card) => (
          <div key={card.id} className="rotate-180">
            <Card card={card} scale={GAME_SCALE} />
          </div>
        ))}
        {opponentTokens.map((token) => (
          <div key={token.id} className="rotate-180">
            <DraggableGameToken token={token} scale={GAME_SCALE} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default OpponentField;
