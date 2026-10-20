import { api } from "@convex/_generated/api";
import { POWER_LEVELS, PowerLevel } from "@convex/powerLevel";
import { useMutation } from "convex/react";
import { useState } from "react";
import { LobbyView } from "~/hooks/lobby/useLobby";
import { useToast } from "~/hooks/useToast";

const PowerLevelChoice = ({ lobby }: { lobby: LobbyView }) => {
  const update = useMutation(api.lobby.lobbies.setPowerLevel);
  const { toast } = useToast();
  const [pending, setPending] = useState(false);
  const host = lobby.viewerId === lobby.hostId;
  const choose = async (powerLevel: PowerLevel) => {
    setPending(true);
    try {
      await update({ lobbyId: lobby.id, powerLevel });
    } catch {
      toast("Unable to change the power level. The host can change it before the draft starts.", "error");
    } finally {
      setPending(false);
    }
  };
  return (
    <fieldset className="w-full max-w-xl px-4" disabled={!host || pending}>
      <legend className="font-semibold mb-2">Power level</legend>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {(Object.entries(POWER_LEVELS) as [PowerLevel, { label: string; description: string }][])
          .map(([value, option]) => (
            <label key={value} className={`flex gap-3 rounded-lg border p-3 ${lobby.powerLevel === value ? "border-primary bg-base-200" : "border-base-300"} ${host ? "cursor-pointer" : ""}`}>
              <input
                className="radio radio-primary radio-sm mt-1"
                type="radio"
                name="power-level"
                value={value}
                aria-label={option.label}
                checked={lobby.powerLevel === value}
                onChange={() => void choose(value)}
              />
              <span>
                <span className="font-semibold">{option.label}</span>
                <span className="block text-sm opacity-70">{option.description}</span>
              </span>
            </label>
          ))}
      </div>
      <p className="text-xs opacity-70 mt-2">
        {host ? "Changing power clears everyone’s ready status." : "The host chooses the power level."}
      </p>
    </fieldset>
  );
};

export default PowerLevelChoice;
