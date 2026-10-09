# Draft lobby refactor

Status: direction decided, proposal superseded
Date: 2026-10-08
Covers: step 1 of `refactor-roadmap.md`

> Decision (2026-10-08): direction B, Convex. Sections 1 to 4 remain the analysis behind that choice. Section 5's proposal, including the Firebase Auth bridge and the seam with the Firestore draft, is replaced by `convex-rewrite.md`, which also moves auth and the draft server to Convex.

## Summary

The lobby problems come from one design choice: a single array, `activeUsers`, is used as the roster, the presence indicator, the draft seating order, and the ready-count denominator. Anything that guesses wrong about presence therefore removes a player from the draft. The fix is the same whichever backend we use: make membership durable, make presence a display-only hint, and freeze the list of drafters when the draft starts.

On the backend question, I recommend moving lobbies to Convex, keeping Firebase Auth, and borrowing Parlor's data model without depending on Parlor itself. Fixing the lobby in place on Firestore is a legitimate cheaper option and would satisfy step 1 on its own; the case for Convex rests mostly on steps 2 and 3. That choice is yours and is the first open decision below.

## 1. What is wrong today

All of this is from reading the code, not from reproducing it in a browser.

### One field, four jobs

`lobby.activeUsers` is read as:

- the roster shown in the sidebar (`LobbyDetails.tsx`)
- the player count on the lobby list (`LobbyLink.tsx`)
- the denominator for "N / M players are ready" (`StartingScreen.tsx`)
- the seating order for every round of packs (`getLobbyUserIdList`, called from `runPackDistributionManager` in `model/draft.ts`)

It is written by three mechanisms that all try to infer presence.

### Closing the tab removes you from the draft

`lobbies.$lobbyId/route.tsx` registers a `beforeunload` listener that posts to `/api/leaveLobby`, which removes the user from `activeUsers`. A refresh fires it too. The player is added back when the page loads again, but:

- If a round starts while they are away, `runPackDistributionManager` reads `activeUsers` at that moment and they get no pack order for that round.
- Their `readyMap` entry is never removed (there is a `TODO` for it), so the ready count can equal the player count while someone is missing.

This is the direct cause of "close the tab and rejoin" not working.

### The heartbeat kicked people who had just joined

The original design (commit `da4d755`, September 2024) had each client pulse every 20 to 30 seconds and every client run a cleanup every 30 seconds. Three things made it unreliable:

- **No first pulse.** The pulse is a `setInterval`, so a new player has no `activityMap` entry for their first 30 seconds. `cleanupLobbyUsers` keeps only users who have an entry, so any other client's cleanup in that window removed the newcomer.
- **No re-join.** `joinLobby` runs once when the page mounts. A kicked player still sees the lobby but is no longer in it, and gets no packs.
- **Every client is the janitor.** Cleanup compares against each client's own clock and does a read followed by a write of the whole array, so it can also overwrite a join that landed in between.

The December 2024 response was to set the pulse interval to about 8 hours and comment out the cleanup write. That stopped the kicking and introduced a different bug: the lobby list only shows lobbies whose `lastActive` is under 3 minutes old, and `lastActive` is now only set at creation, so **a lobby disappears from the list 3 minutes after it is created**.

### Smaller problems in the same area

- **No frozen roster.** Someone who opens the lobby URL mid-draft is added to `activeUsers` and would be dealt into the next round.
- **The 8-player cap is cosmetic.** The list disables the link at 8; `joinLobby` does not check.
- **Every lobby write comes from the browser** with no security rules behind it.
- **`useSetting` throws on an empty result** (`snapshot.docs[0].exists()` when there are no docs). This belongs to step 2 but lives in the lobby route.

## 2. Requirements

From the roadmap, plus what the analysis above implies.

1. A signed-in member can close the tab, lose their connection, or refresh, at any point before or during the draft, and return to the same seat with their ready state, packs, and picks intact.
2. Nothing removes a member automatically. Membership ends when the member leaves on purpose, the host removes them before the draft, or the lobby closes.
3. Presence is shown ("away") but never used to decide who is in the draft.
4. The set of drafters is fixed when the draft starts. Later arrivals do not change it.
5. The player cap and all roster changes are enforced on the server.
6. The lobby list does not depend on heartbeats.
7. Abandoned lobbies get cleaned up by the server, not by clients.

Out of scope: pack generation, picking, and round transitions (step 2), and game lobbies (step 3). Step 1 must leave the existing draft working.

## 3. Research

### Parlor

[misty-step/parlor](https://github.com/misty-step/parlor), read at commit `2e1286b` (2026-10-04). It is a TypeScript toolkit for party games on Convex: rooms, guest credentials, presence, host transfer, and matches.

Its model is the right one for us, and it is the clearest statement I found of the fix described above. It separates three things we currently merge:

| Parlor concept | Meaning | Our equivalent today |
|---|---|---|
| Player | A durable identity | `users/{uid}` |
| Room member | A seat in a room, with `lastSeenAt` | `activeUsers` entry (conflated with presence) |
| Match participant | A frozen `{match, player, seat}` record created when a match starts | Does not exist |

Other design points worth copying:

- **Presence is derived from a timestamp, never stored as a state.** Present under 15 s, away to 45 s, stale after. "Away/stale members still occupy seats until they leave; there is no automatic eviction."
- **Rejoining an existing membership keeps the seat.** Refresh is explicitly not a leave.
- **Late joiners are queued for the next match** and do not alter frozen participants.
- **Host transfer happens inside heartbeat and leave mutations,** to the lowest seat that is not stale, so there is no separate host job.
- **Starting a match and writing its initial game state are one transaction.**
- **Abandonment is a server cron,** not a client task.

Reasons not to depend on it:

- **It is a month old and pre-1.0.** Created 2026-09-06, one star, no forks, version 0.1.0.
- **It is not on npm.** The supported install is a vendored git checkout inside a pnpm 11 workspace, with TypeScript 7 and React 19 as requirements. We are on Bun, TypeScript 5, and React 18.
- **It is built for a different product.** "Accountless, phone-first": guest tokens, QR codes, four-character room codes, wake lock, audio. We have accounts and a desktop UI. Its guest-auth package, which is a large share of the complexity, is irrelevant to us.
- **Some defaults cut against our requirements.** `leaveRoom` deletes the membership, matches have a 30-minute hard deadline by default, and a match is abandoned when every participant has been away 10 minutes. A draft with LLM generation and a dinner break would trip both. I did not check how configurable these are.
- **It is about 2,700 lines** across the Convex integration and core policies. The part we need is perhaps a tenth of that.

Conclusion: adopt the model, write our own small version.

### Is Firebase still the right system?

Firestore is not the cause of the lobby bugs. The causes are in section 1 and can be fixed without leaving it. What Firestore lacks is anything that runs on the server:

- **Presence.** Firestore has none. Firebase's own guide says to use Realtime Database's `onDisconnect` and mirror it into Firestore with Cloud Functions.
- **Server-side logic.** Every multi-document change is either a client transaction or a round trip through a Remix action using the admin SDK.
- **Scheduled work.** Nothing can close an abandoned lobby or recover a stuck `creatingPacks` flag without Cloud Functions, which the project has avoided.
- **Authorization.** Security rules are a separate language, and none exist yet.

These matter more for the later steps than for this one. Step 2 asks that "the server shouldn't fail, players shouldn't get stuck" while draft orchestration currently runs in one player's browser. Step 3 asks that game state be identical for both players while every game action is a read-modify-write of a whole deck with no transaction.

### Convex

- **Mutations are server-side transactions written in TypeScript.** Join, leave, ready, and start become functions that cannot interleave, with no rules language.
- **Queries are reactive and run on the server,** so each viewer can be sent only what they may see. This is what hidden hands would need if the product vision ever changes.
- **Scheduler, crons, and actions.** Abandoned-lobby cleanup is a cron. Pack generation in step 2 can be a server action that keeps running when the browser closes; Convex also has Workpool and Workflow components for retries.
- **Presence component.** `@convex-dev/presence` provides a `usePresence` hook that heartbeats and disconnects on tab close, and is built so that heartbeats do not re-run room queries. Its docs do not give intervals or say how tab close is detected.
- **Firebase Auth can stay.** Convex accepts third-party identity through an OIDC or custom-JWT provider in `convex/auth.config.ts`, checking issuer, audience, and signature against a JWKS URL. Firebase ID tokens are RS256 JWTs with the required claims. The Convex docs do not mention Firebase by name, so **this is the main thing to prove before committing** (phase 0).
- **Cost.** The free plan is reported as 1M function calls a month and 0.5 GB of database. Eight players heartbeating every 15 seconds is about 2,000 calls an hour per lobby. I took these figures from third-party pricing pages, not Convex's own.
- **Framework.** It is a plain React client, so Remix 2 is fine.

Costs of moving: a second backend running alongside Firestore until steps 2 to 5 finish, a new vendor and deploy target, and rewriting `app/model/lobby.ts` and the lobby hooks instead of repairing them.

### Other backends considered

- **Cloudflare Durable Objects (or PartyServer).** One object per lobby holding WebSockets gives true presence with no heartbeats and no races, since each object is single-threaded. But it is the most to build: persistence, the lobby list, and token verification are all ours to write, and `firebase-admin` does not run on Workers. Best technology for a room; too much plumbing for one person who also needs decks and games stored.
- **Supabase.** Postgres would suit decks and cards well, and Realtime has presence. It would mean row-level security policies and most likely moving auth, with no advantage over Convex for server-side orchestration.

## 4. Directions

### A. Repair in place on Firestore

Keep everything, restructure the lobby.

- Add `lobbies/{id}/members/{uid}` (seat, ready, joinedAt) as the durable roster. Remove the `beforeunload` leave and client cleanup.
- Move join, leave, ready, and start into Remix actions using admin-SDK transactions. Write security rules that make lobby documents read-only to clients.
- Freeze `participants` on the lobby document at start and have the draft read that.
- Presence from Realtime Database `onDisconnect`, read directly by clients. Because presence would be display-only, nothing needs to mirror it into Firestore, so no Cloud Functions.
- Stale lobbies: filter the list by `status` and age; no server cleanup without adding a scheduler.

**For:** smallest change, no new vendor, no seam between backends, draft and game code untouched. Meets every step 1 requirement except server-side cleanup.

**Against:** leaves the orchestration and consistency problems of steps 2 and 3 exactly where they are, and they will raise the same backend question again with more code written against Firestore. Adds a third Firebase product for presence. Security rules still have to be written and tested.

### B. Convex, our own tables (recommended)

Lobby state, membership, chat, and presence move to Convex. Firebase Auth stays. Draft and game data stay in Firestore until their own steps.

**For:** roster changes become server transactions; presence and cleanup have first-class tools; it sets up server-driven drafting for step 2 and transactional game actions for step 3. Lobbies are short-lived, so step 1 needs **no data migration**, which makes it the cheapest possible place to try the new backend.

**Against:** two backends for the duration of the refactor, with a seam at draft start (section 5). New concepts to learn. Depends on the Firebase-token integration working.

### C. Convex with Parlor as a dependency

**For:** the lobby model arrives finished and tested.

**Against:** everything under "reasons not to depend on it" above, most of all the toolchain it requires and its age.

### D. Durable Objects

**For:** the best presence and concurrency model.

**Against:** the most code and a hosting move, for a benefit (instant disconnect detection) that requirement 3 makes unimportant.

### Recommendation

B. The deciding argument is not the lobby, which A fixes adequately, but that steps 2 and 3 need a server that can own state transitions, and the lobby is the lowest-risk place to find out whether Convex is that server. If phase 0 fails or the seam looks worse in practice than on paper, fall back to A; the data model in section 5 carries over unchanged.

## 5. Proposal

### Data model

Convex tables. Names follow the code's existing vocabulary.

| Table | Fields | Indexes |
|---|---|---|
| `users` | `firebaseUid`, `username` | `by_firebaseUid` |
| `lobbies` | `name`, `hostId`, `status` (`open`, `drafting`, `complete`, `closed`), `participantIds` (set at start), `createdAt`, `closedAt?` | `by_status` |
| `lobbyMembers` | `lobbyId`, `userId`, `seat`, `ready`, `joinedAt` | `by_lobby`, `by_lobby_user`, `by_user` |
| `lobbyMessages` | `lobbyId`, `userId`, `text`, `createdAt` | `by_lobby` |

Presence is not in these tables. It comes from the presence component, keyed by lobby and user, and is only ever read by the UI.

### Functions

| Function | Behaviour |
|---|---|
| `lobbies.create` | Creates the lobby with the caller as host in seat 0. |
| `lobbies.join` | Idempotent. Existing member: returns their seat. New member: lowest free seat, if `status` is `open` and fewer than 8 members. Otherwise returns a typed refusal (`full`, `in-progress`, `closed`). |
| `lobbies.leave` | Deletes the caller's membership. Only allowed while `open`. Transfers host to the lowest remaining seat; closes the lobby if nobody is left. |
| `lobbies.removeMember` | Host only, `open` only. Needed because an away player who never readied would otherwise block the start forever. |
| `lobbies.setReady` | Sets the caller's `ready` to true or false. |
| `lobbies.postMessage` | Appends a worldbuilding suggestion. Members only. |
| `lobbies.startDraft` | Requires every member ready and at least 2 members. Sets `status` to `drafting` and `participantIds` to the members in seat order, in one transaction. The first caller gets `{ initiator: true }`; later callers get `false`. |
| `lobbies.get` | Lobby, members with usernames, messages, and the viewer's own membership. Members only once `drafting`. |
| `lobbies.listOpen` | Open lobbies with member counts. |
| cron `closeAbandoned` | Closes `open` lobbies older than 24 hours and `drafting` lobbies older than 7 days. |

Seat allocation, host succession, and the can-start check are pure functions in `app/util/` with `bun test` coverage, called from the mutations.

### Client

- `root.tsx` wraps the app in `ConvexProviderWithAuth`, fed by `auth.currentUser.getIdToken()`.
- `app/model/lobby.ts` and the hooks `useLobby`, `useLobbyList`, `useLobbyCreator` are rewritten over Convex queries and mutations. `useHeartbeat` is replaced by `usePresence`.
- The lobby route calls `join` on mount and nothing on unmount. A visible **Leave lobby** button calls `leave`.
- Away members stay on the roster, dimmed.
- Deleted: the `beforeunload` listener, `api.leaveLobby.tsx`, `leaveLobby` in `.server/lobbyActions.ts`, `useIdToken`, `useHeartbeat`, `sendPulse`, `cleanupLobbyUsers`, and the `activeUsers`, `activityMap`, `readyMap`, `lastActive`, `worldbuildingMessages` fields of the `Lobby` type.

### The seam with the existing draft

Until step 2, packs, settings, and decks stay in Firestore and the draft is still driven by the initiator's browser. The two systems meet in one place:

- `lobbies.startDraft` replaces the Firestore transaction in `startDraft` as the initiator election.
- The initiator then creates a slim Firestore `lobbies/{convexLobbyId}` document holding only the draft's own fields (`draftStarted`, `creatingPacks`, `currentRound`, `setting`) and runs the existing flow. Packs and decks keep hanging off that id.
- `runPackDistributionManager` takes `participantIds` as an argument instead of reading `activeUsers`. This is the change that makes rejoining mid-draft safe.
- `createSetting` receives the messages from Convex instead of reading them off the lobby document.

Step 2 removes this seam by moving the draft itself.

### Acceptance

Each is checked with two or three browser profiles signed in as different users.

1. A and B are in an open lobby and B is ready. B closes the tab. A still sees B, shown as away within a minute, still ready. B opens the URL again and is in the same seat, ready, with no duplicate entry.
2. Refreshing never changes the roster for anyone.
3. During round 1, B closes the tab, waits for A to pick, and returns. B sees the packs they hold. When round 2 starts, B is dealt a pack.
4. C opens the lobby URL after the draft has started and is told the draft is in progress. The roster and pack orders are unchanged.
5. B clicks Leave in an open lobby and disappears from A's roster. When the host leaves, the next seat becomes host. When the last member leaves, the lobby is gone from the list.
6. With 8 members, a ninth user is refused by the server, including by direct URL.
7. A lobby left open and untouched is still listed after 10 minutes.
8. The host can remove an away, unready member, after which the remaining players can start.
9. `bun test` passes, including new tests for seat allocation, host succession, and the can-start check.

### Implementation plan

Each phase is one commit that leaves the app working.

**Phase 0: prove the auth bridge.** Create the Convex project. Add `convex/auth.config.ts` for the Firebase project, the provider in `root.tsx`, and a `whoami` query. Done when a signed-in browser gets its own Firebase uid back from Convex and a signed-out one gets null. If this cannot be made to work, stop and switch to direction A.

**Phase 1: backend.** Schema, pure policy functions with tests, mutations, queries, cron. Done when the functions can be driven from the Convex dashboard through a full create, join, ready, start, leave sequence.

**Phase 2: lobby UI.** Rewrite the model and hooks, update `StartingScreen`, `LobbyDetails`, `UserLabel`, `WorldbuildingChat`, `LobbyLink`, and the lobby route. Add the Leave button, the remove-member control, and the away state. Delete the old presence code. Done when acceptance 1, 2, 5, 6, 7, and 8 pass.

**Phase 3: draft seam.** Wire `startDraft` and pass `participantIds` through the draft. Done when acceptance 3 and 4 pass and a full three-round draft completes with two players.

**Phase 4: docs.** Update `docs/architecture.md` (data model, presence, known gaps), `docs/tech-stack.md`, and the model-layer rule in `AGENTS.md`. Record the backend choice as a decision.

### Risks

- **The Firebase-to-Convex token bridge does not work as documented.** Phase 0 exists to find out before anything else is written.
- **Token expiry.** Firebase ID tokens last an hour. The provider must refresh them, or long drafts will fail partway.
- **Two sources of truth for a lobby during the draft** (status in Convex, round state in Firestore). Kept safe by never writing draft fields to Convex or roster fields to Firestore until step 2.
- **Presence component behaviour is not fully documented.** If it turns out to remove or misreport users in ways we cannot control, replace it with a `lastSeenAt` field and Parlor's thresholds; nothing else depends on it.

## 6. Open decisions

1. **Backend: A or B?** Everything in section 5 except the table syntax and the seam applies to both.
2. **Who can start the draft?** Today any member can once all are ready. The proposal keeps that. Host-only is the alternative.
3. **Late arrivals.** The proposal refuses them. Parlor would admit them as spectators for the next match; we have no next match.
4. **Leaving mid-draft.** The proposal does not allow it, so a player who walks away simply stops picking and their packs pile up. What should happen to those packs is a step 2 question, but it affects whether Leave should exist during `drafting`.
5. **Fix `withAuthenticatedUser` now?** The paid endpoints are currently open (see `docs/architecture.md`). It is a small fix adjacent to this work and I would do it in phase 0, but it is not part of the lobby.

## Sources

Read directly:

- [misty-step/parlor](https://github.com/misty-step/parlor) at `2e1286b`: README and the architecture, rooms-and-presence, authentication, and installation docs; schema and package manifests
- Convex, [Custom JWT provider](https://docs.convex.dev/auth/advanced/custom-jwt)
- Convex, [Presence component](https://www.convex.dev/components/presence)
- This repo's lobby code and its git history

From search summaries only:

- Firebase, [Build presence in Cloud Firestore](https://firebase.google.com/docs/firestore/solutions/presence)
- Convex, [Custom OIDC provider](https://docs.convex.dev/auth/custom-auth), [Scheduling](https://docs.convex.dev/scheduling/overview), [Workflows](https://docs.convex.dev/agents/workflows)
- Convex free-plan limits, from [costbench.com](https://costbench.com/software/database-as-service/convex/free-plan/)
- Cloudflare, [Durable Objects](https://www.cloudflare.com/developer-platform/products/durable-objects/)
