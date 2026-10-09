import { api } from "@convex/_generated/api";
import { CheckIcon, StarIcon, XMarkIcon } from "@heroicons/react/16/solid";
import { useMutation } from "convex/react";
import { isHost, LobbyMember, LobbyView } from "~/hooks/lobby/useLobby";

type UserLabelProps = {
  lobby: LobbyView;
  member: LobbyMember;
  away: boolean;
  packCount: number;
};

const UserLabel = ({ lobby, member, away, packCount }: UserLabelProps) => {
  const removeMember = useMutation(api.lobby.lobbies.removeMember);
  const isOpen = lobby.status === "open";
  const isViewer = member.userId === lobby.viewerId;
  const canRemove = isOpen && isHost(lobby) && !isViewer;

  return (
    <li
      className={`flex items-center gap-2 relative ${away ? "opacity-50" : ""}`}
      data-away={away}
    >
      {member.username}
      {member.userId === lobby.hostId && (
        <StarIcon className="h-4 w-4 absolute left-[-1.5rem] text-warning" />
      )}
      {away && <span className="text-xs italic">away</span>}
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
    </li>
  );
};

export default UserLabel;
