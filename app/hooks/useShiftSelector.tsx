import { useEffect } from "react";
import { useGlobalStore } from "~/hooks/useGlobalStore";

const useShiftSelector = () => {
  const {
    selectedCards,
    setShiftKeyPressed,
    shiftKeyPressed,
    setSelectedCards,
  } = useGlobalStore();
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Shift") {
        setShiftKeyPressed(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Shift") {
        setShiftKeyPressed(false);
      }
    };
    const handleClick = () => {
      if (selectedCards.length === 0 || shiftKeyPressed) return;
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
  }, [selectedCards, setShiftKeyPressed, shiftKeyPressed, setSelectedCards]);
};

export default useShiftSelector;
