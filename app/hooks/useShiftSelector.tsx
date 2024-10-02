import { useCallback, useEffect } from "react";
import { useGlobalStore } from "~/hooks/useGlobalStore";

const useShiftSelector = () => {
  const {
    selectedCards,
    setShiftKeyPressed,
    shiftKeyPressed,
    setSelectedCards,
  } = useGlobalStore();

  const handleKeyDown = useCallback(
    async (e: KeyboardEvent) => {
      switch (e.key) {
        case "Shift":
          setShiftKeyPressed(true);
          break;
        case "Escape":
          setShiftKeyPressed(false);
          setSelectedCards([]);
          break;
      }
    },
    [setShiftKeyPressed, setSelectedCards]
  );

  useEffect(() => {
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Shift") {
        setShiftKeyPressed(false);
      }
    };
    const handleClick = (e: MouseEvent) => {
      if (selectedCards.length === 0 || shiftKeyPressed) return;
      console.log(e);
      console.log("resetting selection");
      setShiftKeyPressed(false);
      setSelectedCards([]);
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("click", handleClick);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("click", handleClick);
    };
  }, [
    selectedCards,
    setShiftKeyPressed,
    shiftKeyPressed,
    setSelectedCards,
    handleKeyDown,
  ]);
};

export default useShiftSelector;
