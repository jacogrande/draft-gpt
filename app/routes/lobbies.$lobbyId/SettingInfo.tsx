import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { useSettingStore } from "~/hooks/lobby/useSetting";

const SettingInfo = () => {
  const { setting } = useSettingStore();

  if (!setting) return null;
  return (
    <div className="flex items-center">
      <p className="font-bold text-xs uppercase">{setting.name}</p>
      <div className="dropdown dropdown-hover dropdown-bottom dropdown-end">
        <div tabIndex={0} role="button" className="px-2">
          <InformationCircleIcon className="h-4 w-4 font-bold" />
          <div className="dropdown-content p-4 shadow bg-base-100 rounded-box w-96 z-10 prose">
            <p className="text-sm">
              <strong>Setting: </strong>
              {setting.description}
            </p>
            <p className="text-sm">
              <strong>{setting.newMechanic.name}: </strong>
              {setting.newMechanic.rules_text}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingInfo;
