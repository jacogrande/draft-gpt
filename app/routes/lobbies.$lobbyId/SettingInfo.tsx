import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { useSettingStore } from "~/hooks/lobby/useSetting";

const SettingInfo = () => {
  const { setting } = useSettingStore();

  if (!setting) return null;
  return (
    <div className="flex items-center gap-2">
      <p className="font-bold text-xs uppercase">{setting.name}</p>
      <InformationCircleIcon className="h-4 w-4 font-bold" />
    </div>
  );
};

export default SettingInfo;
