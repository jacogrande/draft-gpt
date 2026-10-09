import { defineTable } from "convex/server";
import { Infer, v } from "convex/values";
import { cardFace } from "../card";

export const settingFields = {
  name: v.string(),
  thesis: v.string(),
  description: v.string(),
  legendaryComponents: v.array(
    v.object({ name: v.string(), type: v.string(), description: v.string() })
  ),
  newMechanic: v.object({
    name: v.string(),
    description: v.string(),
    rules_text: v.string(),
  }),
  setArchetypes: v.array(
    v.object({ name: v.string(), description: v.string() })
  ),
};

const settingObject = v.object(settingFields);

export type Setting = Infer<typeof settingObject>;

export const draftTables = {
  settings: defineTable({
    lobbyId: v.id("lobbies"),
    ...settingFields,
  }).index("by_lobby", ["lobbyId"]),

  packs: defineTable({
    lobbyId: v.id("lobbies"),
    round: v.number(),
    order: v.array(v.id("users")),
    position: v.number(),
    holderId: v.union(v.id("users"), v.null()),
    cardCount: v.number(),
    ready: v.boolean(),
  }).index("by_lobby_round", ["lobbyId", "round"]),

  cards: defineTable({
    settingId: v.id("settings"),
    lobbyId: v.id("lobbies"),
    packId: v.id("packs"),
    pickedBy: v.union(v.id("users"), v.null()),
    ...cardFace,
  })
    .index("by_pack", ["packId"])
    .index("by_setting", ["settingId"]),
};
