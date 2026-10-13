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

test("basic lands are capped at forty a call and the deck at one hundred and fifty", async () => {
  const backend = startBackend();
  const owner = await signIn(backend, "Ana");
  const deckId = await draftedDeck(backend, owner);
  const size = async () =>
    (await owner.as.query(api.deck.decks.get, { deckId }))!.cards.length;
  const add = (count: number) =>
    owner.as.mutation(api.deck.decks.addBasics, {
      deckId,
      lands: Array.from({ length: count }, () => "forest" as const),
    });

  await add(100);
  expect(await size()).toBe(42);
  for (let round = 0; round < 4; round++) await add(40);
  expect(await size()).toBe(150);
});

test("a player can only see and change their own decks", async () => {
  const backend = startBackend();
  const owner = await signIn(backend, "Ana");
  const stranger = await signIn(backend, "Zed");
  const deckId = await draftedDeck(backend, owner);

  expect(await owner.as.query(api.deck.decks.list, {})).toHaveLength(1);
  expect(await stranger.as.query(api.deck.decks.list, {})).toEqual([]);
  expect(await stranger.as.query(api.deck.decks.get, { deckId })).toBeNull();
  expect(
    await owner.as.query(api.deck.decks.get, { deckId: "not-an-id" })
  ).toBeNull();
  await expect(
    stranger.as.mutation(api.deck.decks.moveToSideboard, {
      deckId,
      cardId: "a",
    })
  ).rejects.toThrow(rejection("DECK_NOT_FOUND"));
});

test("automatic lands use current mainboard costs, fill exactly to seventeen, and are safe to repeat", async () => {
  const backend = startBackend();
  const owner = await signIn(backend, "Ana");
  const deckId = await draftedDeck(backend, owner);
  await backend.run((ctx) =>
    ctx.db.patch(deckId, {
      cards: [
        { ...spell("white"), mana_cost: "{2}{W}{W}" },
        { ...spell("blue"), mana_cost: "1U" },
        ...Array.from({ length: 15 }, (_, i) =>
          basicLand("plains", `land-${i}`)
        ),
      ],
      sideboard: [{ ...spell("red"), mana_cost: "RRRRRRRR" }],
    })
  );
  await Promise.all([
    owner.as.mutation(api.deck.decks.autoAddBasics, { deckId }),
    owner.as.mutation(api.deck.decks.autoAddBasics, { deckId }),
  ]);
  const read = async () =>
    (await owner.as.query(api.deck.decks.get, { deckId }))!;
  const first = await read();
  expect(first.cards).toHaveLength(19);
  expect(first.cards.slice(-2).map((card) => card.subtype)).toEqual([
    "island",
    "island",
  ]);
  await owner.as.mutation(api.deck.decks.autoAddBasics, { deckId });
  expect((await read()).cards).toEqual(first.cards);
  expect(first.sideboard.map((card) => card.id)).toEqual(["red"]);
});

test("automatic lands handle generic-only decks, nonbasic lands, and deck ownership", async () => {
  const backend = startBackend();
  const owner = await signIn(backend, "Ana");
  const stranger = await signIn(backend, "Ben");
  const deckId = await draftedDeck(backend, owner);
  const outcome = await owner.as.mutation(api.deck.decks.autoAddBasics, {
    deckId,
  });
  expect(outcome).toMatchObject({ added: 0, reason: "no-colors" });
  await expect(
    stranger.as.mutation(api.deck.decks.autoAddBasics, { deckId })
  ).rejects.toThrow(rejection("DECK_NOT_FOUND"));
  await expect(
    backend.mutation(api.deck.decks.autoAddBasics, { deckId })
  ).rejects.toThrow(rejection("UNAUTHENTICATED"));
  await backend.run((ctx) =>
    ctx.db.patch(deckId, {
      cards: [
        { ...spell("hybrid"), mana_cost: "{2/W}{U/P}{W/U}{C}" },
        ...Array.from({ length: 16 }, (_, i) => ({
          ...basicLand("forest", `nonbasic-${i}`),
          type: "Land",
          subtype: "Grove",
        })),
      ],
    })
  );
  await owner.as.mutation(api.deck.decks.autoAddBasics, { deckId });
  const deck = (await owner.as.query(api.deck.decks.get, { deckId }))!;
  expect(deck.cards).toHaveLength(18);
  expect(["plains", "island"]).toContain(deck.cards.at(-1)!.subtype);
});
