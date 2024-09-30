import { useState } from "react";
import Draggable from "react-draggable";
import Card from "~/components/Card";
import { GAME_SCALE } from "~/util/constants";
import { Card as CardType } from "~/util/types";

const DraggableGameCard = ({ card }: { card: CardType }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleStop = () => {
    setIsDragging(false);
  };

  return (
    <Draggable
      axis="both"
      handle=".handle"
      defaultPosition={{ x: 0, y: 0 }}
      grid={[10, 10]}
      scale={1}
      onStop={handleStop}
      onStart={() => setIsDragging(true)}
    >
      <div>
        <div className={`transition-transform ${isDragging && "-rotate-12"}`}>
          <Card card={card} scale={GAME_SCALE} />
        </div>
      </div>
    </Draggable>
  );
};

export default DraggableGameCard;
