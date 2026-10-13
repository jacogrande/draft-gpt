import { Link, useParams, useRouteError } from "@remix-run/react";
import { useEffect } from "react";
import { useGlobalStore } from "~/hooks/useGlobalStore";
import Page from "~/components/Page";
import { requireAuth } from "~/components/RequireAuth";
import useDeck from "~/hooks/useDeck";
import DeckNotice from "~/routes/decks.$deckId/DeckNotice";
import Mainboard from "~/routes/decks.$deckId/Mainboard";
import Sideboard from "~/routes/decks.$deckId/Sideboard";

const Deck = () => {
  const deckId = useParams().deckId as string;
  const { deck } = useDeck(deckId);
  useEffect(() => {
    const reset = () =>
      useGlobalStore.setState({ selectedCards: [], peekedCard: null });
    reset();
    return reset;
  }, [deckId]);
  if (deck === undefined)
    return (
      <Page>
        <span className="loading loading-dots loading-lg"></span>
      </Page>
    );
  if (deck === null) return <DeckNotice>Deck not found.</DeckNotice>;
  return (
    <div className="h-screen overflow-hidden p-4 flex flex-col gap-4">
      <header className="flex items-center justify-between gap-4">
        <Link to="/decks" className="link link-primary text-sm">
          ← Your decks
        </Link>
        <h1 className="text-xl font-bold truncate">{deck.name}</h1>
        <Link to="/" className="link link-primary text-sm">
          Home
        </Link>
      </header>
      <div className="flex gap-5 flex-1 min-h-0 min-w-0">
        <Sideboard />
        <Mainboard />
      </div>
    </div>
  );
};

export const ErrorBoundary = () => {
  console.error(useRouteError());
  return <DeckNotice>Deck not found.</DeckNotice>;
};

export default requireAuth(Deck);
