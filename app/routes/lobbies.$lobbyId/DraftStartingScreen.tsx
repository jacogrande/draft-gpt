import Heading from "~/components/Heading";
import { useSettingStore } from "~/hooks/lobby/useSetting";

const DraftStartingScreen = () => {
  const { setting } = useSettingStore();
  const loadingDisplay = (
    <Heading>
      <div className="flex flex items-center gap-4">
        <span className="loading loading-dots loading-lg"></span>
        Draft Starting
      </div>
    </Heading>
  );

  // const settingDisplay;
  return (
    <div className="flex flex-col gap-8 flex-1 items-center justify-center relative">
      {setting ? <Heading>{setting.name}</Heading> : loadingDisplay}
    </div>
  );
};

export default DraftStartingScreen;
