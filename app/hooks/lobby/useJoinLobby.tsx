import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useEffect, useState } from "react";

type Admission = "joining" | "joined" | "full" | "in-progress" | "closed";

export const useJoinLobby = (lobbyId: Id<"lobbies">): Admission => {
  const join = useMutation(api.lobby.lobbies.join);
  const [admission, setAdmission] = useState<Admission>("joining");

  useEffect(() => {
    let current = true;
    join({ lobbyId })
      .then((decision) =>
        decision.kind === "refused" ? decision.reason : "joined"
      )
      .catch((): Admission => "closed")
      .then((result) => current && setAdmission(result));
    return () => {
      current = false;
    };
  }, [join, lobbyId]);

  return admission;
};
