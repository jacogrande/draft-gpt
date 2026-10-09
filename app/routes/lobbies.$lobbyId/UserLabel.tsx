import { api } from "@convex/_generated/api";
import { CheckIcon, StarIcon, XMarkIcon } from "@heroicons/react/16/solid";
import { useMutation } from "convex/react";
import { Absence } from "~/hooks/draft/useAbsences";
import { isHost, LobbyMember, LobbyView } from "~/hooks/lobby/useLobby";
import ReconnectTimer from "~/routes/lobbies.$lobbyId/ReconnectTimer";

type UserLabelProps = {
  lobby: LobbyView;
  member: LobbyMember;
  away: boolean;
  absence: Absence | null;
  packCount: number;
};

const UserLabel = ({
  lobby,
  member,
  away,
  absence,
  packCount,
}: UserLabelProps) => {
  const removeMember = useMutation(api.lobby.lobbies.removeMember);
  const isOpen = lobby.status === "open";
  const isViewer = member.userId === lobby.viewerId;
  const canRemove = isOpen && isHost(lobby) && !isViewer;

  return (
    <li
      className="flex flex-wrap items-center gap-x-2 relative"
      data-away={away}
    >
      <span className={away ? "opacity-50" : ""}>{member.username}</span>
      {member.userId === lobby.hostId && (
        <StarIcon className="h-4 w-4 absolute left-[-1.5rem] text-warning" />
      )}
      {away && !absence && (
        <span className="text-xs italic opacity-50">away</span>
      )}
      {isOpen && member.ready && <CheckIcon className="h-4 w-4 text-success" />}
      {Array.from({ length: packCount }, (_, index) => (
        <span
          className="badge badge-primary badge-outline badge-xs"
          key={index}
        ></span>
      ))}
      {canRemove && (
        <button
          className="btn btn-ghost btn-xs"
          aria-label={`Remove ${member.username}`}
          onClick={() =>
            removeMember({ lobbyId: lobby.id, userId: member.userId })
          }
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      )}
      {absence && (
        <span className="basis-full">
          <ReconnectTimer lobby={lobby} member={member} absence={absence} />
        </span>
      )}
    </li>
  );
};

export default UserLabel;
