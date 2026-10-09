import { api } from "@convex/_generated/api";
import { useNavigate } from "@remix-run/react";
import { useMutation } from "convex/react";
import { useState } from "react";
import { useToast } from "~/hooks/useToast";
import { randomLobbyName } from "~/util/randomLobbyName";

const useLobbyCreator = () => {
  const create = useMutation(api.lobby.lobbies.create);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [creatingLobby, setCreatingLobby] = useState<boolean>(false);

  const handleLobbyCreation = async () => {
    setCreatingLobby(true);
    try {
      const lobbyId = await create({ name: randomLobbyName() });
      navigate(`/lobbies/${lobbyId}`);
    } catch {
      toast("Unable to create lobby", "error");
    } finally {
      setCreatingLobby(false);
    }
  };

  return { creatingLobby, handleLobbyCreation };
};

export default useLobbyCreator;
