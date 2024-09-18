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

## So, how do we actually make this work?

The problem is that we don't have a backend server, so we have a few questions we gotta answer:

1. **How do we trigger the generation of a new pack?**
   - We could give each player a button to click to create a new pack. This button would be shown when everyon has readied up and when each pack is fully drafted.
   - We could have each client send a request when the lobby is "full". We could then have the endpoint check if the lobby is in "generating" mode, and if it's not, put it into "generating" mode and start making packs for everyone.
   - We could have a cloud function trigger when the lobby is fully readied. (This goes against the spirit of the experiment, since I'm trying to only use Remix.)

## Post GPT Talk

I had a conversation with o1 since it seems to be a little better than Claude at the moment.

It seems like the concensus is to use a Firestore transaction to attempt to set the lobby's state to "draftStarted". That way, only one client will successfully complete the transaction, and that client will become the "Initiator". The "Initiator" will then be responsible for pack generation.

**PACK MANAGEMENT:**

- Each pack has a `currentHolder` field that is the user's uid.
- Each pack has an `order` field that tracks the order the pack will move in.
- Each pack has a `position` field that tracks the pack's current index in the order.
- Clients listen for changes in all packs. This allows us to display the pack positions.
- Clients are only displayed their held packs in `position` order (the lower the position, the higher priority the pack.) This blocks clients from viewing packs that are still queued.
- When clients are displayed a pack, we fetch that pack's `cards` documents.

**What happens at the end of a round?**

- Once all packs are at the end of their order, clients will all run a transcation to set the lobby's `round` property to the next round. The successful initiator will then generate the next round of packs.

## Downsides of Client Orchestration

- If a client disconnects during pack generation or something, we're cooked. Well actually, since they'll just be pinging an api endpoint that handles the generation, it wouldn't be the end of the world. If they disconnect before the transaction is finished it could maybe be a problem though.
- It's a can of worms I've never opened, so I'll need to be cautious in my implementation. I definitely don't want to spend a week debugging race condition related bugs. I've been there. I don't want to be there ever again.
