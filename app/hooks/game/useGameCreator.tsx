import { useNavigate } from "@remix-run/react";
import { useState } from "react";
import { useToast } from "~/hooks/useToast";
import { useUser } from "~/hooks/useUser";
import { createGame } from "~/model/game";
import { randomGameName } from "~/util/randomGameName";

const useGameCreator = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [creatingGame, setCreatingGame] = useState<boolean>(false);

  const handleGameCreation = async () => {
    if (!user) {
      toast("You must be signed in to create a game", "error");
      return;
    }
    setCreatingGame(true);
    try {
      const gameName = randomGameName();
      const newGameId = await createGame(gameName, user);
      navigate(`/games/${newGameId}`);
    } catch (error) {
      console.error(error);
      toast("Unable to create game", "error");
    } finally {
      setCreatingGame(false);
    }
  };

  return { creatingGame, handleGameCreation };
};

export default useGameCreator;
