import { api } from "@convex/_generated/api";
import { useNavigate } from "@remix-run/react";
import { useMutation } from "convex/react";
import { useState } from "react";
import { useToast } from "~/hooks/useToast";
import { randomGameName } from "~/util/randomGameName";

const useGameCreator = () => {
  const create = useMutation(api.game.games.create);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [creatingGame, setCreatingGame] = useState<boolean>(false);

  const handleGameCreation = async () => {
    setCreatingGame(true);
    try {
      navigate(`/games/${await create({ code: randomGameName() })}`);
    } catch {
      toast("Unable to create game", "error");
    } finally {
      setCreatingGame(false);
    }
  };

  return { creatingGame, handleGameCreation };
};

export default useGameCreator;
