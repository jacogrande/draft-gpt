import { ConversationMessage } from "../convex/lobby/worldbuilding";
import { CreativeIntent } from "../convex/draft/set/intent";

export const cannedIntent = (messages: ConversationMessage[]): CreativeIntent => ({
  preferences: messages.slice(0, 12).map((message, i) => ({
    id: `p-${i + 1}`, kind: /^no /i.test(message.text) ? "avoid" : "subject", text: message.text,
    sourceMessages: [message.id], status: /^no artifacts/i.test(message.text) ? "unsupported" : "active",
    reason: /^no artifacts/i.test(message.text) ? "The fixed set includes Artifact cards." : "An explicit player suggestion.",
  })),
  conflicts: [],
  ignoredMessages: messages.length > 12 ? [{ sourceMessages: messages.slice(12).map(m => m.id), reason: "Additional discussion in this fake-service fixture." }] : [],
});
