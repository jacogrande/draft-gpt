import { v } from "convex/values";
import { query } from "../_generated/server";
import { viewAsMember } from "../lobby/access";
import { ConversationMessage } from "../lobby/worldbuilding";
import { CreativeIntent } from "./set/intent";
import { Blueprint } from "./set/types";

export const forLobby = query({
  args: { lobbyId: v.id("lobbies") },
  handler: async (ctx, { lobbyId }) => {
    const view = await viewAsMember(ctx, lobbyId);
    const run = view?.lobby.setRunId && await ctx.db.get(view.lobby.setRunId);
    if (!run?.intent || !run.conversation) return null;
    const intent = JSON.parse(run.intent) as CreativeIntent;
    const messages = JSON.parse(run.conversation) as ConversationMessage[];
    const blueprint = run.blueprint ? JSON.parse(run.blueprint) as Blueprint : undefined;
    return {
      preferences: intent.preferences.map(preference => {
        const sources = messages.filter(m => preference.sourceMessages.includes(m.id));
        return { ...preference, sources: sources.map(m => ({ id: m.id, text: m.text })),
          supportCount: new Set(sources.flatMap(m => m.supportedBy)).size,
          plan: blueprint?.preferencePlan?.find(p => p.preferenceId === preference.id),
        };
      }),
      conflicts: intent.conflicts,
      ignored: intent.ignoredMessages.map(item => ({ reason: item.reason,
        sources: messages.filter(m => item.sourceMessages.includes(m.id)).map(m => ({ id: m.id, text: m.text })),
      })),
    };
  },
});
