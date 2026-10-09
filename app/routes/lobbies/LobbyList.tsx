import { api } from "@convex/_generated/api";
import { useQuery } from "convex/react";
import useLobbyCreator from "~/hooks/lobby/useLobbyCreator";
import LobbyLink from "~/routes/lobbies/LobbyLink";

const LobbyList = () => {
  const lobbies = useQuery(api.lobby.lobbies.listOpen);
  const { creatingLobby, handleLobbyCreation } = useLobbyCreator();

  if (!lobbies) return <span className="loading loading-dots loading-lg"></span>;
  const sorted = [...lobbies].sort((a, b) => a.name.localeCompare(b.name));
  return (
    <div className="flex flex-col gap-2">
      <ul className="flex flex-wrap gap-2">
        {sorted.map((lobby) => (
          <LobbyLink key={lobby.id} lobby={lobby} />
        ))}
        {sorted.length === 0 && (
          <li>
            It looks like there are no active lobbies right now.{" "}
            <button
              className="link link-primary"
              onClick={handleLobbyCreation}
              disabled={creatingLobby}
            >
              {creatingLobby ? (
                <span className="loading loading-dots loading-sm"></span>
              ) : (
                "Create one?"
              )}
            </button>
          </li>
        )}
      </ul>
    </div>
  );
};

export default LobbyList;
