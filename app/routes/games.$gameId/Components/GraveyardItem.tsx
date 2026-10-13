import ManaCost from "~/components/ManaCost";
import { GameCard } from "~/hooks/game/useGame";
import { useGameActions } from "~/hooks/game/useGameActions";
import { useGlobalStore } from "~/hooks/useGlobalStore";
import DraggableGameCard from "./DraggableGameCard";

const GraveyardItem = ({ card, own }: { card: GameCard; own: boolean }) => {
  const peek = useGlobalStore((state) => state.setPeekedCard);
  const { moveCards } = useGameActions();
  const face = (
    <button
      onMouseEnter={() => peek(card)}
      onFocus={() => peek(card)}
      onClick={() => peek(card)}
      className="handle flex items-center justify-between gap-2 rounded border border-base-300 p-2 w-full text-left text-sm"
    >
      <span>{card.name}</span>
      <ManaCost manaCost={card.mana_cost} />
    </button>
  );
  return (
    <li className="flex flex-col gap-1">
      {own ? (
        <DraggableGameCard
          card={card}
          zone="graveyard"
          childrenOverride={face}
        />
      ) : (
        face
      )}
      {own && (
        <div className="flex gap-1">
          {(["hand", "battlefield", "library"] as const).map((zone) => (
            <button
              key={zone}
              className="btn btn-xs btn-ghost"
              onClick={() => void moveCards([card.id], zone)}
            >
              To {zone}
            </button>
          ))}
        </div>
      )}
    </li>
  );
};
export default GraveyardItem;
