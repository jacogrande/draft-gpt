import { HeartIcon } from "@heroicons/react/16/solid";
import { useEffect, useState } from "react";
import { GamePlayer } from "~/hooks/game/useGame";
import { useGameActions } from "~/hooks/game/useGameActions";
import { useGlobalStore } from "~/hooks/useGlobalStore";

type LifeTotalEditorProps = { player: GamePlayer; editable: boolean };

const LifeTotalEditor = ({ player, editable }: LifeTotalEditorProps) => {
  const [lifeTotal, setLifeTotal] = useState<string>(String(player.life));
  const [focused, setFocused] = useState(false);
  const { setLife } = useGameActions();
  const setPauseCommands = useGlobalStore((state) => state.setPauseCommands);

  useEffect(() => {
    if (!focused) setLifeTotal(String(player.life));
  }, [player.life, focused]);

  const handleFocus = () => {
    setFocused(true);
    setPauseCommands(true);
  };

  const handleBlur = () => {
    setFocused(false);
    setPauseCommands(false);
    const life = Number(lifeTotal);
    if (lifeTotal === "" || !Number.isInteger(life) || life === player.life) {
      setLifeTotal(String(player.life));
      return;
    }
    void setLife(life);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") e.currentTarget.blur();
  };

  if (!editable)
    return (
      <div className="w-full py-4 rounded border flex items-center relative">
        <HeartIcon className="h-5 w-5 absolute left-2" />
        <p className="text-center flex-1">{player.life}</p>
      </div>
    );
  return (
    <div className="w-full flex items-center relative">
      <HeartIcon className="h-5 w-5 absolute left-2" />
      <input
        type="number"
        aria-label="Your life total"
        className="w-full py-4 text-center pl-3 rounded border flex items-center justify-center"
        value={lifeTotal}
        onChange={(e) => setLifeTotal(e.target.value)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
};

export default LifeTotalEditor;
