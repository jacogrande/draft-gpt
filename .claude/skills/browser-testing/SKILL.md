---
name: browser-testing
description: Verify DraftGPT behaviour in a real browser with Vercel's agent-browser CLI, including signing in as several test users at once. Use after changing anything a player can see or do (sign-in, lobbies, drafting, decks), when asked to check, verify, or reproduce behaviour in the running app, or to walk an acceptance checklist.
---

# Browser testing with agent-browser

Integration tests in `convex/**/*.test.ts` prove the backend rules. This skill is for what they cannot see: that the screens show the right thing, to the right player, at the right time. Most behaviour here involves two or more players, so the core technique is one browser session per player.

## 1. Start the stack

```sh
./scripts/test-stack.sh start
```

This starts three things and waits until they answer:

| Process | Address | Log |
|---|---|---|
| Local Convex backend (no account needed) | `127.0.0.1:3210` | `.test-stack/convex.log` |
| Fake OpenAI (cards and art) | `127.0.0.1:4010` | `.test-stack/fakes.log` |
| The app | `http://localhost:5173` | `.test-stack/app.log` |

On first run it also configures auth (section 2). Stop everything, including open browsers, with `./scripts/test-stack.sh stop`. Always stop when you are done.

Drafts on this stack cost nothing and take a few seconds: the setting is always "Glasswake" and every pack is twelve copies of "Glass Sentinel N", topped up to fifteen.

## 2. How test sign-in is configured

Production sign-in is Google only, which a script cannot complete. The local stack adds a second, test-only provider. Two switches turn it on, and both must be set:

| Switch | Where | Effect |
|---|---|---|
| `AUTH_TEST_LOGIN=true` | Convex deployment environment | `convex/auth.ts` registers the password provider |
| `VITE_TEST_LOGIN=true` | `.env.local` | `/join` shows the "Test user" form |

`scripts/setup-local.mjs` sets both, generates the `JWT_PRIVATE_KEY` and `JWKS` that Convex Auth needs, sets `SITE_URL`, and points `OPENAI_BASE_URL` at the fake service. `test-stack.sh start` runs it automatically when `AUTH_TEST_LOGIN` is missing. Run it by hand only if sign-in fails with a token or key error.

Never set either switch on a production deployment. Without the server switch the form does nothing even if it is shown.

A test user is identified by the name you type. The same name always signs in to the same account, so a user's lobbies and decks persist between runs. Use a new name when you need a clean account.

## 3. Sign in as a player

```sh
./scripts/browser-sign-in.sh ana Ana
./scripts/browser-sign-in.sh ben Ben
```

The first argument is the agent-browser session, the second is the player's name. Each session is a separate browser with its own storage, so Ana and Ben are signed in at the same time. The script also completes the choose-a-username step for a new account.

Every later command names its session:

```sh
ab() { ./node_modules/.bin/agent-browser "$@"; }

ab --session ana open http://localhost:5173/lobbies
ab --session ben snapshot -i
```

To check signed-out behaviour, use a session you never signed in (`--session guest`).

## 4. Look, act, check

Work in this loop:

1. **Look** with `snapshot` (the accessibility tree, with a `ref` on each element) or `snapshot -i` for interactive elements only.
2. **Act** on a ref from the snapshot you just took: `click @e25`, `fill @e3 "text"`, `press Enter`.
3. **Wait** for the result, then look again in *every* session the change should reach.

```sh
ab --session ana snapshot -i            # find "Ready Up" and its ref
ab --session ana click @e25
ab --session ben wait 1000
ab --session ben snapshot | grep ready  # Ben should see the new count
```

Useful checks:

| Question | Command |
|---|---|
| Where am I? | `get url` |
| How many of something? | `get count "button.card"` |
| Did the page throw? | `errors` and `console` |
| What does it look like? | `screenshot path.png`, then read the image |

Rules that save time:

- **Refs go stale.** Any re-render can renumber them. Take a fresh snapshot before each action; never reuse a ref from an earlier step.
- **Prefer refs or CSS selectors to `find text`.** `find text "Add Lands" click` fails on that button because the page shows it uppercased, and it failed on a link inside a sentence. Stable selectors in this app: `button.card` (a card), `input[name="test-user"]`, `input[name="username"]`, `a[href^="/decks/"]`.
- **Leaving the page is `open about:blank`.** That is the equivalent of closing the tab while keeping the session signed in.
- **Waiting is `wait <ms>` or `wait <selector>`.** Long shell sleeps may be blocked.
- **Assert on what a player sees,** not on database state. If you need to know what the server did, the integration tests are the place.

## 5. Recipes

**Open a lobby with two players**

```sh
ab --session ana open http://localhost:5173/
ab --session ana snapshot -i                 # click the "Create a Lobby" ref
LOBBY=$(ab --session ana get url)
ab --session ben open "$LOBBY"
```

**Away and back.** A member is shown as away 60 seconds after their last heartbeat.

```sh
ab --session ben open about:blank
ab --session ana wait 80000
ab --session ana snapshot | grep -B1 away    # Ben, still on the roster, marked away
ab --session ben open "$LOBBY"               # same seat, same ready state
```

**Disconnect mid-draft.** With a draft running and Ana as host:

```sh
ab --session ben open about:blank
ab --session ana wait 75000
ab --session ana snapshot | grep -A4 '"Ben"'   # "waiting 1:4x", Pause, Skip
```

Pause holds the time and turns into Resume. Skip opens a dialog; "Skip the wait" makes the label "picking automatically", and each pack Ana passes comes straight back one card smaller. Reopening the lobby as Ben clears the label. Left alone, the countdown runs out two minutes after it appears.

**Pick the first card**

```sh
ab --session ana click "button.card"
ab --session ana press Enter
```

**Play a whole draft.** After both players ready up and one starts:

```sh
pick() {
  if [ "$(ab --session "$1" get count 'button.card')" != "0" ]; then
    ab --session "$1" click 'button.card' >/dev/null
    ab --session "$1" press Enter >/dev/null
  fi
}
for _ in $(seq 1 120); do pick ana; pick ben; ab --session ana wait 400 >/dev/null; done
ab --session ana snapshot | grep "Draft Finished"
```

Two players take about 75 seconds. Each ends with 45 cards.

**Make generation fail, then recover**

```sh
curl -s http://127.0.0.1:4010/__fail/on      # every AI call now returns 500
# start a draft; after three attempts the lobby shows "Generation failed" and the host gets Retry
curl -s http://127.0.0.1:4010/__fail/off
```

## 6. What this stack does not cover

- **Google sign-in.** It needs real credentials and a person. Check it by hand against a deployment that has `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` set.
- **Real generation.** To see real cards and art, set `OPENAI_API_KEY` on the local deployment and remove `OPENAI_BASE_URL`. A two-player round costs roughly twenty cents and takes about two minutes; ask first. Put `OPENAI_BASE_URL` back afterwards.
- **Games.** The play table still writes to the production Firestore project. Do not create or join games from a test session without being asked to.

## 7. Reporting

Say which checks you ran, in which sessions, and what each player saw. If a step was skipped or could not be run, say so. Attach a screenshot for anything visual.
