import { api } from "@convex/_generated/api";
import { useMutation } from "convex/react";
import Heading from "~/components/Heading";
import { useSetting } from "~/hooks/draft/usePacks";
import { isHost, LobbyView } from "~/hooks/lobby/useLobby";

const REVEAL = "animate-in fade-in zoom-in-90 duration-1000 fill-mode-backwards";

const GenerationError = ({ lobby }: { lobby: LobbyView }) => {
  const retry = useMutation(api.draft.failures.retryGeneration);
  return (
    <div role="alert" className="alert alert-error max-w-[600px]">
      <span>Generation failed: {lobby.generationError}</span>
      {isHost(lobby) ? (
        <button className="btn btn-sm" onClick={() => retry({ lobbyId: lobby.id })}>
          Retry
        </button>
      ) : (
        <span>Waiting for the host to retry.</span>
      )}
    </div>
  );
};

const GeneratingScreen = ({ lobby }: { lobby: LobbyView }) => {
  const setting = useSetting(lobby.id);
  return (
    <div className="flex flex-col gap-4 flex-1 justify-center items-center">
      {setting && (
        <>
          <span className={REVEAL}>
            <Heading>{setting.name}</Heading>
          </span>
          <p className={`${REVEAL} delay-1000 max-w-[600px]`}>
            {setting.thesis}
          </p>
          <p className={`${REVEAL} delay-3000 max-w-[600px]`}>
            <strong>{setting.newMechanic.name}</strong>
            {": "}
            {setting.newMechanic.rules_text}
          </p>
        </>
      )}
      {lobby.generationError ? (
        <GenerationError lobby={lobby} />
      ) : (
        <Heading>
          <div className="flex items-center gap-4">
            <span className="loading loading-dots loading-lg"></span>
            {setting ? `Creating Packs for Round ${lobby.round}` : "Draft Starting"}
          </div>
        </Heading>
      )}
    </div>
  );
};

export default GeneratingScreen;
