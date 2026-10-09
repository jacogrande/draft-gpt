# Tech stack

What the project is built on and why each piece is here. Versions are the ranges in `package.json`.

## Runtime and tooling

| Tool | Used for |
|---|---|
| Bun 1.x | Package manager and script runner. The lockfile is `bun.lockb`. |
| Node 22 | Runs the Convex CLI, Vite, and vitest |
| TypeScript 5, `strict` | Everything. `~/*` maps to `app/*`, `@convex/*` to `convex/*`. |
| Vite 5 | Dev server and build, through the Remix Vite plugin |
| vitest 2 | Test runner. Pinned to 2.x because Remix 2 needs Vite 5. |
| `convex-test` | Runs Convex functions in memory for integration tests |
| ESLint 8 | `bun run lint` |
| `agent-browser` | Browser checks; see `.claude/skills/browser-testing/SKILL.md` |

## Backend

| Piece | Used for |
|---|---|
| Convex | Database, server functions, scheduler, crons, file storage |
| Convex Auth (`@convex-dev/auth`, beta) | Sign-in. Google in production; a password provider for local testing only |
| OpenAI `gpt-4o` | Setting design (JSON schema reply) and pack design (function call), called with `fetch` from `convex/draft/openai.ts` |
| OpenAI `gpt-image-2.5-flare` | Card art, 1008x656 JPEG at low quality, from `convex/draft/images.ts`. See `docs/specs/card-art.md`. |
| Cloud Firestore (client SDK) | The play table only, until roadmap step 3. Project `draft-gpt-81aaa`; its web config in `app/model/firebase.ts` is not a secret. |

## Frontend

| Library | Used for |
|---|---|
| Remix 2 in SPA mode (`ssr: false`) | File-based routing and the build. There are no loaders, actions, or server. |
| React 18 | UI |
| Tailwind CSS 3, daisyUI 4, typography, `tailwindcss-animate` | Styling and components. No custom theme. |
| zustand 5 | UI-only state: the selected card, hovered card, deck editor layout |
| react-draggable | Dragging in the deckbuilder and play table |
| `@heroicons/react`, `react-icons` | Icons |

## Environment

Set on the Convex deployment (`npx convex env set NAME value`):

| Variable | Holds |
|---|---|
| `SITE_URL` | The app's origin, used for sign-in redirects |
| `JWT_PRIVATE_KEY`, `JWKS` | Convex Auth signing keys |
| `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` | Google OAuth client |
| `OPENAI_API_KEY` | Card design and card art |
| `OPENAI_BASE_URL` | Optional. Point at `scripts/fake-services.ts` for local testing. |
| `AUTH_TEST_LOGIN` | `true` enables test sign-in. Local deployments only. |

In `.env.local` for the client build:

| Variable | Holds |
|---|---|
| `VITE_CONVEX_URL` | The deployment URL, written by `npx convex dev` |
| `VITE_TEST_LOGIN` | `true` shows the test sign-in form |

`scripts/setup-local.mjs` sets everything a local deployment needs.

## Deliberate absences

- **No application server.** Convex is the backend; the app is static files.
- **No OpenAI SDK.** Two `fetch` calls are simpler to replace in tests than a client library.
- **No component tests.** Behaviour is tested through the backend's public functions and in a real browser.

## Deployments

| What | Where |
|---|---|
| Site | Firebase Hosting, https://draft-gpt-81aaa.web.app (`firebase.json` serves `build/client` and rewrites every path to `index.html`) |
| Convex production | `fleet-albatross-186`, in project `draft-gpt` on team `jackson-prowell` |
| Convex cloud dev | `zany-beagle-193`, unused so far |
| Local | An anonymous local backend, which is what `.env.local` points at after `./scripts/test-stack.sh start` |

`./scripts/deploy.sh` runs the tests, deploys Convex production, builds against it with test sign-in off, and deploys the site. It names the Convex project itself, so it does not depend on `.env.local`. For any other production command, prefix it the same way: `CONVEX_DEPLOYMENT=dev:zany-beagle-193 npx convex <command> --prod`.

Production has its Google and OpenAI credentials set. The Google OAuth client's redirect URI is `https://fleet-albatross-186.convex.site/api/auth/callback/google`.
