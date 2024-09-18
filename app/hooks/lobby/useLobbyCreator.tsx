import { useNavigate } from "@remix-run/react";
import { useState } from "react";
import { useToast } from "~/hooks/useToast";
import { useUser } from "~/hooks/useUser";
import { createRandomLobbyName, createLobby } from "~/model/lobby";

const useLobbyCreator = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [creatingLobby, setCreatingLobby] = useState<boolean>(false);

  const handleLobbyCreation = async () => {
    if (!user) {
      toast("You must be signed in to create a lobby", "error");
      return;
    }
    setCreatingLobby(true);
    try {
      const randomLobbyName = createRandomLobbyName();
      const newLobbyId = await createLobby(user, randomLobbyName);
      navigate(`/lobbies/${newLobbyId}`);
    } catch (error) {
      console.error(error);
      toast("Unable to create lobby", "error");
    } finally {
      setCreatingLobby(false);
    }
  };

  return { creatingLobby, handleLobbyCreation };
};

export default useLobbyCreator;
