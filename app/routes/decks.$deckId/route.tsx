import { useParams } from "@remix-run/react";
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
      <header>
        <Heading>Edit Deck</Heading>
      </header>
      <div className="flex w-full gap-8 justify-between flex-1 h-full relative">
        <Sideboard />
        <Mainboard />
      </div>
    </Page>
  );
};

export default Deck;
