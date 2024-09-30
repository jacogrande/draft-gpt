import { useMemo } from "react";
import { useGameStore } from "~/hooks/game/useGame";
import { useUser } from "~/hooks/useUser";
import DeckDisplay from "~/routes/games.$gameId/Components/DeckDisplay";
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

  if (!opponentDeck) return null;
  return (
    <div className="flex-1 flex flex-col gap-4">
      {/* Deck / Lands */}
      <div className="flex">
        <DeckDisplay deck={opponentDeck} scale={GAME_SCALE} />
      </div>
    </div>
  );
};

export default OpponentField;
