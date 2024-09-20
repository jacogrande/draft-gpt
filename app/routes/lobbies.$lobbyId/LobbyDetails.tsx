import UserLabel from "~/routes/lobbies.$lobbyId/UserLabel";
import { Lobby } from "~/util/types";

type LobbyDetailsProps = {
  lobby: Lobby | null;
};

const LobbyDetails = ({ lobby }: LobbyDetailsProps) => {
  if (!lobby) return null;
  return (
    <div className="flex flex-col gap-2">
      <p className="font-bold text-xs uppercase">Players</p>
      <ul className="flex flex-col gap-2">
        {lobby.activeUsers.map((user) => (
          <UserLabel user={user} key={user.uid} />
        ))}
      </ul>
    </div>
  );
};

export default LobbyDetails;
