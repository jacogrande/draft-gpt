import { usePacksStore } from "~/hooks/lobby/usePacks";
import { CARD_COLORS } from "~/util/constants";
import { getCardColor } from "~/util/getCardColor";
import { Card as CardType } from "~/util/types";

type CardProps = {
  card?: CardType;
  disabled?: boolean;
};

const CARD_WIDTH = 250;
const CARD_HEIGHT = 350;
const DEFAULT_SCALE = 1;
export const CARD_WIDTH_SCALED = CARD_WIDTH * DEFAULT_SCALE;

const Card = ({ card, disabled }: CardProps) => {
  const selectedCard = usePacksStore((state) => state.selectedCard);
  const setSelectedCard = usePacksStore((state) => state.setSelectedCard);
  if (!card) return null;

  const getTypeLetterSpacing = () => {
    if (card.legendary && card.subtype) return "-0.05em";
    if (card.legendary || card.subtype) return "-0.025em";
    return "0";
  };

  const handleClick = () => {
    setSelectedCard(card);
  };

  const cardColor = getCardColor(card.mana_cost);
  return (
    <button
      className={`card border border-4 p-2 pb-3 scale-100 hover:scale-105 transition hover:z-10 flex flex-col items-center relative text-2xs ${
        card.id === selectedCard?.id ? "border-primary" : "border-base-300"
      } ${CARD_COLORS[cardColor]}`}
      style={{
        width: `${CARD_WIDTH}px`,
        height: `${CARD_HEIGHT}px`,
      }}
      disabled={disabled}
      onClick={handleClick}
    >
      {/* NAME AND COST */}
      <div className="flex justify-between items-center bg-base-100 w-full rounded-md py-1 px-2 border border-base-300">
        <p>{card.name}</p>
        <p>{card.mana_cost}</p>
      </div>
      {/* IMAGE */}
      <div className="w-[97%] h-36 bg-gray-300 object-cover">
        {card.image_url && <img src={card.image_url} alt={card.name} />}
      </div>
      {/* TYPE */}
      <div
        className="flex items-center gap-2 bg-base-100 w-full rounded-md py-1 px-2 border border-base-300 justify-between"
        style={{ letterSpacing: getTypeLetterSpacing() }}
      >
        <p>
          {card.legendary && "Legendary"} {card.type}{" "}
          {card.subtype && " - " + card.subtype}
        </p>
        <p>{card.rarity.slice(0, 1)}</p>
      </div>
      {/* CARD BODY */}
      <div className="flex flex-col gap-4 p-2 w-[97%] flex-1 bg-base-100 rounded-b-md justify-center">
        <p>{card.rules_text}</p>
      </div>
      {/* POWER AND TOUGHNESS */}
      {card.type.toLowerCase() === "creature" && (
        <div className="absolute bottom-2 right-2 px-3 py-1 bg-base-100 rounded-xl border border-base-300">
          <p className="text-xs">
            {card.power} / {card.toughness}
          </p>
        </div>
      )}
    </button>
  );
};

export default Card;
