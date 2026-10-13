import { useCallback, useEffect, useState } from "react";
import { useGame, viewerSeat } from "~/hooks/game/useGame";
import { useGameActions } from "~/hooks/game/useGameActions";
import { useGlobalStore } from "~/hooks/useGlobalStore";
import { attemptToAddMana } from "~/util/attemptToAddMana";

const MANA_LETTERS = ["w", "u", "b", "r", "g"];

const isDigit = (key: string) => /^\d$/.test(key);

const isTypingTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) return false;
  if (target.closest("[role=menu]")) return true;
  if (target.isContentEditable) return true;
  return ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
};

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
      if (e.metaKey || e.ctrlKey || e.altKey || e.repeat) return;
      if (isTypingTarget(e.target)) return;
      const selectedIds = selectedCards.map((card) => card.id);

      if (drawing) {
        if (e.key === "Escape") {
          setDrawing(false);
          setToastMessage("");
          return;
        }
        if (!isDigit(e.key)) return;
        const amount = Number(e.key);
        setDrawing(false);
        if (amount === 0) {
          setToastMessage("");
          return;
        }
        setToastMessage(`*D*raw ${amount}`);
        void draw(amount);
        return;
      }

      if (adding) {
        const key = e.key.toLowerCase();
        if (e.key === "Escape") {
          setAdding(false);
          setAddAmount("");
          setToastMessage("");
          return;
        }
        if (e.key === "Enter") {
          if (addAmount === "") return;
          const tappedLands = attemptToAddMana(addAmount, side.battlefield);
          if (!tappedLands || tappedLands.length === 0) {
            setToastMessage("Not enough available mana");
            return;
          }
          setToastMessage(`*A*dd ${addAmount}`);
          void tapCards(tappedLands.map((card) => card.id));
          setAddAmount("");
          setAdding(false);
          return;
        }
        if (e.key === "Backspace") {
          const newAmount = addAmount.slice(0, -1);
          setAddAmount(newAmount);
          setToastMessage(`*A*dd ${newAmount}`);
          return;
        }
        if (isDigit(e.key) || MANA_LETTERS.includes(key)) {
          const newAmount = addAmount + e.key.toUpperCase();
          setAddAmount(newAmount);
          setToastMessage(`*A*dd ${newAmount}`);
        }
        return;
      }

      const moveSelected = async (
        to: "library" | "battlefield" | "hand" | "graveyard",
        label: string
      ) => {
        if (selectedCards.length === 0) return;
        setToastMessage(label);
        await moveCards(selectedIds, to);
        setSelectedCards([]);
      };

      switch (e.key) {
        case "t":
          if (selectedCards.length === 0) return;
          await tapCards(selectedIds);
          break;
        case "d":
          if (selectedCards.length === 0) {
            setToastMessage("*D*raw ...");
            setDrawing(true);
          } else {
            await moveSelected("library", "Moved to *D*eck");
          }
          break;
        case "s":
          setToastMessage("*S*huffle");
          await shuffle();
          break;
        case "b":
          await moveSelected("battlefield", "Moved to *B*attlefield");
          break;
        case "h":
          await moveSelected("hand", "Moved to *H*and");
          break;
        case "g":
          await moveSelected("graveyard", "Moved to *G*raveyard");
          break;
        case "a":
          setToastMessage("*A*dd");
          setAddAmount("");
          setAdding(true);
          break;
        case "u":
          await untapAll();
          break;
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
