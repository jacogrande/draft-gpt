import CreativeGuidance from "./CreativeGuidance";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { useSetting } from "~/hooks/draft/usePacks";
import { useLobbyId } from "~/hooks/lobby/useLobby";

const SettingInfo = () => {
  const lobbyId = useLobbyId();
  const setting = useSetting(lobbyId);
  if (!setting) return null;
  return (
    <div className="flex items-center">
      <p className="font-bold text-xs uppercase">{setting.name}</p>
      <details className="dropdown dropdown-bottom dropdown-end">
        <summary
          aria-label="Setting and archetypes"
          className="btn btn-ghost btn-sm px-2 list-none"
        >
          <InformationCircleIcon className="h-4 w-4" />
        </summary>
        <div className="dropdown-content p-4 shadow bg-base-100 rounded-box w-96 max-w-[90vw] max-h-[70vh] overflow-y-auto z-30 prose">
          <h3>{setting.name}</h3>
          <CreativeGuidance lobbyId={lobbyId} />
          <p className="text-sm">{setting.description}</p>
          {(
            setting.mechanics ??
            (setting.newMechanic.name ? [setting.newMechanic] : [])
          ).map((mechanic) => (
            <p className="text-sm" key={mechanic.name}>
              <strong>{mechanic.name}: </strong>
              {mechanic.rules_text}
            </p>
          ))}
          {(setting.archetypes ?? []).map((archetype) => (
            <p className="text-sm" key={archetype.name}>
              <strong>{archetype.name}: </strong>
              {archetype.description}
            </p>
          ))}
        </div>
      </details>
    </div>
  );
};
export default SettingInfo;
