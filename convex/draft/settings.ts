import { Blueprint } from "./set/types";
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
    const run = view?.lobby.setRunId && (await ctx.db.get(view.lobby.setRunId));
    if (run && !run.blueprint) return null;
    const mechanics = run?.blueprint
      ? (JSON.parse(run.blueprint) as Blueprint).mechanics.map((m) => ({
          name: m.name,
          rules_text: m.reminder,
        }))
      : setting.newMechanic.name
      ? [setting.newMechanic]
      : [];
    return {
      name: setting.name,
      thesis: setting.thesis,
      description: setting.description,
      newMechanic: setting.newMechanic,
      archetypes: setting.setArchetypes,
      mechanics,
    };
  },
});
