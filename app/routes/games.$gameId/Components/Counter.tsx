import { Counter as CounterType } from "~/util/types";
import colors from "tailwindcss/colors";
import { DefaultColors } from "tailwindcss/types/generated/colors";
import { useGlobalStore } from "~/hooks/useGlobalStore";
import { useGameStore } from "~/hooks/game/useGame";
import { updateCounterValue } from "~/model/game/extras";

const Counter = ({ counter }: { counter: CounterType }) => {
  const bgColor = colors[counter.color as keyof DefaultColors][500];
  const { game } = useGameStore();
  const setPauseCommands = useGlobalStore((state) => state.setPauseCommands);

  const handleFocus = () => {
    setPauseCommands(true);
  };

  const handleBlur = () => {
    setPauseCommands(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!game) return;
    console.log(e.target.value);
    const newValue = e.target.value;
    if (!counter) return;
    updateCounterValue(game.id, counter.id, newValue);
  };

  return (
    <div
      style={{
        top: counter.position.y,
        left: counter.position.x,
        backgroundColor: bgColor,
      }}
      className={`rounded-full w-6 h-6 absolute font-bold text-center text-sm flex items-center justify-center`}
    >
      <input
        type="string"
        value={counter.value}
        className="bg-transparent text-center w-full"
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
      />
    </div>
  );
};

export default Counter;
