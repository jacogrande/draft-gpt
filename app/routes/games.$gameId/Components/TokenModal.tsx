import { api } from "@convex/_generated/api";
import { useMutation } from "convex/react";
import { useState } from "react";
import { useGameId } from "~/hooks/game/useGame";
import { useGlobalStore } from "~/hooks/useGlobalStore";

type TokenModalProps = {
  showTokenModal: boolean;
  setShowTokenModal: (showTokenModal: boolean) => void;
};

type TokenFormData = { name: string; power: string; toughness: string };

const EMPTY_FORM: TokenFormData = { name: "", power: "", toughness: "" };

const stat = (typed: string) => (typed === "" ? null : Number(typed));

const TokenModal = ({ showTokenModal, setShowTokenModal }: TokenModalProps) => {
  const [formData, setFormData] = useState<TokenFormData>(EMPTY_FORM);
  const setPauseCommands = useGlobalStore((state) => state.setPauseCommands);
  const gameId = useGameId();
  const createToken = useMutation(api.game.tokens.create);

  const submitTokenForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await createToken({
      gameId,
      name: formData.name,
      power: stat(formData.power),
      toughness: stat(formData.toughness),
    });
    setFormData(EMPTY_FORM);
    closeModal();
  };

  const closeModal = () => {
    setShowTokenModal(false);
  };

  const handleFormFocus = () => {
    setPauseCommands(true);
  };

  const handleFormBlur = () => {
    setPauseCommands(false);
  };

  const handleChange =
    (value: keyof TokenFormData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({
        ...prev,
        [value]: e.target.value,
      }));
    };

  const disabled = formData.name.trim().length === 0;

  return (
    <>
      <input
        type="checkbox"
        id="token-modal"
        className="modal-toggle"
        checked={showTokenModal}
        onChange={() => setShowTokenModal(!showTokenModal)}
      />
      <div role="dialog" className={`modal`}>
        <form
          className="modal-box flex flex-col gap-4"
          onSubmit={submitTokenForm}
          onFocus={handleFormFocus}
          onBlur={handleFormBlur}
        >
          <h3 className="font-bold text-lg">Create Token</h3>
          <input
            className="input input-bordered"
            type="text"
            placeholder="Token Name"
            value={formData.name}
            onChange={handleChange("name")}
          />
          <div className="flex gap-4 w-full">
            <input
              className="input input-bordered flex-1"
              type="number"
              placeholder="Power?"
              value={formData.power}
              onChange={handleChange("power")}
            />
            <input
              className="input input-bordered flex-1"
              type="number"
              placeholder="Toughness?"
              value={formData.toughness}
              onChange={handleChange("toughness")}
            />
          </div>
          <div className="self-end">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={disabled}
            >
              Create
            </button>
          </div>
        </form>
        <label className="modal-backdrop" htmlFor="token-modal">
          Close
        </label>
      </div>
    </>
  );
};

export default TokenModal;
