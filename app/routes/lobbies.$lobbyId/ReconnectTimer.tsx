import { api } from "@convex/_generated/api";
import { useMutation } from "convex/react";
import { useRef } from "react";
import { Absence } from "~/hooks/draft/useAbsences";
import { isHost, LobbyMember, LobbyView } from "~/hooks/lobby/useLobby";
import { useNow } from "~/hooks/useNow";
import ConfirmSkip from "~/routes/lobbies.$lobbyId/ConfirmSkip";
import { formatCountdown, msLeft } from "~/util/countdown";

type ReconnectTimerProps = {
  lobby: LobbyView;
  member: LobbyMember;
  absence: Absence;
};

const ReconnectTimer = ({ lobby, member, absence }: ReconnectTimerProps) => {
  const pause = useMutation(api.draft.absences.pause);
  const resume = useMutation(api.draft.absences.resume);
  const skip = useMutation(api.draft.absences.skip);
  const confirmRef = useRef<HTMLDialogElement>(null);
  const left = msLeft(absence, useNow(1000));
  const paused = absence.remainingMs !== null;
  const target = { lobbyId: lobby.id, userId: member.userId };

  if (left === 0)
    return <span className="text-xs italic">picking automatically</span>;
  return (
    <span className="flex items-center gap-1 text-xs" data-reconnect-timer>
      <span className="italic">
        {paused ? "paused" : "waiting"} {formatCountdown(left)}
      </span>
      {isHost(lobby) && (
        <>
          <button
            className="btn btn-ghost btn-xs"
            onClick={() => (paused ? resume(target) : pause(target))}
          >
            {paused ? "Resume" : "Pause"}
          </button>
          <button
            className="btn btn-ghost btn-xs"
            onClick={() => confirmRef.current?.showModal()}
          >
            Skip
          </button>
          <ConfirmSkip
            modalRef={confirmRef}
            username={member.username}
            onConfirm={() => skip(target)}
          />
        </>
      )}
    </span>
  );
};

export default ReconnectTimer;
