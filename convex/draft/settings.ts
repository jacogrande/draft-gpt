import { v } from "convex/values";
import { query } from "../_generated/server";
import { viewAsMember } from "../lobby/access";

export const forLobby = query({
  args: { lobbyId: v.id("lobbies") },
  handler: async (ctx, { lobbyId }) => {
    const view = await viewAsMember(ctx, lobbyId);
    const setting =
      view?.lobby.settingId && (await ctx.db.get(view.lobby.settingId));
    if (!setting) return null;
    return {
      name: setting.name,
      thesis: setting.thesis,
      description: setting.description,
      newMechanic: setting.newMechanic,
    };
  },
});
