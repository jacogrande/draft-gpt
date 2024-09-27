import {
  MagnifyingGlassCircleIcon,
  PlusCircleIcon,
  Square3Stack3DIcon,
} from "@heroicons/react/16/solid";
import { Link } from "@remix-run/react";
import { useRef } from "react";
import FindGameModal from "~/components/FindGameModal";
import Subheading from "~/components/Subheading";
import useLobbyCreator from "~/hooks/lobby/useLobbyCreator";
import { useUser } from "~/hooks/useUser";

const Nav = () => {
  const { user, loading } = useUser();
  const { creatingLobby, handleLobbyCreation } = useLobbyCreator();
  const modalRef = useRef<HTMLDialogElement>(null);

  const handleOpenModal = () => {
    modalRef.current?.showModal();
  };

  if (loading)
    return <span className="loading loading-dots loading-lg h-[48px]"></span>;
  if (!user)
    return (
      <nav className="flex items-center justify-center gap-4 rounded-3xl min-w-48">
        {" "}
        <Link to="/join" className="btn btn-primary">
          Join
        </Link>
      </nav>
    );
  return (
    <nav className="flex justify-center rounded-3xl">
      <div className="flex flex-1 flex-col items-center gap-2 flex-1 dark:border-gray-200 pr-8 border-r-2 border-gray-200 min-w-48">
        <Subheading>Draft</Subheading>
        <button
          className="btn btn-primary w-full flex mt-4"
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
      </div>
      <div className="flex items-center flex-col min-w-48 pl-8 dark:border-gray-200 pr-8 border-r-2 border-gray-200 gap-2">
        <Subheading>Build</Subheading>
        <Link to="/decks" className="btn btn-primary w-full mt-4">
          <Square3Stack3DIcon className="h-5 w-5" />
          Decks
        </Link>
      </div>
      <div className="flex flex-col min-w-48 pl-8 items-center gap-2">
        <Subheading>Play</Subheading>
        <button className="btn btn-primary w-full flex mt-4">
          <PlusCircleIcon className="h-5 w-5" />
          <span className="flex-1">Create a Game</span>
        </button>
        <button
          className="btn btn-primary w-full flex"
          onClick={handleOpenModal}
        >
          <MagnifyingGlassCircleIcon className="h-5 w-5" />
          <span className="flex-1">Find a Game</span>
        </button>
        <FindGameModal modalRef={modalRef} />
      </div>
    </nav>
  );
};

export default Nav;
