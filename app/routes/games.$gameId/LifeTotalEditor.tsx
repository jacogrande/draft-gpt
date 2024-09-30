import { useEffect, useState } from "react";
import { useGameStore } from "~/hooks/game/useGame";
import { useUser } from "~/hooks/useUser";
import { updateLifeTotal } from "~/model/game";
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
      <div className="w-24 h-24 rounded border flex items-center justify-center">
        {game.lifeTotals[userId]}
      </div>
    );

  //========= LIFE INPUT =========//
  return (
    <input
      type="number"
      className="w-24 h-24 text-center pl-3 rounded border flex items-center justify-center"
      value={lifeTotal}
      onChange={handleChange}
    />
  );
};

export default LifeTotalEditor;
