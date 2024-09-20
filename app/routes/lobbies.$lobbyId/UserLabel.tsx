import { CheckIcon, StarIcon } from "@heroicons/react/16/solid";
import { useLobbyStore } from "~/hooks/lobby/useLobby";
import { PublicUser } from "~/util/types";

type UserLabelProps = {
  user: PublicUser;
  packCount?: number;
};

const UserLabel = ({ user, packCount }: UserLabelProps) => {
  const { lobby } = useLobbyStore();
  if (!lobby) return null;
  const isOwner = user.uid === lobby.createdBy;
  const isReady =
    !lobby.draftStarted && lobby.readyMap && lobby.readyMap[user.uid];

  const getPackDisplay = () => {
    if (!packCount) return null;
    const packArray = new Array(packCount).fill(null);
    return packArray.map(() => (
      <span
        className="badge badge-primary badge-outline badge-xs"
        key={Math.random()}
      ></span>
    ));
  };
  return (
    <li className="flex items-center gap-2 relative">
      {user.username}
      {isOwner && (
        <StarIcon className="h-4 w-4 absolute left-[-1.5rem] text-warning" />
      )}
      {isReady && <CheckIcon className="h-4 w-4 text-success" />}
      {getPackDisplay()}
    </li>
  );
};

export default UserLabel;
