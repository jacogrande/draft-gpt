import { GlobeAmericasIcon } from "@heroicons/react/16/solid";
import UserLabel from "~/routes/lobbies.$lobbyId/UserLabel";
import { Lobby } from "~/util/types";

type LobbyDetailsProps = {
  lobby: Lobby | null;
};

const LobbyDetails = ({ lobby }: LobbyDetailsProps) => {
  if (!lobby) return null;
  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-2xl font-bold text-primary mb-8 flex items-center gap-2">
        {lobby.name}
        <GlobeAmericasIcon className="h-5 w-5" />
      </h1>
      <p className="font-bold text-xs uppercase">Players</p>
      <ul className="flex flex-wrap gap-2">
        {lobby.activeUsers.map((user) => (
          <UserLabel user={user} key={user.uid} />
        ))}
      </ul>
    </div>
  );
};

export default LobbyDetails;
