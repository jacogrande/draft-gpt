import { api } from "@convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { FormEvent, useState } from "react";
import { LobbyView } from "~/hooks/lobby/useLobby";
import { useToast } from "~/hooks/useToast";
import { rejectionCode } from "~/util/rejection";

const WorldbuildingChat = ({ lobby }: { lobby: LobbyView }) => {
  const messages = useQuery(api.lobby.messages.list, { lobbyId: lobby.id });
  const post = useMutation(api.lobby.messages.post);
  const support = useMutation(api.lobby.messages.support);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const { toast } = useToast();
  const marked = messages?.filter(message => message.supportCount > 0) ?? [];
  const submit = async (event?: FormEvent) => {
    event?.preventDefault();
    if (sending || !text.trim()) return;
    setSending(true);
    try { await post({ lobbyId: lobby.id, text }); setText(""); }
    catch (error) { toast(rejectionCode(error) === "TOO_MANY_MESSAGES" ? "This lobby has reached its 200-message limit" : "Unable to send message", "error"); }
    finally { setSending(false); }
  };
  return (
    <section aria-label="Worldbuilding" className="w-full max-w-2xl rounded-box border border-base-300 bg-base-100 p-4 text-left">
      <h2 className="font-semibold">Worldbuilding</h2>
      <p className="text-sm opacity-70">Suggest places, beings, magic, or things to avoid. Mark ideas you want the set to draw from.</p>
      <details className="my-3 rounded-lg bg-base-200 p-3" open>
        <summary className="cursor-pointer text-sm font-semibold">What we’re drawing from</summary>
        {marked.length ? <ul className="mt-2 max-h-32 overflow-y-auto space-y-1 text-sm">
          {marked.map(message => <li key={message.id} className="break-words">
            {message.text} <span className="opacity-60">· {message.supportCount} supporting</span>
          </li>)}
        </ul> : <p className="mt-2 text-sm opacity-70">All suggestions will be considered when the draft starts. Use “Use this idea” to highlight a favorite; it is optional.</p>}
        <p className="mt-2 text-xs opacity-60">These are your marked messages. The world’s interpretation appears after generation starts. Repeated messages do not count as extra support.</p>
      </details>
      <ol aria-label="Worldbuilding messages" className="max-h-56 space-y-3 overflow-y-auto overscroll-contain pr-1">
        {messages?.map(message => <li key={message.id} className="rounded-lg bg-base-200 p-3">
          <p className="text-xs opacity-60">{message.userId === lobby.viewerId ? "You" : "Another player"} · {message.sourceId}</p>
          <p className="whitespace-pre-wrap break-words text-sm">{message.text}</p>
          <button className="btn btn-ghost btn-xs mt-1" type="button" aria-pressed={message.selected}
            aria-label={`Use this idea: ${message.text.slice(0, 80)}`}
            disabled={pending !== null} onClick={async () => {
              setPending(message.id);
              try { await support({ lobbyId: lobby.id, messageId: message.id, use: !message.selected }); }
              catch { toast("Unable to update idea support", "error"); }
              finally { setPending(null); }
            }}>
            {message.selected ? "✓ Using this idea" : "Use this idea"}{message.supportCount ? ` · ${message.supportCount}` : ""}
          </button>
        </li>)}
      </ol>
      <form className="mt-4 flex items-end gap-2" onSubmit={submit}>
        <div className="min-w-0 flex-1">
          <label htmlFor="worldbuilding-message" className="sr-only">Worldbuilding suggestion</label>
          <textarea id="worldbuilding-message" className="textarea textarea-bordered w-full" rows={2} maxLength={500}
            placeholder="Make a worldbuilding suggestion..." value={text} disabled={sending} onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); void submit(); } }} />
          <p className="text-xs opacity-60">{text.length}/500 · Shift+Enter for a new line</p>
        </div>
        <button type="submit" className="btn btn-primary mb-5" disabled={sending || !text.trim()}>Send</button>
      </form>
    </section>
  );
};
export default WorldbuildingChat;
