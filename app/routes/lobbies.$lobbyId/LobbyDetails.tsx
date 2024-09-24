import { useMemo, useState } from "react";
import { useLobbyStore } from "~/hooks/lobby/useLobby";
import { usePacksStore } from "~/hooks/lobby/usePacks";
import DeckList from "~/routes/lobbies.$lobbyId/DeckList";
import UserLabel from "~/routes/lobbies.$lobbyId/UserLabel";

type Tab = "players" | "deck";
const LobbyDetails = () => {
  const [activeTab, setActiveTab] = useState<Tab>("players");
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

  const renderPlayerList = () => {
    if (!lobby) return null;
    return (
      <ul className="flex flex-col gap-2">
        {lobby.activeUsers.map((user) => (
          <UserLabel user={user} key={user.uid} packCount={packMap[user.uid]} />
        ))}
      </ul>
    );
  };

  if (!lobby) return null;
  return (
    <div className="flex flex-col gap-2 min-w-48">
      <div role="tablist" className="tabs tabs-bordered flex mb-2">
        <button
          role="tab"
          className={`tab font-bold hover:tab-active text-xs uppercase flex-1 ${
            activeTab === "players" ? "tab-active" : "opacity-50"
          }`}
          onClick={() => setActiveTab("players")}
        >
          Players
        </button>
        <button
          role="tab"
          className={`tab font-bold hover:tab-active text-xs uppercase flex-1 ${
            activeTab === "deck" ? "tab-active" : "opacity-50"
          }`}
          onClick={() => setActiveTab("deck")}
        >
          Deck
        </button>
      </div>
      {activeTab === "players" && renderPlayerList()}
      {activeTab === "deck" && <DeckList />}
    </div>
  );
};

export default LobbyDetails;
