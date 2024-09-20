import { useMemo, useState } from "react";
import { useLobbyStore } from "~/hooks/lobby/useLobby";
import { usePacksStore } from "~/hooks/lobby/usePacks";
import UserLabel from "~/routes/lobbies.$lobbyId/UserLabel";

const LobbyDetails = () => {
  const { lobby } = useLobbyStore();
  const { packs } = usePacksStore();
  // create a map of player ids to pack counts
  const [packMap, setPackMap] = useState<Record<string, number>>({});
  useMemo(() => {
    if (!lobby || !packs) return;
    const packMap: Record<string, number> = {};
    packs.forEach((pack) => {
      packMap[pack.currentHolder] = packMap[pack.currentHolder]
        ? packMap[pack.currentHolder] + 1
        : 1;
      setPackMap(packMap);
    });
  }, [lobby, packs]);

  if (!lobby) return null;
  return (
    <div className="flex flex-col gap-2">
      <p className="font-bold text-xs uppercase">Players</p>
      <ul className="flex flex-col gap-2">
        {lobby.activeUsers.map((user) => (
          <UserLabel user={user} key={user.uid} packCount={packMap[user.uid]} />
        ))}
      </ul>
    </div>
  );
};

export default LobbyDetails;
