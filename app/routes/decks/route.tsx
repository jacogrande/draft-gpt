import { api } from "@convex/_generated/api";
import { PencilSquareIcon } from "@heroicons/react/16/solid";
import { Link, Outlet, useParams } from "@remix-run/react";
import { useQuery } from "convex/react";
import Heading from "~/components/Heading";
import Page from "~/components/Page";
import { requireAuth } from "~/components/RequireAuth";
import { Deck } from "~/util/types";

const Decks = () => {
  const params = useParams();
  const deckId = params.deckId;
  const decks = useQuery(api.deck.decks.list);

  if (deckId) return <Outlet />;
  if (!decks) return null;
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
              <th>Creation</th>
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
      <td>{new Date(deck.createdAt).toLocaleString()}</td>
      <td>
        <div className="tooltip" data-tip="Edit">
          <Link to={`/decks/${deck.id}`} className="link link-primary">
            <PencilSquareIcon className="h-5 w-5" />
          </Link>
        </div>
      </td>
    </tr>
  );
};

export default requireAuth(Decks);
