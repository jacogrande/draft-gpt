import useLobbyCreator from "~/hooks/lobby/useLobbyCreator";
import useLobbyList from "~/hooks/lobby/useLobbyList";
import LobbyLink from "~/routes/lobbies/LobbyLink";

const LobbyList = () => {
  const { lobbies, loading } = useLobbyList();
  const { creatingLobby, handleLobbyCreation } = useLobbyCreator();

  if (loading) return <span className="loading loading-dots loading-lg"></span>;
  return (
    <div className="flex flex-col gap-2">
      <ul className="flex flex-wrap gap-2">
        {lobbies.map((lobby) => (
          <LobbyLink key={lobby.id} lobby={lobby} />
        ))}
        {lobbies.length === 0 && (
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
