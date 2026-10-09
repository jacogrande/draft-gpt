# Refactoring Draft GPT

## Purpose
This is an old project I rolled out myself, by hand. Now, we have intelligent agentic coding tools and techniques that allow for enterprise level development and resilience even when you're just a solo dev.

There are bugs, bad features, outdated api calls, old llm model invocations, etc that all need to be improved.

## Step 1: Draft Lobbies
Take another look at our lobby system. Can we improve it? Is firebase still the right system? Our heartbeat system was causing problems in lobbies for people. Users who are authenticated should be able to close the tab and rejoin at any point. 

Look at https://github.com/misty-step/parlor. Is this a better system for lobbies? We could use Convex, etc.

## Step 2: Drafting
Let's ensure our draft process is robust. The server shouldn't fail, players shouldn't get stuck or skipped. If someone disconnects during the draft, we need to handle it gracefully.

## Step 3: Game Lobbies
Ensure that game state is properly handled in game lobbies. The same logic and changes we made in Draft lobbies should apply here. Ensure all game states can be represented and are identical in both instances.

## Step 4: Game View
Let's improve the game view. Ensure dragging feels good, ensure tokens, cards, etc are mirrored properly on the opponent's view. Improve the display quality and layout, etc.

## Step 5: The deckbuilder
Let's clean this up. Auto-add lands, better views, good feel good vibes.
