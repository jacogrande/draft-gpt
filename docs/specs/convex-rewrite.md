# Convex rewrite: auth, lobbies, and the draft server

Status: implemented on branch `convex-rewrite`, not yet deployed (see section 12)
Date: 2026-10-08
Builds on: `draft-lobby-refactor.md` (the analysis in its sections 1 to 3 still stands; this document replaces its section 5)

## Summary

Move sign-in, lobbies, and everything the Remix server does today into Convex. Sign-in becomes Google through Convex Auth. The Remix server then has nothing left to do, so the app becomes a static single-page build that talks only to Convex. Games stay on Firestore until step 3 of the roadmap.

Three consequences follow from that and are worth knowing before reading on:

- **Draft generation moves to the server.** Once the API routes are gone, a browser cannot drive pack generation, so this rewrite necessarily takes on the mechanical half of roadmap step 2. Generation keeps running when every tab is closed.
- **Everyone gets a new account.** Firebase Auth goes away. Existing users sign in with Google and start with no decks unless we import them (open decision 1).
- **Server-side route protection goes away.** Convex Auth is client-side for anything that is not Next.js. Pages are guarded in the browser, and the real protection is that every Convex function checks the caller.

## 1. Scope

| Area | Today | After |
|---|---|---|
| Sign-in | Firebase email link, session cookie | Convex Auth with Google |
| Users | Firestore `users/{uid}` | Convex `users` |
| Lobbies, ready state, worldbuilding chat | Firestore, written by clients | Convex mutations |
| Presence | Disabled heartbeat | Convex presence component, display only |
| Setting and pack generation | Remix API routes, driven by one browser | Convex actions, scheduled by the server |
| Card art | getimg.ai to Firebase Storage | getimg.ai to Convex file storage |
| Picking and round changes | Three client writes and a client race | One Convex mutation |
| Decks | Firestore `users/{uid}/decks` | Convex `decks` |
| Remix server (`app/.server`, `api.*` routes, loaders) | Required | Deleted; static SPA build |
| Games | Firestore | **Unchanged**, keyed by the new user ids |

Not in scope: how absent players are handled mid-draft, model and prompt upgrades, and generation quality (the rest of step 2); the game table (steps 3 and 4); deckbuilder improvements (step 5). The deckbuilder keeps its current UI and only changes where it reads and writes.

## 2. Research: Convex Auth

From the Convex Auth docs, read 2026-10-08.

- **It is a library that runs inside your Convex backend,** so there is no separate auth service. It supports OAuth (Google, GitHub, Apple), magic links and OTPs, and passwords.
- **It is in beta.** The docs say so on the front page.
- **Supported targets are a React SPA served from a CDN, Next.js, and React Native.** There is no Remix or React Router server integration. I found no documented way to check a Convex Auth session inside a Remix loader.
- **No UI is provided.** We write the sign-in button.
- **Setup** is `npx @convex-dev/auth` after installing `@convex-dev/auth` and `@auth/core`. It adds `convex/auth.ts`, `convex/auth.config.ts`, and `convex/http.ts`, and needs `SITE_URL`, `JWT_PRIVATE_KEY`, and `JWKS` set on the deployment. `authTables` is spread into the schema.
- **Google** needs an OAuth client in Google Cloud whose redirect URI is `https://<deployment>.convex.site/api/auth/callback/google`, plus `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` on the deployment. The docs recommend separate OAuth clients for development and production.
- **The client** wraps the app in `ConvexAuthProvider` and calls `signIn("google")` from `useAuthActions()`. `Authenticated`, `Unauthenticated`, and `AuthLoading` components gate UI.
- **The server** gets the caller with `getAuthUserId(ctx)`, which returns a `users` id or null.
- **The `users` table** stores `name`, `email`, and `image` from the provider by default and can be given extra optional fields.

What this means for us:

- **The app should become an SPA.** With auth client-side and all data in Convex, Remix loaders and actions have no job. Remix 2 has an SPA mode (`ssr: false` in the Vite plugin) that keeps the route files and produces static output. That is also the configuration Convex Auth explicitly supports.
- **Usernames need a small step of their own.** The app shows a chosen username everywhere. Google gives a real name. On first sign-in we ask for a username, pre-filled from the Google name.

Not verified: how Convex Auth links a second provider to an existing account, and session lifetime defaults. Neither affects a Google-only setup.

## 3. Architecture after the rewrite

```
Browser (static SPA)
  routes + components
  hooks  ── useQuery / useMutation ──▶  Convex
  model/game ── Firestore SDK ─────▶  Firestore (games only, until step 3)

Convex
  auth (Google)            queries: per-viewer reads
  mutations: every state change, each one a transaction
  actions: OpenAI, getimg.ai   ──▶ file storage (card art)
  scheduler + crons: generation, retries, cleanup
```

### Code layout

The backend is organised by domain, not by kind of file. Each domain folder holds its tables, its pure rules, its Convex functions, and its tests.

| Path | Domain | Pure core | Shell (Convex functions) |
|---|---|---|---|
| `convex/identity/` | Who a player is | `username.ts` | `users.ts`, `viewer.ts` |
| `convex/lobby/` | Rooms, seats, readiness, chat, presence | `roster.ts` | `lobbies.ts`, `departure.ts`, `messages.ts`, `presence.ts`, `cleanup.ts`, `access.ts` |
| `convex/draft/` | Settings, packs, picks, rounds, generation | `seating.ts`, `passing.ts`, `parsing.ts`, `retry.ts` | `start.ts`, `picks.ts`, `rounds.ts`, `generated.ts`, `failures.ts`, `generation.ts`, `settings.ts`; gateways `openai.ts`, `images.ts` |
| `convex/deck/` | A player's cards after a draft | `zones.ts` | `decks.ts`, `drafted.ts` |
| `convex/card.ts` | The card face shared by draft and deck | | |
| `convex/schema.ts` | Composes each domain's `tables.ts` | | |
| `tests/` | `backend.ts` (test harness), `outsideWorld.ts` and `cannedGeneration.ts` (fake AI services) | | |
| `app/` | The client, as before: `routes/`, `components/`, `hooks/`, `util/`, and `model/game/` for the Firestore game table | | |

## 4. Data model

| Table | Fields | Indexes |
|---|---|---|
| `users` | Convex Auth defaults (`name`, `email`, `image`, ...) plus `username?` | `email` |
| `lobbies` | `name`, `hostId`, `status`, `round` (0 to 3), `participantIds?`, `settingId?`, `generationError?`, `createdAt`, `closedAt?` | `by_status` |
| `lobbyMembers` | `lobbyId`, `userId`, `seat`, `ready`, `joinedAt` | `by_lobby`, `by_lobby_user`, `by_user` |
| `lobbyMessages` | `lobbyId`, `userId`, `text`, `createdAt` | `by_lobby` |
| `settings` | `lobbyId`, `icon`, and the generated fields (`name`, `thesis`, `description`, `legendaryComponents`, `newMechanic`, `setArchetypes`) | `by_lobby` |
| `packs` | `lobbyId`, `round`, `order` (user ids), `position`, `holderId` or null, `cardCount` | `by_lobby_round`, `by_lobby_holder` |
| `cards` | `settingId`, `lobbyId`, `packId?`, the generated card fields, `imageId?`, `image_url?`, `pickedBy?` | `by_pack`, `by_setting` |
| `decks` | `userId`, `lobbyId`, `name`, `cards`, `sideboard`, `createdAt` | `by_user`, `by_user_lobby` |

Lobby `status` is one of `open`, `generating`, `drafting`, `complete`, `closed`. It replaces the `draftStarted` and `creatingPacks` booleans, which could disagree.

Decks keep whole card objects embedded in `cards` and `sideboard`, exactly as today. That is deliberate: the deckbuilder and the game both expect that shape, and a 45-card deck is far below Convex's 1 MiB document limit. Normalising it is a step 5 question.

## 5. Functions

Every public function starts by resolving the caller with `getAuthUserId` and rejects if there is none. Functions that take a lobby also check membership.

### Users

| Function | Behaviour |
|---|---|
| `users.me` | The caller's user, or null |
| `users.setUsername` | Sets the caller's username (1 to 24 characters) |

### Lobbies

As specified in `draft-lobby-refactor.md` section 5: `create`, `join` (idempotent, keeps the seat, enforces the cap of 8), `leave`, `removeMember` (host, before the draft), `setReady`, `postMessage`, `get`, `listOpen`. Nothing removes a member automatically.

`lobbies.startDraft` changes: it requires at least 2 members, all ready; sets `participantIds` in seat order and `status` to `generating`; and schedules setting generation. There is no initiator any more.

### Draft

| Function | Kind | Behaviour |
|---|---|---|
| `generation.createSetting` | internal action | Sends the worldbuilding messages to OpenAI, saves the setting, schedules round 1 |
| `generation.createPack` | internal action | One per participant per round. Asks OpenAI for 12 cards, generates art for each, stores the images, saves the pack and its cards |
| `draft.finishRound` | internal mutation | Runs when the last pack of a round is saved. Tops each pack up to 15 from the setting's card pool and sets `status` to `drafting` |
| `draft.currentPack` | query | The unpicked cards of the pack the caller holds with the lowest `position`, and nothing else |
| `draft.packCounts` | query | How many packs each participant is holding, for the sidebar |
| `draft.pick` | mutation | Checks the card is in the caller's current pack and unpicked; marks it; advances the pack; appends the card to the caller's deck. If that pick empties the round, starts generating the next one, or sets `complete` after round 3 |
| `draft.retryGeneration` | mutation | Host only. Clears `generationError` and reschedules whatever failed |

Changes in behaviour that players will notice:

- **Generation survives closed tabs.** It is scheduled work on the server.
- **A failed generation is visible and retryable.** After automatic retries are exhausted the lobby shows an error and the host gets a Retry button, instead of "Creating Packs" forever.
- **Rounds advance on their own.** The "Start Round N" button, and the race behind it, go away.
- **Queued packs are hidden by the server.** Today every client downloads every pack and the UI chooses what to show.
- **A pick is all or nothing.** Today it is three writes that can partly fail.

Retries and rate limiting: the current code spaces requests with `sleep` calls. Convex's Workpool component offers a concurrency cap, retries with backoff, and a completion callback, which fits `createPack`. I have not read its API in detail; if it does not fit, the fallback is a retry counter on the pack and `ctx.scheduler.runAfter`.

Limits checked: actions may run 10 minutes, and one pack is one LLM call plus twelve image calls.

The OpenAI and getimg.ai calls are moved as they are, including `gpt-4o`. Upgrading models at the same time would make it impossible to tell a porting bug from a model change, so that belongs to step 2.

### Decks

| Function | Behaviour |
|---|---|
| `decks.list`, `decks.get` | The caller's decks |
| `decks.moveToSideboard`, `moveToMainboard`, `addBasics` | Ports of the existing three operations, now transactional |

### Scheduled

`closeAbandoned` (daily): closes `open` lobbies older than 24 hours and `generating` or `drafting` lobbies older than 7 days.

## 6. Client changes

- **Provider.** `root.tsx` wraps the app in `ConvexAuthProvider` with a client built from `VITE_CONVEX_URL`.
- **Sign-in page.** `/join` becomes a single "Continue with Google" button, followed by the username prompt on first sign-in. `finish-join.tsx` is deleted.
- **`useUser` keeps its shape.** It returns `{ user, loading }` where `user` has `uid`, `username`, and `email`, backed by `users.me`, with `uid` set to the Convex user id. There are 63 uses of `user.uid` and friends across the app, including all of the game code, and none of them need to change.
- **Route guards.** The `verifySession` loaders are replaced by a `RequireAuth` wrapper that redirects to `/join`.
- **Lobby and draft hooks** (`useLobby`, `useLobbyList`, `useLobbyCreator`, `usePacks`, `useSetting`) are rewritten over `useQuery`. Their zustand stores can mostly go, since Convex queries are already shared and reactive. `useHeartbeat` and `useIdToken` are deleted.
- **Deck hooks and the game's `DeckPicker`** read from Convex.
- **Games** keep using `app/model/game/` and the Firestore client SDK, with no Firebase sign-in. This works only while the Firestore rules allow unauthenticated access; the notes say they are open, but I have not seen the deployed rules. See risks.

### Environment

| Where | Variables |
|---|---|
| Convex deployment | `SITE_URL`, `JWT_PRIVATE_KEY`, `JWKS`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `OPENAI_API_KEY`, `GETIMG_API_KEY` |
| Client build | `VITE_CONVEX_URL` |
| Retired | `SERVICE_KEY`, `SESSION_SECRET` |

Dependencies removed: `firebase-admin`, `cookie`, `@remix-run/serve`, `openai` from the app bundle (it moves to Convex). `firebase` stays until step 3.

## 7. Acceptance

Checked with two or three browser profiles signed in to different Google accounts.

**Auth**
1. A new visitor clicks Continue with Google, picks a username, and lands on the home page. Refreshing keeps them signed in. Sign out returns them to `/join`.
2. Opening `/lobbies`, `/decks`, or a lobby URL while signed out redirects to `/join`.
3. Calling a lobby mutation without a session fails on the server.

**Lobby** (from the earlier spec)
4. B closes the tab in an open lobby and returns to the same seat and ready state. A sees B as away in between.
5. Refreshing never changes the roster.
6. Leave removes a member; the host leaving passes host on; the last member leaving closes the lobby.
7. A ninth player is refused by the server.
8. An untouched open lobby is still listed after 10 minutes.
9. The host can remove an away, unready member so the others can start.

**Draft**
10. Two players complete a three-round draft and each ends with a 45-card deck.
11. Every tab is closed immediately after Start. On return, the setting and round 1 packs exist.
12. During a round B closes the tab, A keeps picking, and B returns to find their queued packs waiting in order.
13. C opens the lobby URL mid-draft and is refused. Orders are unchanged.
14. With the OpenAI key deliberately broken, the lobby shows a generation error, and after the key is restored the host's Retry completes the round.
15. A player never receives cards from a pack they are not currently picking from (checked in the network inspector).

**Decks and games**
16. The drafted deck opens in the deckbuilder; moving cards and adding lands persists across refresh.
17. Two players start a game with those decks and can draw, move, and tap as before.

**Build**
18. `bun run build` produces a static site with no server bundle, and `bun test` passes.

## 8. Implementation plan

The Remix API routes cannot coexist with SPA mode, and Firebase sign-in cannot coexist with Convex user ids, so this is done on a `convex-rewrite` branch and merged when phase 5 passes. `main` stays deployable throughout. Each phase is one or more commits with its own check.

**Phase 1: Convex and sign-in.** Create the Convex project and the development Google OAuth client. Install Convex Auth, add the provider, the sign-in page, the username prompt, `users.me`, `users.setUsername`, the `useUser` replacement, and `RequireAuth`. Remove Firebase Auth and the session cookie. *Done when acceptance 1 to 3 pass.*

**Phase 2: lobbies.** Schema, `convex/lib` policies with tests, lobby functions, presence, cleanup cron, and the lobby UI including Leave, remove-member, and the away state. *Done when acceptance 4 to 9 pass.*

**Phase 3: draft server.** Move the prompts. Write the generation actions, `finishRound`, `pick`, the pack queries, and retry. Rewrite `usePacks`, `useSetting`, and the three draft screens. *Done when acceptance 10 to 15 pass.*

**Phase 4: decks and the game bridge.** Deck functions, deck hooks, and `DeckPicker`. Confirm games work with Convex user ids. *Done when acceptance 16 and 17 pass.*

**Phase 5: remove the server.** Delete `app/.server`, the `api.*` routes, the loaders, and the unused dependencies. Set `ssr: false`. Create the production Convex deployment and production Google OAuth client, set the environment, and deploy the static build. *Done when acceptance 18 passes and sign-in works on the production URL.*

**Phase 6: docs.** Rewrite `docs/architecture.md` and `docs/tech-stack.md`, replace the model-layer and `.server` rules in `AGENTS.md` with their Convex equivalents, fix the README commands, and record the backend and auth choices as decisions.

Phases 2 and 3 are the bulk of the work. Phase 3 is the riskiest because it is the only one with third-party calls and scheduled work.

## 9. Risks

- **Convex Auth is beta.** The exposure is limited to one provider and the simplest flow. If it proves unreliable, Convex also accepts third-party identity providers through `auth.config.ts`, and only `convex/auth.ts`, the provider, and the sign-in page would change.
- **Games depend on open Firestore rules.** With Firebase Auth removed, game documents are written by unauthenticated clients. That is no worse than today if the rules are already open, but it must be confirmed in the Firebase console before phase 1, and it makes step 3 more pressing.
- **Google OAuth consent screen.** An app left in Google's testing mode only admits listed test users. It needs to be published for friends to sign in freely. I did not check the current rules for this.
- **Long-lived branch.** The rewrite cannot ship in slices. The mitigation is the per-phase checks and keeping `main` untouched.
- **Workpool and the presence component** are described here from their overview pages. Both have simple fallbacks (a retry counter; a `lastSeenAt` field).
- **Cost.** Scheduled generation makes retries automatic, and each pack is a paid LLM call and twelve paid images. Retries must be capped; the plan is three attempts per pack.

## 10. Open decisions

1. **Existing accounts and decks.** Start clean, or write a one-off import that matches Firebase users to Google accounts by email and copies their decks? Starting clean is far simpler; the import is only worth it if people care about old decks.
2. **Email sign-in as well as Google?** Convex Auth supports magic links, but they need an email-sending service. The proposal is Google only.
3. **Hosting for the static build.** Nothing in the repo says where the site is hosted today. Any static host works, with a rewrite of all paths to `index.html`.
4. **Move games now instead of bridging?** Porting the game document to Convex as-is would remove Firebase entirely in this rewrite, at the cost of about 640 lines of game model code that step 3 will redesign anyway. The proposal bridges.
5. **Who can start the draft, and whether a player can leave mid-draft.** Carried over from the earlier spec: the proposal is any member once all are ready, and no leaving once the draft has started.

## 11. Engineering rules

These apply to this rewrite and to the steps that follow it.

**Functional core, imperative shell.** Every decision is a pure function that takes plain data and returns plain data: who gets which seat, whether a draft may start, where a pack goes next, what a model's reply means. Those live in the core files listed in section 3 and never touch `ctx`, the clock, or the network. Convex functions are the shell: load, call the core, write. A shell function that contains an `if` about the rules of the game is a sign that logic belongs in the core.

**Domain-driven layout.** Code is grouped by the four domains in section 3, and each uses the words players use: lobby, member, seat, host, setting, pack, pick, round, deck. A domain owns its tables. One domain reaches another through an exported function (the draft adds a picked card by calling `deck/drafted.ts`), not by writing to its tables. `convex/card.ts` is the only shared type.

**Small files.** One concept per file. If a file needs a comment to separate its sections, split it.

**Almost no comments.** Names and small functions carry the meaning. A comment is justified only for a fact the code cannot express, such as a constraint imposed by an outside system.

**Robust means the server decides.** Every mutation resolves the caller and checks membership or ownership before anything else, and rejects with a typed code from `convex/errors.ts`. Queries never throw for access: a caller who may not see something gets `null` or an empty list. That keeps a page from crashing in the moment between losing access and navigating away.

**Model output is untrusted.** Replies are parsed by `draft/parsing.ts` into the stored shape, with missing fields defaulted and unusable items dropped, before anything is saved.

### Testing

| Kind | Where | Use it for |
|---|---|---|
| Integration | `convex/<domain>/*.test.ts`, run with `convex-test` | Nearly everything. Each test drives the public functions as signed-in players and asserts on what those players can then read. OpenAI and getimg.ai are replaced by `tests/outsideWorld.ts`. |
| Unit | Beside the core file | Only logic where a silent regression would be costly and hard to spot through the public API. Today that is pack passing order and direction (`draft/seating.test.ts`). |
| Browser | `.claude/skills/browser-testing/SKILL.md` | What players see across several sessions at once. Run after any change to a screen or a flow. |

Tests are named for the behaviour a player would describe, and build their world through the same functions the app uses (`openLobby`, `readyEveryone`), not by writing rows directly, except where a state cannot be reached cheaply.

Commands: `bun run test`, `bun run typecheck`, `bun run lint`.

## 12. Implementation status

Built on the `convex-rewrite` branch. Nothing is committed or deployed.

### Verified

- `bun run test`: 39 tests pass (26 integration, 3 unit, 10 existing utility tests).
- `bun run typecheck` is clean. `bun run lint` reports one error, which predates this work (`autoFocus` in the game's `Counter.tsx`).
- `bun run build` produces a static site with no server bundle (acceptance 18).
- In a browser with two test users on the local stack: sign-in, username, and sign-out (1, with the test provider standing in for Google); signed-out redirects (2); away and return to the same seat and ready state (4); generation completing with every tab closed (11); queued packs hidden and passed in order (12); a full three-round draft ending in a 45-card deck (10); the deck editor and Add Lands persisting across reload (16).
- By integration test only: 3, 5 to 9, 13 to 15.

### Not verified

- **Google sign-in.** It needs an OAuth client and a person. The code path is the documented Convex Auth one.
- **Games (acceptance 17).** The game table writes to the production Firestore project, so I did not create test games in it. The deck picker typechecks against the new deck shape and passes the owner id the game expects.
- **Real generation.** No API keys were available; every draft here used the fake services.

### Where the build differs from the proposal above

- **Presence is a small table (`lobbyPresence`), not the presence component.** It is simpler, has no dependency, and runs under `convex-test`. Heartbeats do not touch the roster query.
- **Retries are an attempt counter and the scheduler, not Workpool.** Three attempts with backoff, then the lobby shows the error.
- **OpenAI is called with `fetch`, not the SDK.** The request bodies are unchanged. This removes a dependency and lets tests and the local stack replace the service by URL (`OPENAI_BASE_URL`, `GETIMG_BASE_URL`).
- **Art for one pack is generated one card at a time.** The old code spaced requests 200 ms apart to avoid rate limits; sequential calls are gentler and need no timers. Packs still generate in parallel.
- **Round 2 passes in the opposite direction.** The notes and product vision say rounds alternate, but the old code passed the same way every round. This follows the stated intent.
- **`settings.icon` was dropped.** Nothing displayed it.
- **Tests run on vitest, not `bun test`,** because `convex-test` requires it. Vitest is pinned to 2.x because Remix 2 needs Vite 5.
- **A bug in Add Lands was fixed on the way through.** With 17 or more lands already present, `calculateManaBase` returned the whole deck, which the old code then appended to itself.

### Known limitation in the tests

Under `convex-test`, packs generated concurrently can fail their first attempt with "Write outside of transaction" from file storage, then succeed on retry. This is the test harness, not Convex, but it means the tests cannot assert an exact number of generation calls.

### Left to do before this can replace production

Done on 2026-10-08: the Convex production deployment exists with its auth keys and `SITE_URL`, and the static site is live on Firebase Hosting (see `docs/tech-stack.md`, Deployments). The deployed Firestore rules were read and allow all reads and writes unconditionally, so the game table will work without Firebase sign-in; that also leaves the whole Firestore database open to anyone.

Still to do:

1. Create the Google OAuth client, set `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` on production, and confirm sign-in by hand.
2. Set `OPENAI_API_KEY` and `GETIMG_API_KEY` on production and run one real draft.
3. Point `draftgpt.hasslebad.com` at Firebase Hosting, then change `SITE_URL` to match.
4. Decide whether to import old decks (open decision 1).

## Sources

Read directly:

- Convex Auth: [overview](https://labs.convex.dev/auth), [setup](https://labs.convex.dev/auth/setup), [manual setup](https://labs.convex.dev/auth/setup/manual), [Google](https://labs.convex.dev/auth/config/oauth/google), [OAuth](https://labs.convex.dev/auth/config/oauth), [authorization](https://labs.convex.dev/auth/authz), [custom schema](https://labs.convex.dev/auth/setup/schema)
- This repo's server, draft, deck, and auth code

From search summaries only:

- Convex [limits](https://docs.convex.dev/production/state/limits) (10-minute actions, 1 MiB documents)
- Remix [SPA mode](https://remix.run/docs/future/spa-mode)
- Convex Auth's lack of Remix or React Router server support, from the [Convex auth docs](https://docs.convex.dev/auth/convex-auth) and community threads
- Convex [Workflow and Workpool](https://docs.convex.dev/agents/workflows)
