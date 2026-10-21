# Refactoring Draft GPT

## Purpose
This is an old project I rolled out myself, by hand. Now, we have intelligent agentic coding tools and techniques that allow for enterprise level development and resilience even when you're just a solo dev.

There are bugs, bad features, outdated api calls, old llm model invocations, etc that all need to be improved.

## Current position (2026-10-21)

Steps 1 and 3 are complete. Steps 4 and 5 are implemented and verified locally. Step 2 still needs a real production draft. Step 6's shared Luna pipeline, concrete world policy and Default/Busted selection are implemented, with 150 passing tests, typecheck, lint and build. Structured lobby creative guidance is also implemented and verified locally.

The remaining non-playtesting evaluation work is now recorded in [release validation](../research/limited-set-design/17-release-validation.md): 1,215 saved designs, reviewer calibration, twelve world inputs, 126,000 simulated packs and two illustrated diagnostic packs. None of the four completed candidates passed final review; two further runs were interrupted. Mechanic contracts, reviewer reliability and repeated institutional world premises remain quality blockers. Pipeline 3 additionally fixes duplicate-name repair and prevents the model editor from dropping deterministic collisions. Paid results predate those two safeguards and remain failures.

Commits `5c5d325` (shared generation), `20dc304` (mana shortcuts), `13ea51f` (power levels) and `1b297af` (review hardening and evaluations) were pushed to `origin/main` on October 21. This establishes source availability, not production deployment. No production deployment was performed during this audit. The [release handoff](../plans/active/production-release.md) records required deployment approval, missing DNS access, real-user production acceptance and the preserved legacy-deck export. Human playtesting remains excluded.

## Step 1: Draft Lobbies

Status: done (2026-10-09). See `draft-lobby-refactor.md` and `convex-rewrite.md`.

Take another look at our lobby system. Can we improve it? Is firebase still the right system? Our heartbeat system was causing problems in lobbies for people. Users who are authenticated should be able to close the tab and rejoin at any point. 

Look at https://github.com/misty-step/parlor. Is this a better system for lobbies? We could use Convex, etc.

## Step 2: Drafting

Status: in progress.

Let's ensure our draft process is robust. The server shouldn't fail, players shouldn't get stuck or skipped. If someone disconnects during the draft, we need to handle it gracefully.

Done: server-side generation with retries, transactional picks, automatic rounds, a reconnect countdown with host pause and skip, automatic picks for absent players, and recovery from a generation step that dies silently. October 11 hardening added keys to reject superseded generation steps, saved card designs before painting, honoured rate-limit waits, and expanded integration coverage.

Remaining:

- Run one real draft on production.

New drafts use the Luna set pipeline described in step 6. The legacy pack path remains for existing drafts and an explicit Default-mode rollback.

## Step 3: Game Lobbies

Status: done (2026-10-09). See `game-lobbies.md`.

Ensure that game state is properly handled in game lobbies. The same logic and changes we made in Draft lobbies should apply here. Ensure all game states can be represented and are identical in both instances.

## Step 4: Game View

Status: implemented and verified locally (2026-10-12); not yet deployed.

Both players now see a consistent table across different desktop window sizes. See [game-lobbies.md](game-lobbies.md#table-view) for placement, compatibility, and interaction details. The app remains a manual table without turns or legality checks.

Delivered:

- Shared token and counter positions relative to their owner's battlefield area, mirrored into the opponent's view. Positions survive refreshes, resizing, and another session for the same player; rejected moves revert with an error message.
- One battlefield layout for both players. Cards retain automatic land/spell rows, reversed across the table; arbitrary card placement is intentionally outside this step.
- Card drag previews that stay visible outside scroll containers, multi-card drags, specific zone targets, and clean invalid-drop behavior. Opponent cards can be previewed but cannot enter the player's selection.
- Inspection and preview of both public graveyards, with movement controls only for the owner.
- Independently scrolling hands, card rows, table, and sidebar. Crowded boards and large hands do not widen the document. Tapped cards have space to rotate; tokens, library controls, and menus respect the theme.
- Menus rendered above the table and kept inside the viewport. Token, counter, and life editing does not trigger table shortcuts. Earlier October 11 interaction fixes remain in place.

Validation on the local fake-service stack used separate Ana and Ben browser sessions, plus a second Ana session. Checked shared token movement and tapping, counter movement and edits, refresh and resize, cross-session updates, card dragging/tapping, selected-pair movement, both graveyard views, owner-only graveyard controls, life edits and logs, input shortcut guards, menus at the viewport edge, and recovery from an intentionally rejected token move. An 18-card hand and crowded battlefield stayed within 1280×800 and 1440×900 windows; both themes were inspected.

Backend integration coverage verifies ownership, shared placement, bounds, invalid coordinates, closed games, and legacy counter compatibility. Pure coordinate tests cover mirroring and different field sizes. `bun run test` passes all 87 tests; typecheck, lint, and the production build pass. Production deployment is separate from this local acceptance.

## Step 5: The deckbuilder

Status: implemented and verified locally (2026-10-12); not yet deployed. See [deckbuilder.md](deckbuilder.md) for behavior and acceptance.

The earlier migration and October 11 fixes delivered persistent editing, Add Lands, loading/not-found states, basic-land limits, and drag snapback. The completion audit found remaining correctness and usability gaps, now fixed:

- Automatic lands are calculated transactionally from the current mainboard. Repeated or concurrent calls fill only the missing slots up to 17, account for existing basics and nonbasic land counts, and ignore sideboard costs.
- Braced, hybrid, multi-digit, and variable costs parse consistently for land suggestions and mana-value grouping. Decks without colored costs get manual-land guidance instead of a crash.
- Stacks and List views include counts, land/spell totals, previews, clear mana-value headings, and explicit move/remove controls.
- Independent mainboard/sidebar scrolling keeps a large deck usable. Dragging uses the current pointer target after scrolling or resizing; the preview no longer accidentally accepts sideboard drops.
- Rejected moves show an error and preserve the saved cards. Individual land controls respect the existing storage cap.

Browser acceptance covered editing out and back, refresh persistence, basic removal and exact auto-fill, manual additions, both views and themes, scrolling/resizing, invalid drops, rejection recovery, and an outsider's not-found screen. Integration tests cover land allocation, repeated/concurrent calls, ownership, and storage limits. This closes the original step 5 scope; additional deckbuilder features need their own requirements.

## Step 6: Card creation

Status: default for new app drafts (2026-10-16); the user selected prompt 9 for world and card creation on 2026-10-20. Local engineering checks pass. The October 21 calibration and full-set study is complete, but model-quality acceptance failed and human playtest acceptance remains open. Not deployed. Card art upgraded separately; see [card-art.md](card-art.md).

Rebuild the card creation system according to [Set generation and setting design](set-generation.md). The legacy `gpt-4o` pack path remains available for existing drafts and when `SET_GENERATION_ENABLED` is explicitly `false` for Default power. Busted always uses the set pipeline. Unset configuration uses the Luna set pipeline.

The user selected Luna for all generative stages on 2026-10-15 and removed required Decisions screening on 2026-10-16. Code validation, pair/global reviews, coordinated editing and final review remain required. The spec breaks delivery into provider contracts, richer setting prompts, a complete slot inventory, parallel generation, contextual review and editing, pack collation/shared art, and player-flow validation. It defines compatibility, recovery, and acceptance gates for the wave.

The current [world and card policy](set-generation.md#current-world-diversity-and-literal-prose-policy-prompt-9) rotates broad world design directions across recent runs and requires literal descriptions of supernatural causes and effects. The same concrete-prose policy reaches card writing and review. The [five-world probe](../research/limited-set-design/15-world-directions.md) records both results and remaining repetition.

Power selection (2026-10-20): the host can choose Default (the current Modern Horizons target) or Busted (powered Vintage Cube). Prompt 10 freezes the choice across the pipeline and uses a separate sourced 1,000-card pool for Busted. Local integration and browser checks pass. The completed real-model evaluation records failures; quality acceptance and playtesting remain open. See [the power-level contract](set-generation.md#selectable-power-level-prompt-10).

App-default validation (2026-10-16): 119 tests, typecheck, lint and build pass. With no opt-in flag, two fake-stack browser players completed three rounds into 45-card decks. App and preview now share partial-repair context and accepted-name protection. See the [integration record](../plans/completed/app-set-generation.md). Production deployment and real multiplayer playtesting remain separate work.

Research completed 2026-10-14: [Limited set design](../research/limited-set-design/README.md) covers Wizards' design process, color-pair archetypes, support and distribution, mechanics, worldbuilding, model costs, and generation workflows. It informs the implementation; model calibration, human format acceptance, and production validation remain separate gates.

Local evidence (2026-10-15): 108 tests plus typecheck, lint and build pass; two browser players completed three rounds into 45-card decks. A real 135-card Luna candidate produced a fifteen-card illustrated review pack, but final review retained three issues and correctly prevented automatic draft readiness. See the [implementation record](set-generation.md#implementation-record).

Prompt iteration (2026-10-15): concrete prose policy and a stronger custom-cube power floor now reach writers, screeners and editors; role-specific curve bands replace the arbitrary mana cycle. Two live development probes show stronger individual cards and more physical settings, but also record reviewer misses. See [the research and results](../research/limited-set-design/09-concrete-writing-and-power.md).

### Lobby creative guidance (October 21, 2026)

Delivered optional per-member idea support, full conversation snapshots, source-linked Luna interpretation, explicit blueprint dispositions, slot assignments and coverage gates, scoped card guidance and a visible player summary. Public integration tests and two-player browser acceptance pass; a small real-provider probe covered three conversation cases and one 135-slot world. See [the contract and limitations](lobby-creative-guidance.md). This does not close the existing model-quality, deployment or human playtest gates.

### Whole-set review (October 21, 2026)

The review pipeline now requires explicit audits of uniqueness, mechanics, archetype identity, flavor and power. Global and final critics receive every card; an edit pass can revise the whole inventory. Current-inventory name validation handles concurrent revision collisions. Integration coverage includes rewriting all 270 cards. A real re-review of the saved Busted set accepted 74 replacements (66 actual changes), but final review retained three major issues; quality acceptance remains open. See [the contract, timings and limitations](set-review.md). This implementation is verified locally; production is unchanged.

### Three-minute draft startup (October 21, 2026)

Next product requirement: players receive actionable first packs within 180 seconds, including a 15-second world/planning target. The [latency plan](../plans/active/three-minute-drafts.md) records measured bottlenecks, a proposed combined whole-set critique/edit plan, independent final verification, higher bounded writing concurrency, local slot expansion and background art. Pipeline 6 implements the requested `none` reasoning for world/planning, writing and critique; revisions and final verification remain `medium`. The 12.17-minute measurement covers review/editing of an existing set only and predates this setting change. Architecture changes remain unimplemented and the latency targets unvalidated.
