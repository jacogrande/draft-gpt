import { api } from "@convex/_generated/api";
import { ChatBubbleOvalLeftEllipsisIcon } from "@heroicons/react/16/solid";
import { useMutation, useQuery } from "convex/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { LobbyView } from "~/hooks/lobby/useLobby";
import { useToast } from "~/hooks/useToast";
import ChatMessage from "~/routes/lobbies.$lobbyId/ChatMessage";

const WorldbuildingChat = ({ lobby }: { lobby: LobbyView }) => {
  const messages = useQuery(api.lobby.messages.list, { lobbyId: lobby.id });
  const post = useMutation(api.lobby.messages.post);
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(false);
  const { toast } = useToast();
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    if (!textAreaRef.current) return;
    textAreaRef.current.style.height = "auto";
    textAreaRef.current.style.height = textAreaRef.current.scrollHeight + "px";
  };

  const handleSubmit = useCallback(
    async (e?: React.FormEvent<HTMLFormElement>) => {
      e?.preventDefault();
      setLoading(true);
      try {
        if (!message) return;
        await post({ lobbyId: lobby.id, text: message });
        setMessage("");
      } catch {
        toast("Unable to send message", "error");
      } finally {
        setLoading(false);
      }
    },
    [message, lobby.id, post, toast]
  );

  const handleOpen = () => {
    setOpen(true);
  };

  useEffect(() => {
    if (!textAreaRef.current) return;
    textAreaRef.current.onkeydown = (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    };
  }, [textAreaRef, handleSubmit]);

  /**
   * Close the dropdown when the user clicks outside of it
   */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [dropdownRef, setOpen]);

  return (
    <div
      className={`absolute bottom-0 right-0 dropdown dropdown-end dropdown-top ${
        open && "dropdown-open"
      }`}
      ref={dropdownRef}
    >
      <button tabIndex={0} className="btn m-1" onClick={handleOpen}>
        <ChatBubbleOvalLeftEllipsisIcon className="h-5 w-5" />
        Worldbuilding
      </button>
      <div className="dropdown-content menu py-4 pl-8 bg-none flex flex-col gap-2 rounded-box">
        {messages?.map((message) => (
          <ChatMessage
            key={message.id}
            message={message.text}
            sentByUser={message.userId === lobby.viewerId}
          />
        ))}
        <form className="flex gap-4 items-end" onSubmit={handleSubmit}>
          <textarea
            className="textarea textarea-bordered flex-1 w-72 prose h-12"
            rows={1}
            placeholder="Make a worldbuilding suggestion..."
            value={message}
            onChange={handleChange}
            tabIndex={0}
            ref={textAreaRef}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !message}
            tabIndex={0}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default WorldbuildingChat;
