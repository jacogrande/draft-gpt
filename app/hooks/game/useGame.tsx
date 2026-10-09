import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useParams } from "@remix-run/react";
import { useQuery } from "convex/react";

export const useGameId = () => useParams().gameId as Id<"games">;

export const useGame = () =>
  useQuery(api.game.games.get, { gameId: useGameId() });

export type GameView = NonNullable<ReturnType<typeof useGame>>;
export type GamePlayer = GameView["players"][number];
export type GameSide = NonNullable<GamePlayer["side"]>;
export type GameCard = GameSide["battlefield"][number];

export const viewerSeat = (game: GameView) =>
  game.players.find((player) => player.userId === game.viewerId) ?? null;

export const opponentSeat = (game: GameView) =>
  game.players.find((player) => player.userId !== game.viewerId) ?? null;

const NO_EXTRAS = { tokens: [], counters: [] };

export const useGameExtras = () =>
  useQuery(api.game.games.extras, { gameId: useGameId() }) ?? NO_EXTRAS;

type GameExtras = NonNullable<
  ReturnType<typeof useQuery<typeof api.game.games.extras>>
>;
export type GameToken = GameExtras["tokens"][number];
export type GameCounter = GameExtras["counters"][number];

export const useGameLog = () =>
  useQuery(api.game.log.recent, { gameId: useGameId() }) ?? [];

const LAND_TYPES = ["Land", "Basic Land"];

export const splitBattlefield = (battlefield: GameCard[]) => ({
  lands: battlefield.filter((card) => LAND_TYPES.includes(card.type)),
  spells: battlefield.filter((card) => !LAND_TYPES.includes(card.type)),
});
