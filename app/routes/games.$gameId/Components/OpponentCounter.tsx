import { useMemo } from "react";
import colors from "tailwindcss/colors";
import { DefaultColors } from "tailwindcss/types/generated/colors";
import { Counter } from "~/util/types";

const OpponencyCounter = ({ counter }: { counter: Counter }) => {
  const bgColor = colors[counter.color as keyof DefaultColors][500];
  // We need to invert both axes since the opponent's board is flipped
  const position: { x: number; y: number } = useMemo(() => {
    const screenHeight = document.documentElement.clientHeight;
    return {
      x: counter.position.x,
      y: screenHeight - counter.position.y - 186, // 186 is the height of the hand div + margin
    };
  }, [counter.position]);

  return (
    <div
      style={{
        backgroundColor: bgColor,
        top: position.y,
        left: position.x,
      }}
      className="rounded-full w-6 h-6 absolute font-bold text-center text-sm flex items-center justify-center"
    >
      <span>{counter.value}</span>
    </div>
  );
};

export default OpponencyCounter;
