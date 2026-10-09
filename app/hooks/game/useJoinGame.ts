import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useEffect, useState } from "react";

type Admission = "joining" | "joined" | "full" | "closed";

export const useJoinGame = (gameId: Id<"games">): Admission => {
  const join = useMutation(api.game.games.join);
  const [admission, setAdmission] = useState<Admission>("joining");

  useEffect(() => {
    let current = true;
    join({ gameId })
      .then((decision) =>
        decision.kind === "refused" ? decision.reason : "joined"
      )
      .catch((): Admission => "closed")
      .then((result) => current && setAdmission(result));
    return () => {
      current = false;
    };
  }, [join, gameId]);

  return admission;
};
