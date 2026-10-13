import { api } from "@convex/_generated/api";
import { useMutation } from "convex/react";
import { Position } from "@convex/game/placement";
import { useToast } from "~/hooks/useToast";
import { useEffect, useState } from "react";
import { useGameId } from "~/hooks/game/useGame";
import { useGlobalStore } from "~/hooks/useGlobalStore";

type TokenModalProps = {
  position: Position;
  showTokenModal: boolean;
  setShowTokenModal: (showTokenModal: boolean) => void;
};

type TokenFormData = { name: string; power: string; toughness: string };

const EMPTY_FORM: TokenFormData = { name: "", power: "", toughness: "" };

const stat = (typed: string) => (typed === "" ? null : Number(typed));

const TokenModal = ({
  position,
  showTokenModal,
  setShowTokenModal,
}: TokenModalProps) => {
  const [formData, setFormData] = useState<TokenFormData>(EMPTY_FORM);
  const setPauseCommands = useGlobalStore((state) => state.setPauseCommands);
  const gameId = useGameId();
  const toast = useToast((state) => state.toast);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (!showTokenModal) return;
    setPauseCommands(true);
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setShowTokenModal(false);
    };
    document.addEventListener("keydown", escape);
    return () => {
      setPauseCommands(false);
      document.removeEventListener("keydown", escape);
    };
  }, [showTokenModal, setPauseCommands, setShowTokenModal]);
  const createToken = useMutation(api.game.tokens.create);

  const submitTokenForm = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createToken({
        position,
        gameId,
        name: formData.name,
        power: stat(formData.power),
        toughness: stat(formData.toughness),
      });
      setFormData(EMPTY_FORM);
      closeModal();
    } catch {
      toast("Could not create token", "error");
    } finally {
      setSaving(false);
    }
  };

  const closeModal = () => {
    setShowTokenModal(false);
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
        >
          <h3 className="font-bold text-lg">Create Token</h3>
          <input
            className="input input-bordered"
            type="text"
            placeholder="Token Name"
            maxLength={40}
            value={formData.name}
            onChange={handleChange("name")}
          />
          <div className="flex gap-4 w-full">
            <input
              className="input input-bordered flex-1 min-w-0"
              type="number"
              placeholder="Power?"
              value={formData.power}
              onChange={handleChange("power")}
            />
            <input
              className="input input-bordered flex-1 min-w-0"
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
              disabled={disabled || saving}
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
