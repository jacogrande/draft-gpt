import { Link, useParams } from "@remix-run/react";
import { useEffect, useState } from "react";
import { verifySession } from "~/.server/session";
import Heading from "~/components/Heading";
import Page from "~/components/Page";
import { useGame } from "~/hooks/game/useGame";
import { useUser } from "~/hooks/useUser";
import { joinGame } from "~/model/game";
import DeckPicker from "~/routes/games.$gameId/DeckPicker";
import GameDetails from "~/routes/games.$gameId/GameDetails";
import GameScreen from "~/routes/games.$gameId/GameScreen";
import Hand from "~/routes/games.$gameId/Hand";
import { REQUIRED_PLAYERS_FOR_GAME } from "~/util/constants";

export const loader = verifySession;

const GameRoute = () => {
  const params = useParams();
  const gameId = params.gameId as string;
  const { user } = useUser();
  const { game, loading, error } = useGame(gameId);
  const [gameIsFull, setGameIsFull] = useState<boolean>(false);

  const allReady =
    game && Object.keys(game.readyMap).length === REQUIRED_PLAYERS_FOR_GAME;
  const deckLoaded = game && user && game.decks[user.uid];

  /**
   * Join the game once user is loaded
   */
  useEffect(() => {
    (async () => {
      if (!user) return;
      const success = await joinGame(user, gameId);
      if (!success) setGameIsFull(true);
    })();
  }, [gameId, user]);

  if (loading)
    return (
      <Page>
        <span className="loading loading-dots loading-lg"></span>
      </Page>
    );
  if (error || !game)
    return (
      <Page>
        <Heading>Error</Heading>
        <p>Unable to load game</p>
      </Page>
    );
  if (gameIsFull)
    return (
      <Page>
        <Heading>Game is full</Heading>
        <Link to="/">Go Back Home</Link>
      </Page>
    );
  return (
    <Page>
      <div className="flex gap-8 flex-1 w-full">
        <GameDetails />
        <div className="flex flex-1 flex-col gap-8">
          {allReady ? (
            <>
              <GameScreen />
              <Hand />
            </>
          ) : (
            <div className="flex flex-col gap-8 flex-1 items-center justify-center">
              {!deckLoaded && <DeckPicker />}
            </div>
          )}
        </div>
      </div>
    </Page>
  );
};

export default GameRoute;
