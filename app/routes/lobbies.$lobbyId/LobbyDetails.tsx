import { useState } from "react";
import { usePacksHeld } from "~/hooks/draft/usePacks";
import { LobbyView } from "~/hooks/lobby/useLobby";
import { usePresentUserIds } from "~/hooks/lobby/usePresence";
import DeckList from "~/routes/lobbies.$lobbyId/DeckList";
import UserLabel from "~/routes/lobbies.$lobbyId/UserLabel";

const TABS = ["players", "deck"] as const;

const LobbyDetails = ({ lobby }: { lobby: LobbyView }) => {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>("players");
  const packsHeld = usePacksHeld(lobby.id);
  const present = usePresentUserIds(lobby.id);

  return (
    <div className="flex flex-col gap-2 min-w-48">
      <div role="tablist" className="tabs tabs-bordered flex mb-2">
        {TABS.map((tab) => (
          <button
            key={tab}
            role="tab"
            className={`tab font-bold hover:tab-active text-xs uppercase flex-1 ${
              activeTab === tab ? "tab-active" : "opacity-50"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>
      {activeTab === "players" && (
        <ul className="flex flex-col gap-2">
          {lobby.members.map((member) => (
            <UserLabel
              key={member.userId}
              lobby={lobby}
              member={member}
              away={!present.has(member.userId)}
              packCount={packsHeld[member.userId] ?? 0}
            />
          ))}
        </ul>
      )}
      {activeTab === "deck" && <DeckList />}
    </div>
  );
};

export default LobbyDetails;
