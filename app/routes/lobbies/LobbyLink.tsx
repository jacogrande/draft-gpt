import { UserCircleIcon } from "@heroicons/react/16/solid";
import { Link } from "@remix-run/react";

type LobbyLinkProps = {
  lobby: { id: string; name: string; memberCount: number };
};

const LobbyLink = ({ lobby }: LobbyLinkProps) => {
  return (
    <li>
      <Link to={`/lobbies/${lobby.id}`}>
        <button
          className="badge badge-outline badge-primary px-4 py-4 badge-md hover:bg-primary hover:text-primary-content flex items-center disabled:bg-gray-400 disabled:text-gray-100 disabled:opacity-50"
          disabled={lobby.memberCount >= 8}
        >
          {lobby.name}
          <UserCircleIcon className="h-3 w-3 ml-4 mr-2" />
          <span className="text-xs">{lobby.memberCount} / 8</span>
        </button>
      </Link>
    </li>
  );
};

export default LobbyLink;
