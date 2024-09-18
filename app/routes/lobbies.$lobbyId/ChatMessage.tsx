const ChatMessage = ({
  message,
  sentByUser,
}: {
  message: string;
  sentByUser: boolean;
}) => {
  const directionClass = sentByUser ? "chat-end" : "chat-start";
  return (
    <div className={`chat ${directionClass}`}>
      <div className="chat-bubble">{message}</div>
    </div>
  );
};

export default ChatMessage;
