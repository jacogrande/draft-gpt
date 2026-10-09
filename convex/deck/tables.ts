import { defineTable } from "convex/server";
import { Infer, v } from "convex/values";
import { cardFace } from "../card";

export const deckCard = v.object({ id: v.string(), ...cardFace });

export type DeckCard = Infer<typeof deckCard>;

export const deckTables = {
  decks: defineTable({
    userId: v.id("users"),
    lobbyId: v.id("lobbies"),
    name: v.string(),
    cards: v.array(deckCard),
    sideboard: v.array(deckCard),
  })
    .index("by_user", ["userId"])
    .index("by_user_lobby", ["userId", "lobbyId"]),
};
