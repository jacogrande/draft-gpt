import { HeartIcon } from "@heroicons/react/16/solid";
import { useEffect, useState } from "react";
import { useGameStore } from "~/hooks/game/useGame";
import { useUser } from "~/hooks/useUser";
import { updateLifeTotal } from "~/model/game/player";
import { STARTING_LIFE } from "~/util/constants";

const LifeTotalEditor = ({ userId }: { userId: string }) => {
  const [lifeTotal, setLifeTotal] = useState<number>(STARTING_LIFE);
  const { game } = useGameStore();
  const { user } = useUser();

  useEffect(() => {
    if (!game || !user) return;
    if (user.uid !== userId) return;
    setLifeTotal(game.lifeTotals[user.uid]);
  }, [game, user, userId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!game || !user) return;
    const newLifeTotal = Number(e.target.value);
    setLifeTotal(newLifeTotal);
    updateLifeTotal(game.id, user.uid, newLifeTotal);
  };

  if (!game || !user) return null;
  if (user.uid !== userId)
    return (
      <div className="w-full py-4 rounded border flex items-center relative">
        <HeartIcon className="h-5 w-5 absolute left-2" />
        <p className="text-center flex-1">{game.lifeTotals[userId]}</p>
      </div>
    );

  //========= LIFE INPUT =========//
  return (
    <div className="w-full flex items-center relative">
      <HeartIcon className="h-5 w-5 absolute left-2" />
      <input
        type="number"
        className="w-full py-4 text-center pl-3 rounded border flex items-center justify-center"
        value={lifeTotal}
        onChange={handleChange}
      />
    </div>
  );
};

export default LifeTotalEditor;
