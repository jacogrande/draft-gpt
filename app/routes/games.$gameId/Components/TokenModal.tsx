import { useState } from "react";
import { useGameStore } from "~/hooks/game/useGame";
import { useGlobalStore } from "~/hooks/useGlobalStore";
import { useUser } from "~/hooks/useUser";
import { createToken } from "~/model/game/extras";

type TokenModalProps = {
  showTokenModal: boolean;
  setShowTokenModal: (showTokenModal: boolean) => void;
};

type TokenFormData = {
  name: string;
  power: number | null;
  toughness: number | null;
};

const TokenModal = ({ showTokenModal, setShowTokenModal }: TokenModalProps) => {
  const [formData, setFormData] = useState<TokenFormData>({
    name: "",
    power: null,
    toughness: null,
  });
  const setPauseCommands = useGlobalStore((state) => state.setPauseCommands);
  const { user } = useUser();
  const { game } = useGameStore();
  if (!game || !user) return null;

  const submitTokenForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await createToken(
      game.id,
      user.uid,
      formData.name,
      formData.power,
      formData.toughness
    );
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

  const disabled = formData.name.length === 0;

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
              value={formData.power || ""}
              onChange={handleChange("power")}
            />
            <input
              className="input input-bordered flex-1"
              type="number"
              placeholder="Toughness?"
              value={formData.toughness || ""}
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
