# DraftGPT

Draft a Magic-style card set that an LLM invents for your group, build decks from your picks, and play each other in the browser.

## Run it locally

```sh
bun install
./scripts/test-stack.sh start
```

Open http://localhost:5173. This runs a local Convex backend with no account, a test sign-in form, and fake AI services, so drafts are instant and free. Stop it with `./scripts/test-stack.sh stop`.

To run against a real Convex project instead:

```sh
npx convex dev        # log in and create or pick a project
bun run dev
```

Then set the variables listed in `docs/tech-stack.md` on that deployment.

## Check your work

```sh
bun run test
bun run typecheck
bun run lint
bun run build
```

## Documentation

Start with `AGENTS.md`, which indexes everything in `docs/`.
