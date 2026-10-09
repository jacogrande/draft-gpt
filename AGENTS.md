# DraftGPT

Friends draft a Magic-style card set that an LLM invents for them on the spot, build decks from their picks, and play each other on a shared virtual table. A static React app on a Convex backend, with OpenAI for card design and card art.

## Commands

- Install: `bun install`
- Backend: `bun run dev:backend` (Convex; `CONVEX_AGENT_MODE=anonymous` runs it locally with no account)
- App: `bun run dev`
- Tests: `bun run test` (vitest; plain `bun test` does not work)
- Typecheck: `bun run typecheck`
- Lint: `bun run lint`
- Deploy to production (Convex and Firebase Hosting): `./scripts/deploy.sh`. Ask before running it.
- Everything for browser testing, with test sign-in and fake AI services: `./scripts/test-stack.sh start` and `stop`

## Rules

- **Functional core, imperative shell.** Rules of the game are pure functions in the core files of each domain (`roster.ts`, `seating.ts`, `passing.ts`, `parsing.ts`, `zones.ts`). Convex functions load, call them, and write. Do not put a rules decision in a handler.
- **Code lives with its domain.** `convex/identity`, `lobby`, `draft`, `deck`, each with its own `tables.ts` and tests. A domain changes another's data only by calling a function that domain exports.
- **Mutations reject, queries return nothing.** A mutation checks the caller first and rejects with a code from `convex/errors.ts`. A query that the caller may not see returns `null` or `[]`, because a thrown query crashes the page during sign-out and leave.
- **Integration tests first.** New backend behaviour gets a test in `convex/<domain>/*.test.ts` that drives public functions as signed-in players. Write a unit test only for core logic where a silent regression would be costly.
- **Check screens in a browser.** After changing anything a player sees, follow `.claude/skills/browser-testing/SKILL.md`.
- **Keep files small and comments rare.** One concept per file. Use names, not comments, to explain.
- **Outside services are called only from `convex/draft/openai.ts` and `images.ts`,** and their replies go through `draft/parsing.ts` before being stored.
- **The app does not enforce game rules.** No turns, no legality checks. Read `docs/product-vision.md` before adding one.
- **Never set `AUTH_TEST_LOGIN` on a production deployment.**

## Where to look

- What the product is for and what it will not do: `docs/product-vision.md`
- How it should look and feel: `docs/design-vision.md`
- How the pieces fit, the data model, flows, known gaps: `docs/architecture.md`
- Dependencies, services, environment variables: `docs/tech-stack.md`
- The refactor in progress: `docs/specs/refactor-roadmap.md`
- Card art model, prompt, cost, and limits: `docs/specs/card-art.md`
- The Convex rewrite, its engineering rules, and what is left to deploy it: `docs/specs/convex-rewrite.md`
- Why lobbies were rebuilt: `docs/specs/draft-lobby-refactor.md`
- Planned work: `docs/roadmap.md`
- How to write and maintain these docs: `docs/documentation-guide.md`
- Design history: `.notes/`. A journal that predates the rewrite; where it disagrees with `docs/` or the code, it is out of date.

## Working here

- A change that makes one of these docs false updates the doc in the same commit.
- The play table (`app/model/game`, `app/routes/games.$gameId`) still writes to the production Firestore project. Do not create games from a test session unless asked.
- Add a line to this file when an agent makes a mistake the line would have prevented. Keep it under about 100 lines.
