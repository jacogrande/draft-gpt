import { vi } from "vitest";
import { api } from "../convex/_generated/api";
import { Id } from "../convex/_generated/dataModel";
import {
  Backend,
  openLobby,
  Player,
  readyEveryone,
  startBackend,
} from "./backend";

const STEP_MS = 250;
const STEPS_PER_SECOND = 1000 / STEP_MS;
const HEARTBEAT_STEPS = 20 * STEPS_PER_SECOND;
const GENERATION_SECONDS = 20;

export const seen = async (lobbyId: Id<"lobbies">, players: Player[]) => {
  for (const player of players) {
    await player.as.mutation(api.lobby.presence.heartbeat, { lobbyId });
  }
};

export const pass = async (
  backend: Backend,
  seconds: number,
  lobbyId?: Id<"lobbies">,
  watching: Player[] = []
) => {
  for (let step = 1; step <= seconds * STEPS_PER_SECOND; step++) {
    vi.advanceTimersByTime(STEP_MS);
    await backend.finishInProgressScheduledFunctions();
    if (lobbyId && step % HEARTBEAT_STEPS === 0) await seen(lobbyId, watching);
  }
};

export const settle = (backend: Backend) => pass(backend, GENERATION_SECONDS);

export const startedDraft = async (usernames: string[]) => {
  const backend = startBackend();
  const { lobbyId, players } = await openLobby(backend, usernames);
  await readyEveryone(lobbyId, players);
  await seen(lobbyId, players);
  await players[0].as.mutation(api.draft.start.startDraft, { lobbyId });
  await settle(backend);
  return { backend, lobbyId, players };
};

export const lobbyOf = (player: Player, lobbyId: Id<"lobbies">) =>
  player.as.query(api.lobby.lobbies.get, { lobbyId });

export const packOf = (player: Player, lobbyId: Id<"lobbies">) =>
  player.as.query(api.draft.picks.current, { lobbyId });

export const deckSize = async (player: Player, lobbyId: Id<"lobbies">) => {
  const deck = await player.as.query(api.deck.decks.forLobby, { lobbyId });
  return deck?.cards.length ?? 0;
};

export const pickFirst = async (player: Player, lobbyId: Id<"lobbies">) => {
  const pack = await packOf(player, lobbyId);
  if (!pack) return false;
  await player.as.mutation(api.draft.picks.pick, { cardId: pack.cards[0].id });
  return true;
};
