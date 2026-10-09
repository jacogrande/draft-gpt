# Architecture

DraftGPT is a static single-page app in front of a Convex backend. Convex holds sign-in, lobbies, drafts, and decks, and is the only place state changes. The play table is the exception: games still live in Firestore until step 3 of `docs/specs/refactor-roadmap.md`.

## The shape of the system

```
Browser (static SPA, Remix in SPA mode)
  routes + components
  hooks  ── useQuery / useMutation ──▶  Convex
  model/game ── Firestore SDK ─────▶  Firestore (games only)

Convex
  auth (Google through Convex Auth)
  queries    per-viewer reads, reactive
  mutations  every state change, each a transaction
  actions    OpenAI and getimg.ai  ──▶ file storage (card art)
  scheduler  generation, retries, daily cleanup
```

There is no application server. `bun run build` produces static files.

## Backend layout

The backend is grouped by domain. Each folder holds its tables (`tables.ts`), its rules as pure functions, the Convex functions that apply them, and its tests.

| Domain | Owns | Pure rules | Convex functions |
|---|---|---|---|
| `convex/identity/` | Users and usernames | `username.ts` | `users.ts`, `viewer.ts` |
| `convex/lobby/` | Lobbies, members, seats, readiness, worldbuilding chat, presence | `roster.ts` | `lobbies.ts`, `departure.ts`, `messages.ts`, `presence.ts`, `cleanup.ts`, `access.ts` |
| `convex/draft/` | Settings, packs, cards, picks, rounds, generation | `seating.ts`, `passing.ts`, `parsing.ts`, `retry.ts` | `start.ts`, `picks.ts`, `rounds.ts`, `generated.ts`, `failures.ts`, `generation.ts`, `settings.ts` |
| `convex/deck/` | Decks | `zones.ts` | `decks.ts`, `drafted.ts` |

`convex/card.ts` is the card face shared by draft and deck. `convex/errors.ts` lists every rejection code. `convex/draft/openai.ts` and `images.ts` are the only files that call outside services.

The split inside each domain is functional core, imperative shell: pure files decide, Convex functions load, call them, and write. See `docs/specs/convex-rewrite.md` section 11 for the rules.

## Client layout

| Path | Role |
|---|---|
| `app/routes/` | Pages and their route-local components |
| `app/components/` | Shared components. `Card.tsx` renders every card. `RequireAuth.tsx` guards signed-in pages. |
| `app/hooks/` | Convex queries and mutations wrapped for components, plus small zustand stores for UI state |
| `app/model/game/` | Firestore reads and writes for the play table |
| `app/util/` | Pure helpers, shared types, constants |

## Data model

Convex tables:

| Table | Holds |
|---|---|
| `users` | Convex Auth's user plus `username` |
| `lobbies` | `name`, `hostId`, `status`, `round`, `participantIds`, `settingId`, `generationError` |
| `lobbyMembers` | One row per member: `seat`, `ready` |
| `lobbyMessages` | Worldbuilding suggestions |
| `lobbyPresence` | `lastSeenAt` per member, for display only |
| `settings` | The generated world for a lobby |
| `packs` | `round`, `order` (user ids), `position`, `holderId`, `cardCount`, `ready` |
| `cards` | Every generated card, with its pack and `pickedBy` |
| `decks` | One per player per draft, with whole cards embedded in `cards` and `sideboard` |

Card art is in Convex file storage. Firestore still holds `games/{gameId}`, one document per game.

A lobby's `status` moves `open` → `generating` → `drafting` → (`generating` → `drafting` for rounds 2 and 3) → `complete`. `closed` is reached when the last member leaves an open lobby or cleanup closes an abandoned one.

## Flows

**Sign-in.** Convex Auth with Google. On first sign-in the player picks a username. `useUser` returns a user only once a username exists, and `RequireAuth` shows the username form until then.

**Lobby.** Opening a lobby URL calls `join`, which is idempotent: an existing member gets their seat back. Membership ends only when the member leaves, the host removes them, or the lobby closes. Presence is a heartbeat every 20 seconds while the tab is visible; a member unseen for 60 seconds is shown as away and nothing else changes.

**Draft.**

1. `startDraft` requires two or more members, all ready. It freezes `participantIds` in seat order and schedules setting generation.
2. `generation.createSetting` sends the worldbuilding messages to the model, saves the setting, and deals round 1: one pack per participant, each with a passing order.
3. `generation.createPack` runs once per pack, in parallel. It asks for twelve cards, generates art for each, and saves them. When the last pack of the round is saved, each is topped up to fifteen from the setting's card pool and the lobby becomes `drafting`.
4. `picks.current` gives each player only the pack at the front of their queue. `picks.pick` marks the card, passes the pack, and adds the card to the player's deck in one transaction. The pick that empties the round deals the next one, or completes the draft after round 3.
5. A failed generation step retries twice with backoff. After the third failure the lobby shows the error and the host can retry.

**Decks.** A deck is created by the first pick of a draft. The deckbuilder moves cards between mainboard and sideboard and adds basic lands.

**Play.** Unchanged: the game document in Firestore holds a copy of each player's deck split into zones, and every action rewrites that player's part of it.

## Trust boundaries and known gaps

- **Convex functions are the boundary.** Every mutation checks the caller and their membership or ownership. Page guards in the browser are for navigation only.
- **Games are unprotected.** The play table writes to Firestore from the browser with no Firebase sign-in, so it depends on the Firestore rules being open, and each client holds the opponent's whole deck. Fixing this is step 3 of the roadmap.
- **A draft cannot be left.** A participant who stops picking holds up the packs in their queue. Handling that is the rest of roadmap step 2.
- **Test sign-in exists in the code** and is enabled only by `AUTH_TEST_LOGIN` on the deployment. It must never be set in production.
- **The model and prompts are the 2024 originals** (`gpt-4o`), moved without change.
