import { Link, useParams, useRouteError } from "@remix-run/react";
import Heading from "~/components/Heading";
import Page from "~/components/Page";
import { requireAuth } from "~/components/RequireAuth";
import useDeck from "~/hooks/useDeck";
import DeckNotice from "~/routes/decks.$deckId/DeckNotice";
import Mainboard from "~/routes/decks.$deckId/Mainboard";
import Sideboard from "~/routes/decks.$deckId/Sideboard";

const Deck = () => {
  const deckId = useParams().deckId as string;
  const { deck } = useDeck(deckId);
  if (deck === undefined)
    return (
      <Page>
        <span className="loading loading-dots loading-lg"></span>
      </Page>
    );
  if (deck === null) return <DeckNotice>Deck not found.</DeckNotice>;
  return (
    <Page>
      <header className="w-full flex items-center justify-start">
        <Link
          to="/"
          className="text-xl font-bold text-primary flex items-center gap-2 flex-1"
        >
          draftGPT
        </Link>
        <Heading className="flex-1 text-center">Edit Deck</Heading>
        <div className="flex-1"></div>
      </header>
      <div className="flex w-full gap-8 justify-between flex-1 h-full relative">
        <Sideboard />
        <Mainboard />
      </div>
    </Page>
  );
};

export const ErrorBoundary = () => {
  console.error(useRouteError());
  return <DeckNotice>Deck not found.</DeckNotice>;
};

export default requireAuth(Deck);
