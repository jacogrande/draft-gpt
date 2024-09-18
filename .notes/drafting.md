I'm a wee bit stumped on how to handle the actual draft process.

**Here's what we're working with:**

- Every player is subscribed to a lobby snapshot
- The draft can only be started when all the players are ready

**Here's what we want to happen:**

- Once all players are ready, the draft system creates 1 pack per player.
- Players see some sort of loading screen while the packs are being created.
- Each player is assigned a pack, and they get to see each card in the pack.
- Players can pick a card from their pack and add it to their deck.
- Once a player confirms their pick, the pack is moved to the next player.
- After each round of drafting, the order of the draft is reversed (left -> right becomes right -> left in real table terms).
- Players can have any number of packs waiting on them, but they don't see the queued packs until they've selected a card from the current pack.
- Once the first round is over, create a new pack for each player and repeat the process.
- Do it one more time.

**Pack Mechanics:**
Creating a pack follows these steps:

1. Collecting all the worldbuilding info
2. Prompting GPT with a request to create 15 card objects, each with art direction
3. Use the art direction + a prompt bank to create art for each card
4. Save the images to Firebase Storage
5. Reference the images in the card objects saved to Firestore

When a player drafts a card, we need to do the following:

1. Mark the card as picked
2. Copy the card to the player's `deck` document

**Deck Mechanics:**
Each time a player starts a draft, they get a new deck document.
The deck `name` is the same as the lobby name.
The deck `lobbyId` is the same as the lobby id.
The deck has a list of `cards`, each an entire card object.

NOTE: Times like these is when I wish Firestore was relational lol
