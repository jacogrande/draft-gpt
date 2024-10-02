import { useCallback, useEffect, useState } from "react";
import { useGameStore } from "~/hooks/game/useGame";
import { useGlobalStore } from "~/hooks/useGlobalStore";
import { useUser } from "~/hooks/useUser";
import { tapManyCards, untapBattlefield } from "~/model/game/card";
import { drawCards, shuffleDeck } from "~/model/game/deck";
import { moveManyCardsToZone } from "~/model/game/zone";
import { attemptToAddMana } from "~/util/attemptToAddMana";

const useGameCommands = () => {
  const [toastMessage, setToastMessage] = useState<string>("");
  const [drawing, setDrawing] = useState<boolean>(false);
  const [adding, setAdding] = useState<boolean>(false);
  const [addAmount, setAddAmount] = useState<string>("");
  const { game } = useGameStore();
  const { user } = useUser();
  const selectedCards = useGlobalStore((state) => state.selectedCards);
  const setSelectedCards = useGlobalStore((state) => state.setSelectedCards);

  const handleKeyDown = useCallback(
    async (e: KeyboardEvent) => {
      if (!game || !user) return;
      let newAmount = "";
      switch (e.key) {
        case "t":
          if (selectedCards.length === 0) return;
          await tapManyCards(
            game.id,
            user.uid,
            selectedCards.map((card) => card.id)
          );
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
            await moveManyCardsToZone(game.id, user.uid, selectedCards, "deck");
            setSelectedCards([]);
          }
          break;
        case "s":
          setToastMessage("*S*huffle");
          await shuffleDeck(game.id, user.uid);
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
          await moveManyCardsToZone(
            game.id,
            user.uid,
            selectedCards,
            "battlefield"
          );
          setSelectedCards([]);
          break;
        case "h":
          if (selectedCards.length === 0) return;
          setToastMessage("Moved to *H*and");
          await moveManyCardsToZone(game.id, user.uid, selectedCards, "hand");
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
          await moveManyCardsToZone(
            game.id,
            user.uid,
            selectedCards,
            "graveyard"
          );
          setSelectedCards([]);
          break;
        case "a":
          setToastMessage("*A*dd");
          setAddAmount("");
          setAdding(true);
          break;
        case "w":
        case "r":
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
          await untapBattlefield(game.id, user.uid);
          break;
        case "Enter":
          if (adding) {
            setToastMessage(`*A*dd ${addAmount}`);
            const tappedLands = attemptToAddMana(
              addAmount,
              game.decks[user.uid]
            );
            if (!tappedLands) {
              setToastMessage("Not enough available mana");
              return;
            }
            await tapManyCards(
              game.id,
              user.uid,
              tappedLands.map((card) => card.id)
            );
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
          drawCards(game.id, game.decks[user.uid], user.uid, amount);
        } else if (adding) {
          const newAmount = addAmount + amount;
          setAddAmount(newAmount);
          setToastMessage(`*A*dd ${newAmount}`);
        }
      }
    },
    [game, user, selectedCards, drawing, setSelectedCards, adding, addAmount]
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
