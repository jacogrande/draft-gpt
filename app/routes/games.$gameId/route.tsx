import Page from "~/components/Page";
import { requireAuth } from "~/components/RequireAuth";
import { useGame, useGameId, viewerSeat } from "~/hooks/game/useGame";
import useGameCommands from "~/hooks/game/useGameCommands";
import { useGameHeartbeat } from "~/hooks/game/useGamePresence";
import { useJoinGame } from "~/hooks/game/useJoinGame";
import useShiftSelector from "~/hooks/useShiftSelector";
import DeckPicker from "~/routes/games.$gameId/DeckPicker";
import GameDetails from "~/routes/games.$gameId/GameDetails";
import GameNotice from "~/routes/games.$gameId/GameNotice";
import GameScreen from "~/routes/games.$gameId/GameScreen";
import Hand from "~/routes/games.$gameId/Hand";

const REFUSALS = {
  full: "This game is full.",
  closed: "This game is closed.",
};

const GameRoute = () => {
  const gameId = useGameId();
  const game = useGame();
  const admission = useJoinGame(gameId);
  const seat = game ? viewerSeat(game) : null;
  useGameHeartbeat(gameId, Boolean(seat));
  useShiftSelector();
  const commandMessage = useGameCommands();

  if (game === undefined || admission === "joining")
    return (
      <Page>
        <span className="loading loading-dots loading-lg"></span>
      </Page>
    );
  if (game === null) return <GameNotice>Game not found.</GameNotice>;
  if (admission !== "joined")
    return <GameNotice>{REFUSALS[admission]}</GameNotice>;
  if (game.status === "closed")
    return <GameNotice>{REFUSALS.closed}</GameNotice>;
  if (!seat) return <GameNotice>You are no longer in this game.</GameNotice>;
  return (
    <div className="flex flex-col h-screen items-center justify-center p-4">
      <div className="flex gap-4 flex-1 w-full h-full">
        <GameDetails game={game} />
        <div className="flex flex-1 flex-col gap-2">
          {game.status === "playing" ? (
            <>
              <GameScreen game={game} />
              <Hand cards={seat.side?.hand ?? []} />
            </>
          ) : (
            <div className="flex flex-col gap-8 flex-1 items-center justify-center">
              <DeckPicker game={game} />
            </div>
          )}
        </div>
      </div>
      {commandMessage}
    </div>
  );
};

export default requireAuth(GameRoute);
