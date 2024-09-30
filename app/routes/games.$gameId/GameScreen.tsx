import { useGameStore } from "~/hooks/game/useGame";

const GameScreen = () => {
  const { game } = useGameStore();
  return (
    <div className="flex-1">
      <p>Game Screen</p>
    </div>
  );
};

export default GameScreen;
