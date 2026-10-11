import { api } from "@convex/_generated/api";
import type { Zone } from "@convex/game/table";
import { useMutation } from "convex/react";
import { useMemo } from "react";
import { useGameId } from "~/hooks/game/useGame";
import { useToast } from "~/hooks/useToast";

export const useGameActions = () => {
  const gameId = useGameId();
  const toast = useToast((state) => state.toast);
  const moveCards = useMutation(api.game.play.moveCards);
  const tapCards = useMutation(api.game.play.tapCards);
  const untapAll = useMutation(api.game.play.untapAll);
  const draw = useMutation(api.game.play.draw);
  const shuffle = useMutation(api.game.play.shuffle);
  const setLife = useMutation(api.game.play.setLife);

  return useMemo(() => {
    const attempt =
      <A extends unknown[]>(
        run: (...args: A) => Promise<unknown>,
        failure: string
      ) =>
      async (...args: A) => {
        try {
          await run(...args);
        } catch {
          toast(failure, "error");
        }
      };
    return {
      moveCards: attempt(
        (cardIds: string[], to: Zone) => moveCards({ gameId, cardIds, to }),
        "Could not move cards"
      ),
      tapCards: attempt(
        (cardIds: string[]) => tapCards({ gameId, cardIds }),
        "Could not tap cards"
      ),
      untapAll: attempt(() => untapAll({ gameId }), "Could not untap"),
      draw: attempt(
        (amount: number) => draw({ gameId, amount }),
        "Could not draw"
      ),
      shuffle: attempt(() => shuffle({ gameId }), "Could not shuffle"),
      setLife: attempt(
        (life: number) => setLife({ gameId, life }),
        "Could not set life total"
      ),
    };
  }, [gameId, toast, moveCards, tapCards, untapAll, draw, shuffle, setLife]);
};
