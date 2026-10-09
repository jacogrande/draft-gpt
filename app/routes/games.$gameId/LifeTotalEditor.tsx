import { HeartIcon } from "@heroicons/react/16/solid";
import { useEffect, useState } from "react";
import { GamePlayer } from "~/hooks/game/useGame";
import { useGameActions } from "~/hooks/game/useGameActions";

type LifeTotalEditorProps = { player: GamePlayer; editable: boolean };

const LifeTotalEditor = ({ player, editable }: LifeTotalEditorProps) => {
  const [lifeTotal, setLifeTotal] = useState<string>(String(player.life));
  const { setLife } = useGameActions();

  useEffect(() => setLifeTotal(String(player.life)), [player.life]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLifeTotal(e.target.value);
    const life = Number(e.target.value);
    if (e.target.value !== "" && Number.isInteger(life)) void setLife(life);
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
        onChange={handleChange}
      />
    </div>
  );
};

export default LifeTotalEditor;
