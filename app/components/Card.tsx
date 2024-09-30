import { useEffect, useRef } from "react";
import ManaCost from "~/components/ManaCost";
import { usePacksStore } from "~/hooks/lobby/usePacks";
import { useGlobalStore } from "~/hooks/useGlobalStore";
import { CARD_COLORS, CARD_TEXTURES } from "~/util/constants";
import { getCardColor } from "~/util/getCardColor";
import { Card as CardType } from "~/util/types";

type CardProps = {
  card?: CardType;
  disabled?: boolean;
  scale?: number;
};

const DEFAULTS = {
  WIDTH: 250,
  HEIGHT: 350,
  IMAGE_WIDTH: (250 - 16 /* padding */ - 8) /* border */ * 0.98,
  IMAGE_HEIGHT: 144,
  FONT_SIZE: 11,
  PADDING: 8,
  BORDER_RADIUS: 16,
  SCALE: 1,
  PT_CONTAINER: {
    BOTTOM: 8,
    RIGHT: 8,
    PX: 12,
    PY: 4,
  },
};

export const CARD_WIDTH_SCALED = DEFAULTS.WIDTH * DEFAULTS.SCALE;

const Card = ({ card, disabled, scale = DEFAULTS.SCALE }: CardProps) => {
  const styles = {
    width: `${DEFAULTS.WIDTH * scale}px`,
    height: `${DEFAULTS.HEIGHT * scale}px`,
    imageWidth: `${DEFAULTS.IMAGE_WIDTH * scale}px`,
    imageHeight: `${DEFAULTS.IMAGE_HEIGHT * scale}px`,
    fontSize: `${DEFAULTS.FONT_SIZE * scale}px`,
    padding: `${DEFAULTS.PADDING * scale}px`,
    borderRadius: `${DEFAULTS.BORDER_RADIUS * scale}px`,
    PT_CONTAINER: {
      bottom: `${DEFAULTS.PT_CONTAINER.BOTTOM * scale}px`,
      right: `${DEFAULTS.PT_CONTAINER.RIGHT * scale}px`,
      padding: `${DEFAULTS.PT_CONTAINER.PY * scale}px ${
        DEFAULTS.PT_CONTAINER.PX * scale
      }px`,
    },
  };
  const selectedCard = usePacksStore((state) => state.selectedCard);
  const setSelectedCard = usePacksStore((state) => state.setSelectedCard);
  const setPeekedCard = useGlobalStore((state) => state.setPeekedCard);
  const cardRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!cardRef.current || !card) return;
    // add hover listener
    const handleMouseEnter = () => {
      setPeekedCard(card);
    };
    cardRef.current.addEventListener("mouseenter", handleMouseEnter);
    return () => {
      cardRef.current?.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [cardRef, card, setPeekedCard]);

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
  const texture = CARD_TEXTURES[cardColor];

  return (
    <button
      className={`handle card border border-2 pb-3 hover:scale-105 scale-100 transition flex flex-col items-center relative ${
        card.id === selectedCard?.id ? "border-primary" : "border-black"
      } ${CARD_COLORS[cardColor]} ${!disabled && "hover:z-10"}`}
      style={{
        width: styles.width,
        height: styles.height,
        fontSize: styles.fontSize,
        backgroundImage: `url(${texture})`,
        padding: styles.padding,
        borderRadius: styles.borderRadius,
      }}
      ref={cardRef}
      disabled={disabled}
      onClick={handleClick}
    >
      {/* NAME AND COST */}
      <div className="flex justify-between items-center bg-base-100 w-full rounded-md py-1 px-2 border border-black">
        <p>{card.name}</p>
        {/* <p>{card.mana_cost}</p> */}
        <ManaCost manaCost={card.mana_cost} scale={scale} />
      </div>
      {/* IMAGE */}
      {card.image_url && (
        <img
          src={card.image_url}
          alt={card.name}
          loading="lazy"
          width={styles.imageWidth}
          height={styles.imageHeight}
          className="border-x-2 border-black"
          draggable="false"
        />
      )}
      {/* TYPE */}
      <div
        className="flex items-center gap-2 bg-base-100 w-full rounded-md py-1 px-2 border border-black justify-between"
        style={{ letterSpacing: getTypeLetterSpacing() }}
      >
        <p>
          {card.legendary && "Legendary"} {card.type}{" "}
          {card.subtype && " - " + card.subtype}
        </p>
        <p>{card.rarity.slice(0, 1)}</p>
      </div>
      {/* CARD BODY */}
      <div className="flex flex-col gap-4 p-2 w-[97%] flex-1 bg-base-100 rounded-b-md justify-center border border-black border-t-0">
        <p>{card.rules_text}</p>
      </div>
      {/* POWER AND TOUGHNESS */}
      {card.type.toLowerCase() === "creature" && (
        <div
          className="absolute px-3 py-1 bg-base-100 rounded-xl border border-black"
          style={styles.PT_CONTAINER}
        >
          <p>
            {card.power} / {card.toughness}
          </p>
        </div>
      )}
    </button>
  );
};

export default Card;
