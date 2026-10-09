import { expect, test } from "vitest";
import {
  Backend,
  openLobby,
  Player,
  rejection,
  signIn,
  startBackend,
} from "../../tests/backend";
import { api } from "../_generated/api";
import { basicLand } from "./zones";

const spell = (id: string) => ({
  ...basicLand("island", id),
  name: `Spell ${id}`,
  type: "Instant",
  subtype: "",
});

const draftedDeck = async (backend: Backend, owner: Player) => {
  const { lobbyId } = await openLobby(backend, ["host"]);
  return backend.run((ctx) =>
    ctx.db.insert("decks", {
      userId: owner.userId,
      lobbyId,
      name: "tattered-kithkin",
      cards: [spell("a"), spell("b")],
      sideboard: [],
    })
  );
};

test("cards move between mainboard and sideboard", async () => {
  const backend = startBackend();
  const owner = await signIn(backend, "Ana");
  const deckId = await draftedDeck(backend, owner);
  const read = async () =>
    (await owner.as.query(api.deck.decks.get, { deckId }))!;

  await owner.as.mutation(api.deck.decks.moveToSideboard, {
    deckId,
    cardId: "a",
  });
  let deck = await read();
  expect(deck.cards.map((card) => card.id)).toEqual(["b"]);
  expect(deck.sideboard.map((card) => card.id)).toEqual(["a"]);

  await owner.as.mutation(api.deck.decks.moveToMainboard, {
    deckId,
    cardId: "a",
  });
  deck = await read();
  expect(deck.cards.map((card) => card.id)).toEqual(["b", "a"]);
  expect(deck.sideboard).toEqual([]);
});

test("basic lands are added to the mainboard and discarded when sideboarded", async () => {
  const backend = startBackend();
  const owner = await signIn(backend, "Ana");
  const deckId = await draftedDeck(backend, owner);
  const read = async () =>
    (await owner.as.query(api.deck.decks.get, { deckId }))!;

  await owner.as.mutation(api.deck.decks.addBasics, {
    deckId,
    lands: ["forest", "forest", "swamp"],
  });
  let deck = await read();
  expect(deck.cards.map((card) => card.name)).toEqual([
    "Spell a",
    "Spell b",
    "Forest",
    "Forest",
    "Swamp",
  ]);

  await owner.as.mutation(api.deck.decks.moveToSideboard, {
    deckId,
    cardId: deck.cards[2].id,
  });
  deck = await read();
  expect(deck.cards).toHaveLength(4);
  expect(deck.sideboard).toEqual([]);
});

test("a player can only see and change their own decks", async () => {
  const backend = startBackend();
  const owner = await signIn(backend, "Ana");
  const stranger = await signIn(backend, "Zed");
  const deckId = await draftedDeck(backend, owner);

  expect(await owner.as.query(api.deck.decks.list, {})).toHaveLength(1);
  expect(await stranger.as.query(api.deck.decks.list, {})).toEqual([]);
  expect(await stranger.as.query(api.deck.decks.get, { deckId })).toBeNull();
  await expect(
    stranger.as.mutation(api.deck.decks.moveToSideboard, {
      deckId,
      cardId: "a",
    })
  ).rejects.toThrow(rejection("DECK_NOT_FOUND"));
});
