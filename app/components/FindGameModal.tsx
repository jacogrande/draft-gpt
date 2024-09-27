import { MagnifyingGlassCircleIcon } from "@heroicons/react/16/solid";
import { useState } from "react";

type FindGameModalProps = {
  modalRef: React.RefObject<HTMLDialogElement>;
};

const FindGameModal = ({ modalRef }: FindGameModalProps) => {
  const [gameCode, setGameCode] = useState<string>("");

  const findGame = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("find game");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.currentTarget.value;
    setGameCode((prev) => (val.length > 4 ? prev : val.toUpperCase()));
  };

  const disabled = gameCode.length < 4;
  return (
    <dialog ref={modalRef} className="modal">
      <div className="modal-box">
        <form method="dialog">
          {/* if there is a button in form, it will close the modal */}
          <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
            ✕
          </button>
        </form>
        <h3 className="font-bold text-lg">Find a Game</h3>
        <div className="modal-action">
          <form className="flex flex-col gap-4 flex-1" onSubmit={findGame}>
            <label
              className="input input-bordered flex items-center gap-2"
              aria-label="Game Code"
            >
              <MagnifyingGlassCircleIcon className="h-5 w-5" />
              <input
                type="text"
                className="grow"
                placeholder="Game Code"
                value={gameCode}
                onChange={handleChange}
              />
            </label>
            <div className="flex flex gap-2 justify-end">
              <button
                className="btn btn-primary"
                type="submit"
                disabled={disabled}
              >
                Join Game
              </button>
            </div>
          </form>
        </div>
      </div>
    </dialog>
  );
};

export default FindGameModal;
