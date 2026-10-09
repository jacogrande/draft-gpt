# Architecture

DraftGPT is a static single-page app in front of a Convex backend. Convex holds sign-in, lobbies, drafts, decks, and games, and is the only place state changes.

## The shape of the system

```
Browser (static SPA, Remix in SPA mode)
  routes + components
  hooks  ── useQuery / useMutation ──▶  Convex

Convex
  auth (Google through Convex Auth)
  queries    per-viewer reads, reactive
  mutations  every state change, each a transaction
  actions    OpenAI (cards and art)  ──▶ file storage (card art)
  scheduler  generation, retries, daily cleanup
```

There is no application server. `bun run build` produces static files.

## Backend layout

The backend is grouped by domain. Each folder holds its tables (`tables.ts`), its rules as pure functions, the Convex functions that apply them, and its tests.

| Domain | Owns | Pure rules | Convex functions |
|---|---|---|---|
| `convex/identity/` | Users and usernames | `username.ts` | `users.ts`, `viewer.ts` |
| `convex/lobby/` | Lobbies, members, seats, readiness, worldbuilding chat, presence | `roster.ts`, `away.ts` | `lobbies.ts`, `departure.ts`, `messages.ts`, `presence.ts`, `sightings.ts`, `cleanup.ts`, `access.ts` |
| `convex/draft/` | Settings, packs, cards, picks, rounds, generation, absences | `seating.ts`, `passing.ts`, `absence.ts`, `parsing.ts`, `retry.ts`, `artPrompt.ts` | `start.ts`, `picks.ts`, `picking.ts`, `rounds.ts`, `absences.ts`, `absent.ts`, `autopilot.ts`, `returning.ts`, `generated.ts`, `scheduling.ts`, `failures.ts`, `generation.ts`, `settings.ts` |
| `convex/deck/` | Decks | `zones.ts` | `decks.ts`, `drafted.ts`, `owned.ts` |
| `convex/game/` | Games, seats, each player's zones, life, tokens, counters, the log, presence | `seats.ts`, `table.ts`, `extras.ts` | `games.ts`, `setup.ts`, `play.ts`, `tokens.ts`, `counters.ts`, `log.ts`, `presence.ts`, `cleanup.ts`, `access.ts` |

`convex/card.ts` is the card face shared by draft and deck. `convex/errors.ts` lists every rejection code. `convex/draft/openai.ts` and `images.ts` are the only files that call outside services.

The split inside each domain is functional core, imperative shell: pure files decide, Convex functions load, call them, and write. See `docs/specs/convex-rewrite.md` section 11 for the rules.

## Client layout

| Path | Role |
|---|---|
| `app/routes/` | Pages and their route-local components |
| `app/components/` | Shared components. `Card.tsx` renders every card. `RequireAuth.tsx` guards signed-in pages. |
| `app/hooks/` | Convex queries and mutations wrapped for components, plus small zustand stores for UI state |
| `app/util/` | Pure helpers, shared types, constants |

## Data model

Convex tables:

| Table | Holds |
|---|---|
| `users` | Convex Auth's user plus `username` |
| `lobbies` | `name`, `hostId`, `status`, `round`, `participantIds`, `settingId`, `settingJobId`, `generationError` |
| `lobbyMembers` | One row per member: `seat`, `ready` |
| `lobbyMessages` | Worldbuilding suggestions |
| `lobbyPresence` | `lastSeenAt` per member. Never changes the roster; during a draft it decides when a reconnect countdown starts |
| `settings` | The generated world for a lobby |
| `packs` | `round`, `order` (user ids), `position`, `holderId`, `cardCount`, `ready`, `jobId` (the latest generation attempt) |
| `absences` | One row per participant who is away during a draft: `deadline` while the countdown runs, `remainingMs` while it is paused |
| `cards` | Every generated card, with its pack and `pickedBy` |
| `decks` | One per player per draft, with whole cards embedded in `cards` and `sideboard` |

| `games` | `code` (four characters), `status` (`open`, `playing`, `closed`) |
| `gamePlayers` | One row per seat: `seat`, `life`, and `side`, the player's `library`, `hand`, `battlefield`, and `graveyard` as arrays of whole cards |
| `gameTokens`, `gameCounters` | One row per token or counter, with its owner |
| `gameLog` | One row per logged action |
| `gamePresence` | `lastSeenAt` per player, for display only |

Card art is in Convex file storage.

A lobby's `status` moves `open` → `generating` → `drafting` → (`generating` → `drafting` for rounds 2 and 3) → `complete`. `closed` is reached when the last member leaves an open lobby or cleanup closes an abandoned one.

## Flows

**Sign-in.** Convex Auth with Google. On first sign-in the player picks a username. `useUser` returns a user only once a username exists, and `RequireAuth` shows the username form until then.

**Lobby.** Opening a lobby URL calls `join`, which is idempotent: an existing member gets their seat back. Membership ends only when the member leaves, the host removes them, or the lobby closes. Presence is a heartbeat every 20 seconds while the tab is visible; a member unseen for 60 seconds is shown as away and nothing else changes.

**Draft.**

1. `startDraft` requires two or more members, all ready. It freezes `participantIds` in seat order and schedules setting generation.
2. `generation.createSetting` sends the worldbuilding messages to the model, saves the setting, and deals round 1: one pack per participant, each with a passing order.
3. `generation.createPack` runs once per pack, in parallel. It asks for twelve cards, paints art for each (four at a time, from a prompt built by `draft/artPrompt.ts`), and saves them. A card whose art fails is saved without it. When the last pack of the round is saved, each is topped up to fifteen from the setting's card pool and the lobby becomes `drafting`.
4. `picks.current` gives each player only the pack at the front of their queue. `picks.pick` marks the card, passes the pack, and adds the card to the player's deck in one transaction. The pick that empties the round deals the next one, or completes the draft after round 3.
5. A failed generation step retries twice with backoff. After the third failure the lobby shows the error and the host can retry. A step that never reports back (an action killed at Convex's 10-minute limit) is treated as failed after 11 minutes, and calls to OpenAI time out before that limit.

**A player who disconnects mid-draft.** Each round, the server watches every participant's `lastSeenAt`.

1. A participant unseen for 60 seconds gets an `absences` row with a two-minute countdown, shown to everyone in the sidebar.
2. The host can pause and resume the countdown, or skip it after confirming.
3. When the countdown runs out or is skipped, the server picks a random card for that player from each pack that reaches them, so packs keep moving and the player still ends with a full deck.
4. The player's next heartbeat deletes the row and they pick for themselves again. Leaving again starts a new countdown.
5. Nothing is picked automatically while every participant is away, so an abandoned draft does not generate further rounds.

A heartbeat is only sent while the tab is visible, so a player who switches to another tab for a minute counts as disconnected.

**Decks.** A deck is created by the first pick of a draft. The deckbuilder moves cards between mainboard and sideboard and adds basic lands.

**Play.** Creating a game seats its creator; the other player joins by code or URL, and `join` is idempotent like a lobby's. Each player chooses a deck, the server shuffles a copy of its mainboard into their library, and the game starts when both have chosen. Every table action is one mutation that rewrites the acting player's own `gamePlayers` row and writes the log, so two players acting at once never overwrite each other. `games.get` sends each viewer their own hand and only counts for the opponent's hand and both libraries. Details are in `docs/specs/game-lobbies.md`.

## Trust boundaries and known gaps

- **Convex functions are the boundary.** Every mutation checks the caller and their membership or ownership. Page guards in the browser are for navigation only.
- **The old Firestore database is unused but still open.** Nothing reads or writes it any more, and its deployed rules allow anyone to. Lock or delete it in the Firebase console; Firebase Hosting does not depend on it.
- **Token and counter placement is per screen.** Token positions are not stored and counter positions are in the owner's screen coordinates. Step 4 of the roadmap.
- **A draft cannot be left.** A participant stays in the draft to the end; if they go away, their picks are made at random after the reconnect countdown. If the host is the one away, nobody can pause or skip and the countdown simply runs out.
- **Test sign-in exists in the code** and is enabled only by `AUTH_TEST_LOGIN` on the deployment. It must never be set in production.
- **The card-design model and prompts are the 2024 originals** (`gpt-4o`), moved without change. Rebuilding card creation is step 6 of the roadmap. Card art is current; see `docs/specs/card-art.md`.
