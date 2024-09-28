import { useParams } from "@remix-run/react";
import { verifySession } from "~/.server/session";
import Heading from "~/components/Heading";
import Page from "~/components/Page";
import { useGame } from "~/hooks/game/useGame";
import GameDetails from "~/routes/games.$gameId/GameDetails";
import GameScreen from "~/routes/games.$gameId/GameScreen";
import Hand from "~/routes/games.$gameId/Hand";

export const loader = verifySession;

const GameRoute = () => {
  const params = useParams();
  const gameId = params.gameId as string;
  const { loading, error } = useGame(gameId);

  if (loading)
    return (
      <Page>
        <span className="loading loading-dots loading-lg"></span>
      </Page>
    );
  if (error)
    return (
      <Page>
        <Heading>Error</Heading>
        <p>Unable to load game</p>
      </Page>
    );
  return (
    <Page>
      <div className="flex gap-8 flex-1 w-full">
        <GameDetails />
        <div className="flex flex-1 flex-col gap-8">
          <GameScreen />
          <Hand />
        </div>
      </div>
    </Page>
  );
};

export default GameRoute;
