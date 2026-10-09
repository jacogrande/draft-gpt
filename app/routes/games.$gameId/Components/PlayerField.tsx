import { useEffect, useRef } from "react";
import {
  GameSide,
  splitBattlefield,
  useGameExtras,
} from "~/hooks/game/useGame";
import { useZoneRefs } from "~/hooks/game/useZoneRefs";
import DeckDisplay from "~/routes/games.$gameId/Components/DeckDisplay";
import DraggableGameCard from "~/routes/games.$gameId/Components/DraggableGameCard";
import DraggableGameToken from "~/routes/games.$gameId/Components/DraggableGameToken";
import GraveyardDisplay from "~/routes/games.$gameId/Components/GraveyardDisplay";
import useContextMenu from "~/routes/games.$gameId/Components/useContextMenu";
import { GAME_SCALE } from "~/util/constants";

type PlayerFieldProps = { ownerId: string; side: GameSide };

const PlayerField = ({ ownerId, side }: PlayerFieldProps) => {
  const { setDeckRef, setBattlefieldRef, setGraveyardRef } = useZoneRefs();
  const deckRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const graveyardRef = useRef<HTMLDivElement>(null);
  const { lands, spells } = splitBattlefield(side.battlefield);
  const tokens = useGameExtras().tokens.filter(
    (token) => token.ownerId === ownerId
  );
  const { handleContextMenu, component: contextMenu } = useContextMenu();

  useEffect(() => {
    setDeckRef(deckRef);
    setBattlefieldRef(fieldRef);
    setGraveyardRef(graveyardRef);
  }, [setDeckRef, setBattlefieldRef, setGraveyardRef]);

  return (
    <div
      className="flex-1 flex flex-col border border-base-100 relative"
      ref={fieldRef}
      onContextMenu={handleContextMenu}
      data-field="player"
    >
      <div className="flex-1 flex gap-2 items-center">
        {spells.map((card) => (
          <DraggableGameCard key={card.id} card={card} zone="battlefield" />
        ))}
        {tokens.map((token) => (
          <DraggableGameToken key={token.id} token={token} scale={GAME_SCALE} />
        ))}
      </div>

      <div className="flex">
        <div className="flex-1 flex gap-2">
          {lands.map((card) => (
            <DraggableGameCard key={card.id} card={card} zone="battlefield" />
          ))}
        </div>

        <div className="border border-base-100" ref={deckRef}>
          <DeckDisplay count={side.libraryCount} scale={GAME_SCALE} own />
        </div>

        <div className="border border-base-100 mt-3 ml-2" ref={graveyardRef}>
          <GraveyardDisplay cards={side.graveyard} scale={GAME_SCALE} />
        </div>
      </div>

      {contextMenu}
    </div>
  );
};

export default PlayerField;
