import { Link, useParams } from "@remix-run/react";
import { verifySession } from "~/.server/session";
import Heading from "~/components/Heading";
import Page from "~/components/Page";
import useDeck from "~/hooks/useDeck";
import Mainboard from "~/routes/decks.$deckId/Mainboard";
import Sideboard from "~/routes/decks.$deckId/Sideboard";

export const loader = verifySession;

const Deck = () => {
  const deckId = useParams().deckId as string;
  const { deck } = useDeck(deckId);
  if (!deck) return null;
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

export default Deck;
