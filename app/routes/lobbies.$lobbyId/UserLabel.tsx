import { CheckIcon, StarIcon } from "@heroicons/react/16/solid";
import { useLobbyStore } from "~/hooks/lobby/useLobby";
import { PublicUser } from "~/util/types";

type UserLabelProps = {
  user: PublicUser;
};

const UserLabel = ({ user }: UserLabelProps) => {
  const { lobby } = useLobbyStore();
  if (!lobby) return null;
  const isOwner = user.uid === lobby.createdBy;
  const isReady = lobby.readyMap && lobby.readyMap[user.uid];
  return (
    <li className="flex items-center gap-2 relative">
      {user.username}
      {isOwner && (
        <StarIcon className="h-4 w-4 absolute left-[-1.5rem] text-warning" />
      )}
      {isReady && <CheckIcon className="h-4 w-4 text-success" />}
    </li>
  );
};

export default UserLabel;
