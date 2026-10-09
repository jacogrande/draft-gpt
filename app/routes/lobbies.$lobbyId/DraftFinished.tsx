import { api } from "@convex/_generated/api";
import { Link } from "@remix-run/react";
import { useQuery } from "convex/react";
import Heading from "~/components/Heading";
import { LobbyView } from "~/hooks/lobby/useLobby";

const DraftFinished = ({ lobby }: { lobby: LobbyView }) => {
  const deck = useQuery(api.deck.decks.forLobby, { lobbyId: lobby.id });
  return (
    <div className="flex flex-col flex-1 items-center justify-center gap-4">
      <Heading>Draft Finished</Heading>
      {deck && (
        <p className="prose">
          Head over to the{" "}
          <Link to={`/decks/${deck.id}`} className="link link-primary">
            deck editor
          </Link>{" "}
          to finish building your deck.
        </p>
      )}
    </div>
  );
};

export default DraftFinished;
