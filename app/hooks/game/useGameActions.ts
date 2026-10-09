import { api } from "@convex/_generated/api";
import type { Zone } from "@convex/game/table";
import { useMutation } from "convex/react";
import { useMemo } from "react";
import { useGameId } from "~/hooks/game/useGame";

export const useGameActions = () => {
  const gameId = useGameId();
  const moveCards = useMutation(api.game.play.moveCards);
  const tapCards = useMutation(api.game.play.tapCards);
  const untapAll = useMutation(api.game.play.untapAll);
  const draw = useMutation(api.game.play.draw);
  const shuffle = useMutation(api.game.play.shuffle);
  const setLife = useMutation(api.game.play.setLife);

  return useMemo(
    () => ({
      moveCards: (cardIds: string[], to: Zone) =>
        moveCards({ gameId, cardIds, to }),
      tapCards: (cardIds: string[]) => tapCards({ gameId, cardIds }),
      untapAll: () => untapAll({ gameId }),
      draw: (amount: number) => draw({ gameId, amount }),
      shuffle: () => shuffle({ gameId }),
      setLife: (life: number) => setLife({ gameId, life }),
    }),
    [gameId, moveCards, tapCards, untapAll, draw, shuffle, setLife]
  );
};
