# Product vision

> Drafted from the code and `.notes/`, not from a conversation with Jackson. Treat it as a first reading to correct, especially the audience and non-goals.

## What it is

DraftGPT lets a group of friends draft a Magic: The Gathering-style set that has never existed before and will never exist again. They suggest ideas for a world, an LLM turns those into a setting with its own mechanic and archetypes, and every pack they open is designed and illustrated for that setting. Then they build decks from what they picked and play each other in the browser.

## Why it exists

The best part of a new Magic set is the first draft, when nobody knows the cards and every pick is a discovery. That feeling wears off after a few drafts of the same set. DraftGPT aims to provide, in the words of the original notes, "a hyper-unique and engaging draft experience every single time."

## Who it is for

A small group of friends who already know how to play Magic, are on a voice call together, and trust each other. It is not built for strangers, matchmaking, or competitive play.

## The loop

1. **Worldbuild.** While waiting in the lobby, players throw ideas into a chat. Their suggestions shape the setting, so the set feels like theirs.
2. **Draft.** Three rounds of 15-card packs passed around the table, reversing direction each round. Cards are powerful on purpose, closer to a cube than a retail set.
3. **Build.** Each draft produces a deck with a mainboard, a sideboard, and basic lands.
4. **Play.** Two players share a table: zones, tapping, life totals, counters, tokens, and a log of everything each player does.

## Principles

- **Every draft is new.** Novelty is the product. Features that make sets repeatable or predictable work against it.
- **Players shape the world.** The setting comes from the group's suggestions, not from a menu.
- **Cards should feel real.** Names, costs, rules text, flavour, and art should read like cards a designer made on purpose for this world.
- **A table, not a referee.** The app gives players the pieces and records what they do with them. The players know the rules and enforce them, as they would with paper cards.
- **Simple over complete.** One person builds this. A feature that works for four friends on a call beats one that is robust against everything.

## Non-goals

- **Rules enforcement.** No turns, phases, stack, or legality checks.
- **Preventing cheating.** The interaction log keeps players honest. The server keeps each player's hand and library from the other, and nothing beyond that.
- **Play without voice chat.** Turn order and intent are communicated out loud.
- **Collections, trading, or an economy.** A deck exists because of a draft and belongs to it.
- **Faithfully reproducing real Magic cards.** The cards are original; only the game's conventions are borrowed.
