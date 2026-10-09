# Refactoring Draft GPT

## Purpose
This is an old project I rolled out myself, by hand. Now, we have intelligent agentic coding tools and techniques that allow for enterprise level development and resilience even when you're just a solo dev.

There are bugs, bad features, outdated api calls, old llm model invocations, etc that all need to be improved.

## Step 1: Draft Lobbies

Status: done (2026-10-09). See `draft-lobby-refactor.md` and `convex-rewrite.md`.

Take another look at our lobby system. Can we improve it? Is firebase still the right system? Our heartbeat system was causing problems in lobbies for people. Users who are authenticated should be able to close the tab and rejoin at any point. 

Look at https://github.com/misty-step/parlor. Is this a better system for lobbies? We could use Convex, etc.

## Step 2: Drafting

Status: in progress.

Let's ensure our draft process is robust. The server shouldn't fail, players shouldn't get stuck or skipped. If someone disconnects during the draft, we need to handle it gracefully.

Done: server-side generation with retries, transactional picks, automatic rounds, a reconnect countdown with host pause and skip, automatic picks for absent players, and recovery from a generation step that dies silently.

Remaining:

- Run one real draft on production.

Card design keeps the 2024 model and prompts for now; rebuilding it is step 6.

## Step 3: Game Lobbies
Ensure that game state is properly handled in game lobbies. The same logic and changes we made in Draft lobbies should apply here. Ensure all game states can be represented and are identical in both instances.

## Step 4: Game View
Let's improve the game view. Ensure dragging feels good, ensure tokens, cards, etc are mirrored properly on the opponent's view. Improve the display quality and layout, etc.

## Step 5: The deckbuilder
Let's clean this up. Auto-add lands, better views, good feel good vibes.

## Step 6: Card creation
Rebuild the card creation system. The model (`gpt-4o`) and the setting and pack prompts are the 2024 originals, moved to Convex without change. Until this step we keep using what we have.
