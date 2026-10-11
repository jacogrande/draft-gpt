import { useEffect } from "react";
import { useGlobalStore } from "~/hooks/useGlobalStore";

const useShiftSelector = () => {
  const selectedCards = useGlobalStore((state) => state.selectedCards);
  const shiftKeyPressed = useGlobalStore((state) => state.shiftKeyPressed);
  const setShiftKeyPressed = useGlobalStore(
    (state) => state.setShiftKeyPressed
  );
  const setSelectedCards = useGlobalStore((state) => state.setSelectedCards);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Shift":
          setShiftKeyPressed(true);
          break;
        case "Escape":
          setShiftKeyPressed(false);
          setSelectedCards([]);
          break;
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Shift") setShiftKeyPressed(false);
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
  }, [selectedCards, shiftKeyPressed, setShiftKeyPressed, setSelectedCards]);
};

export default useShiftSelector;
