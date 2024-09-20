import { useEffect, useState } from "react";
import Heading from "~/components/Heading";
import { useSettingStore } from "~/hooks/lobby/useSetting";

const DraftStartingScreen = () => {
  const { setting } = useSettingStore();
  const [fieldsToShow, setFieldsToShow] = useState<{ [key: string]: boolean }>(
    {}
  );
  const loadingDisplay = (
    <Heading>
      <div className="flex flex items-center gap-4">
        <span className="loading loading-dots loading-lg"></span>
        Draft Starting
      </div>
    </Heading>
  );

  useEffect(() => {
    if (!setting) return;
    setFieldsToShow({
      name: true,
    });
    const THESIS_TIMEOUT = 1000;
    const MECHANIC_TIMEOUT = 3000;
    setTimeout(() => {
      setFieldsToShow((prev) => ({
        ...prev,
        thesis: true,
      }));
    }, THESIS_TIMEOUT);
    setTimeout(() => {
      setFieldsToShow((prev) => ({
        ...prev,
        mechanics: true,
      }));
    }, MECHANIC_TIMEOUT);
  }, [setting]);

  if (!setting)
    return (
      <div className="flex flex-col gap-8 flex-1 items-center justify-center">
        {loadingDisplay}
      </div>
    );
  return (
    <div className="flex flex-col gap-4 flex-1 justify-center items-center">
      {fieldsToShow.name && (
        <span className="animate-in fade-in zoom-in-90 duration-1000">
          <Heading>{setting.name}</Heading>{" "}
        </span>
      )}
      {fieldsToShow.thesis && (
        <p className="animate-in fade-in zoom-in-90 duration-1000 max-w-[600px]">
          {setting.thesis}
        </p>
      )}
      {fieldsToShow.mechanics && (
        <p className="animate-in fade-in zoom-in-90 duration-1000 max-w-[600px]">
          <strong>{setting.newMechanic.name}</strong>
          {": "}
          {setting.newMechanic.rules_text}
        </p>
      )}
    </div>
  );
};

export default DraftStartingScreen;
