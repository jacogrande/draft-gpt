import Card from "~/components/Card";
import {
  GameSide,
  splitBattlefield,
  useGameExtras,
} from "~/hooks/game/useGame";
import DeckDisplay from "~/routes/games.$gameId/Components/DeckDisplay";
import TokenFace from "~/routes/games.$gameId/Components/TokenFace";
import { GAME_SCALE } from "~/util/constants";

type OpponentFieldProps = { ownerId: string; side: GameSide };

const OpponentField = ({ ownerId, side }: OpponentFieldProps) => {
  const { lands, spells } = splitBattlefield(side.battlefield);
  const tokens = useGameExtras().tokens.filter(
    (token) => token.ownerId === ownerId
  );

  return (
    <div className="flex-1 flex flex-col gap-4" data-field="opponent">
      <div className="flex">
        <DeckDisplay count={side.libraryCount} scale={GAME_SCALE} />
        <div className="flex-1 flex gap-2">
          {lands.map((card) => (
            <div key={card.id} className="rotate-180">
              <Card card={card} scale={GAME_SCALE} />
            </div>
          ))}
        </div>
        <p className="text-xs opacity-60 self-start" data-opponent-hand>
          {side.handCount} in hand · {side.graveyard.length} in graveyard
        </p>
      </div>
      <div className="flex-1 flex gap-2 items-center">
        {spells.map((card) => (
          <div key={card.id} className="rotate-180">
            <Card card={card} scale={GAME_SCALE} />
          </div>
        ))}
        {tokens.map((token) => (
          <div key={token.id} className="rotate-180">
            <TokenFace token={token} scale={GAME_SCALE} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default OpponentField;
