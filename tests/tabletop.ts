import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import { basicLand } from "../convex/deck/zones";
import { Backend, openLobby, Player, signIn, startBackend } from "./backend";

const DECK_SIZE = 10;

const spell = (index: number) => ({
  ...basicLand("island", `card-${index}`),
  name: `Spell ${index}`,
  type: "Instant",
  subtype: "",
});

export const deckFor = async (backend: Backend, owner: Player) => {
  const { lobbyId } = await openLobby(backend, [`host of ${owner.userId}`]);
  return backend.run((ctx) =>
    ctx.db.insert("decks", {
      userId: owner.userId,
      lobbyId,
      name: "tattered-kithkin",
      cards: Array.from({ length: DECK_SIZE }, (_, index) => spell(index)),
      sideboard: [],
    })
  );
};

export const openGame = async (backend: Backend, usernames: string[]) => {
  const players: Player[] = [];
  for (const username of usernames) players.push(await signIn(backend, username));
  const [host, ...guests] = players;
  const gameId: Id<"games"> = await host.as.mutation(api.game.games.create, {});
  for (const guest of guests) {
    await guest.as.mutation(api.game.games.join, { gameId });
  }
  return { gameId, players };
};

export const startGame = async (backend: Backend, usernames: string[]) => {
  const { gameId, players } = await openGame(backend, usernames);
  for (const player of players) {
    const deckId = await deckFor(backend, player);
    await player.as.mutation(api.game.setup.chooseDeck, { gameId, deckId });
  }
  return { gameId, players };
};

export const startedGame = async () => {
  const backend = startBackend();
  const { gameId, players } = await startGame(backend, ["Ana", "Ben"]);
  const [ana, ben] = players;
  return { backend, gameId, ana, ben };
};

export const closeGame = (backend: Backend, gameId: Id<"games">) =>
  backend.run((ctx) =>
    ctx.db.patch(gameId, { status: "closed", closedAt: Date.now() })
  );

export const tableOf = async (player: Player, gameId: Id<"games">) =>
  (await player.as.query(api.game.games.get, { gameId }))!;

export const sideOf = async (
  viewer: Player,
  gameId: Id<"games">,
  owner: Player = viewer
) => {
  const table = await tableOf(viewer, gameId);
  return table.players.find((player) => player.userId === owner.userId)!.side!;
};

const SETUP_ENTRIES = 4;

export const logOf = async (player: Player, gameId: Id<"games">) => {
  const entries = await player.as.query(api.game.log.recent, { gameId });
  return entries.map((entry) => entry.message).slice(SETUP_ENTRIES);
};
