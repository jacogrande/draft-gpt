import { useCallback, useEffect, useState } from "react";
import { useGame, viewerSeat } from "~/hooks/game/useGame";
import { useGameActions } from "~/hooks/game/useGameActions";
import { useGlobalStore } from "~/hooks/useGlobalStore";
import { attemptToAddMana } from "~/util/attemptToAddMana";

const useGameCommands = () => {
  const [toastMessage, setToastMessage] = useState<string>("");
  const [drawing, setDrawing] = useState<boolean>(false);
  const [adding, setAdding] = useState<boolean>(false);
  const [addAmount, setAddAmount] = useState<string>("");
  const game = useGame();
  const side = game?.status === "playing" ? viewerSeat(game)?.side : null;
  const { moveCards, tapCards, untapAll, draw, shuffle } = useGameActions();
  const selectedCards = useGlobalStore((state) => state.selectedCards);
  const setSelectedCards = useGlobalStore((state) => state.setSelectedCards);
  const pauseCommands = useGlobalStore((state) => state.pauseCommands);

  const handleKeyDown = useCallback(
    async (e: KeyboardEvent) => {
      if (!side || pauseCommands) return;
      const selectedIds = selectedCards.map((card) => card.id);
      let newAmount = "";
      switch (e.key) {
        case "t":
          if (selectedCards.length === 0) return;
          await tapCards(selectedIds);
          break;
        case "d":
          // draw cards if no cards are selected
          if (selectedCards.length === 0) {
            setToastMessage("*D*raw ...");
            setDrawing(true);
          }
          // otherwise move selected cards to deck
          else {
            setToastMessage("Moved to *D*eck");
            await moveCards(selectedIds, "library");
            setSelectedCards([]);
          }
          break;
        case "s":
          setToastMessage("*S*huffle");
          await shuffle();
          break;
        case "b":
          if (adding) {
            newAmount = addAmount + e.key.toUpperCase();
            setAddAmount(newAmount);
            setToastMessage(`*A*dd ${newAmount}`);
            return;
          }
          if (selectedCards.length === 0) return;
          setToastMessage("Moved to *B*attlefield");
          await moveCards(selectedIds, "battlefield");
          setSelectedCards([]);
          break;
        case "h":
          if (selectedCards.length === 0) return;
          setToastMessage("Moved to *H*and");
          await moveCards(selectedIds, "hand");
          setSelectedCards([]);
          break;
        case "g":
          if (adding) {
            newAmount = addAmount + e.key.toUpperCase();
            setAddAmount(newAmount);
            setToastMessage(`*A*dd ${newAmount}`);
            return;
          }
          if (selectedCards.length === 0) return;
          setToastMessage("Moved to *G*raveyard");
          await moveCards(selectedIds, "graveyard");
          setSelectedCards([]);
          break;
        case "a":
          setToastMessage("*A*dd");
          setAddAmount("");
          setAdding(true);
          break;
        case "w":
        case "r":
          if (!adding) return;
          newAmount = addAmount + e.key.toUpperCase();
          setAddAmount(newAmount);
          setToastMessage(`*A*dd ${newAmount}`);
          break;
        case "u":
          if (adding) {
            newAmount = addAmount + e.key.toUpperCase();
            setAddAmount(newAmount);
            setToastMessage(`*A*dd ${newAmount}`);
            return;
          }
          await untapAll();
          break;
        case "Enter":
          if (adding) {
            setToastMessage(`*A*dd ${addAmount}`);
            const tappedLands = attemptToAddMana(addAmount, side.battlefield);
            if (!tappedLands) {
              setToastMessage("Not enough available mana");
              return;
            }
            await tapCards(tappedLands.map((card) => card.id));
            setAddAmount("");
            setAdding(false);
            return;
          }
          break;
        case "Backspace":
          if (adding) {
            const newAmount = addAmount.slice(0, -1);
            setAddAmount(newAmount);
            setToastMessage(`*A*dd ${newAmount}`);
            return;
          }
          break;
      }
      if (Number.isInteger(Number(e.key))) {
        const amount = Number(e.key);
        if (drawing) {
          setToastMessage(`*D*raw ${amount}`);
          setDrawing(false);
          void draw(amount);
        } else if (adding) {
          const newAmount = addAmount + amount;
          setAddAmount(newAmount);
          setToastMessage(`*A*dd ${newAmount}`);
        }
      }
    },
    [
      side,
      moveCards,
      tapCards,
      untapAll,
      draw,
      shuffle,
      selectedCards,
      drawing,
      setSelectedCards,
      adding,
      addAmount,
      pauseCommands,
    ]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);

  /**
   * Debounce hiding the toast messag
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setToastMessage("");
      setDrawing(false);
      setAdding(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const parseToastMessage = () => {
    if (!toastMessage) return null;
    // add `<strong>` tags to the message around the highlighted characters
    const splitMessage = toastMessage.split("*");
    return (
      <p className="text-xs font-light">
        {splitMessage[0]}
        <strong className="font-bold mr-[1px]">{splitMessage[1]}</strong>
        {splitMessage[2]}
      </p>
    );
  };

  const commandMessage = toastMessage && (
    <div className="toast">
      <div className="kbd">
        <p className="text-xs">{parseToastMessage()}</p>
      </div>
    </div>
  );

  return commandMessage;
};

export default useGameCommands;
