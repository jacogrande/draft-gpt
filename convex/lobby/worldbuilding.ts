export type ConversationMessage = {
  id: string;
  participant: string;
  text: string;
  supportedBy: string[];
};

export const supportBy = <U extends string>(current: U[], userId: U, use: boolean): U[] =>
  use ? [...new Set([...current, userId])] : current.filter(id => id !== userId);

export const conversationSnapshot = (messages: {
  userId: string; text: string; supportedBy?: string[];
}[]): ConversationMessage[] => {
  const participants = new Map<string, string>();
  for (const message of messages)
    if (!participants.has(message.userId)) participants.set(message.userId, `p${participants.size + 1}`);
  const participant = (id: string) => {
    if (!participants.has(id)) participants.set(id, `p${participants.size + 1}`);
    return participants.get(id)!;
  };
  return messages.map((message, i) => ({
    id: `m${i + 1}`, participant: participant(message.userId), text: message.text,
    supportedBy: [...new Set(message.supportedBy ?? [])].map(participant),
  }));
};
