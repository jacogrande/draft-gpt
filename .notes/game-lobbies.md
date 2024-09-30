Unfortunately, it's actually a little difficult to use Spelltable to play a game with screensharing. You need to install OBS and all that. It's a pain in the ass.

This means that my "Goldfish" page that was originally intended to let the user play by themselves now has to become a fully fledged game lobby. This is a major pain, but it is pretty nice functionality, honestly.

### Design / Implementation

Here's what I'm thinking the flow is for creating a game.

1. A user create a game lobby
2. The user is presented with a game code to share with the opponent
3. The opponent clicks "Find a Game" and enters the game code in a modal
4. Once both players are in the game lobby, they each must choose a deck to play with
5. Once both players click "Ready Up", the game begins

#### No Turns?

I gotta keep this as simple as possible, so I'm not gonna implement any actual game rules. Just actions that the player can take that represent the outcomes of game rules.  
For example, there won't be any "turns" in the game. Instead, players will need to be in a voice call and communicate the turn order.

The only way to force honesty with this system is to have an interaction log that both players can see. Anytime a player draws a card, plays a card, shuffles their deck, taps a card, etc, that action is printed to the interaction log.

### Game Logic

Once the game has started, there are few bits of scoped state that we need to consider.

**Deck Scope**
When players load into a game, we'll copy their deck into the game lobby. This is how we're gonna manage the entire game state. It's gonna be a little crazy.

- Players will load their entire deck into the app state.
  - This will be used for shuffling, drawing, etc...
- Players will also load the opponent's deck into state
  - This will be used for rendering the opponent's field.

Within each deck object, we have a **Card Scope**:

- Each card has the relevant card info (name, mana cost, etc.). This will be used to render each card.
- Each card also has a `currentZone` field. This lets the game manager know which zone to render that card in / how many cards are still in the player's deck.
  - I think the zones are as follows: `deck`, `graveyard`, `hand`, and `field`.

### Page Layout

| ------- | ------------------ |
| ------- | ------------------ |
| -STATE- | -------GAME------- |
| ------- | ------------------ |
| ------- | ------------------ |
| ------- | ------------------ |
| ------- | -------HAND------- |
| ------- | ------------------ |

I think we'll need to display an entire sidebar with life totals and the interaction log. Oh and a card preview for when you hover over a card (a la Cockatrice)
We'll have a game screen with your field and the opponent's deck/field/hand.
Lastly, we'll have a view for your own hand.
I think all of these but the game need to be hideable.

### Shuffling

Does it make more sense to duplicate the user's deck into a new state variable and then shuffle it, or do we just shuffle the lobby state? I think we just shuffle the lobby state. Obviously, this is not secure at all since I can just look at the app state and see what my opponent's deck is, but for now that's totally fine.
