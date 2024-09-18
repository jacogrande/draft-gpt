import {
  MagnifyingGlassCircleIcon,
  PlusCircleIcon,
} from "@heroicons/react/16/solid";
import { Link } from "@remix-run/react";
import useLobbyCreator from "~/hooks/lobby/useLobbyCreator";
import { useUser } from "~/hooks/useUser";

const Nav = () => {
  const { user, loading } = useUser();
  const { creatingLobby, handleLobbyCreation } = useLobbyCreator();

  if (loading)
    return <span className="loading loading-dots loading-lg h-[48px]"></span>;
  return (
    <nav className="flex flex-col items-center justify-center gap-4 rounded-3xl min-w-48">
      {user ? (
        <>
          <button
            className="btn btn-primary w-full flex"
            onClick={handleLobbyCreation}
            disabled={creatingLobby}
          >
            <PlusCircleIcon className="h-5 w-5" />
            <span className="flex-1">
              {creatingLobby ? (
                <span className="loading loading-dots loading-sm"></span>
              ) : (
                "Create a Lobby"
              )}
            </span>
          </button>
          <Link to="/lobbies" className="btn btn-primary w-full flex">
            <MagnifyingGlassCircleIcon className="h-5 w-5" />
            <span className="flex-1">Find a Lobby</span>
          </Link>
        </>
      ) : (
        <Link to="/join" className="btn btn-primary">
          Join
        </Link>
      )}
    </nav>
  );
};

export default Nav;
