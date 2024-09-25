import { PencilSquareIcon } from "@heroicons/react/16/solid";
import {
  json,
  Link,
  redirect,
  useLoaderData,
  useParams,
} from "@remix-run/react";
import { verifySession } from "~/.server/session";
import Heading from "~/components/Heading";
import Page from "~/components/Page";
import { getAllDecks } from "~/model/decks";
import { Deck } from "~/util/types";

export const loader = async ({ request }: { request: Request }) => {
  const session = await verifySession({ request });
  if (!session) return redirect("/join");
  const decks = await getAllDecks((session as { user: string }).user);
  return json({ decks });
};

const Decks = () => {
  const params = useParams();
  const deckId = params.deckId;
  const data = useLoaderData<typeof loader>();
  const decks = (data.decks as Deck[]) || [];

  if (!decks.length)
    return (
      <Page>
        <header className="flex flex-col items-center gap-9">
          <Heading>No Decks Found</Heading>
          <p>
            <Link to="/lobbies" className="link link-primary">
              Join a lobby
            </Link>{" "}
            to create a deck.
          </p>
        </header>
      </Page>
    );
  return (
    <Page>
      <header className="flex flex-col items-center gap-9">
        <Heading>Your Decks</Heading>
      </header>
      <div className="overflow-x-auto">
        <table className="table">
          {/* head */}
          <thead>
            <tr>
              <th>Name</th>
              <th>Mainboard</th>
              <th>Sideboard</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {decks.map((deck) => (
              <DeckRow key={deck.id} deck={deck} />
            ))}
          </tbody>
        </table>
      </div>
    </Page>
  );
};

const DeckRow = ({ deck }: { deck: Deck }) => {
  return (
    <tr className="text-sm">
      <th>{deck.name}</th>
      <td>{deck.cards.length}</td>
      <td>{deck.sideboard?.length || 0}</td>
      <td>
        <Link to={`/decks/${deck.id}`} className="link link-primary">
          <PencilSquareIcon className="h-5 w-5" />
        </Link>
      </td>
    </tr>
  );
};

export default Decks;
