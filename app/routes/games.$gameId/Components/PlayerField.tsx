import { useGameStore } from "~/hooks/game/useGame";
import { useUser } from "~/hooks/useUser";
import DeckDisplay from "~/routes/games.$gameId/Components/DeckDisplay";
import { GAME_SCALE } from "~/util/constants";

const PlayerField = () => {
  const { game } = useGameStore();
  const { user } = useUser();
  const playerDeck = user && game && game.decks[user.uid];
  if (!playerDeck) return null;

  return (
    <div className="flex-1 flex flex-col gap-4">
      <div className="flex-1"></div>
      {/* Deck / Lands */}
      <div className="flex">
        <div className="flex-1"></div>
        <DeckDisplay deck={playerDeck} scale={GAME_SCALE} />
      </div>
    </div>
  );
};

export default PlayerField;
