Here's a new feature I've been working on: Counters.

It's classic in MTG to get some sort of counter that you want to either attach to a card or just increment on its own.
I'm thinking that in order to match the versatility of just using a die or pennies irl, I'll need to let users create movable "counters" (really just circular, colored divs).

This is a little bit trickier than it sounds though, since any movement of the counter will need to be reflected in the game state.

### Counter Creation

Right now, right clicking will bring up a custom context menu with the option to create a counter.
Doing so will add a new object to the `counters` array in the game document.
Each counter has the following properties:

- id: a random uid
- ownerId: the id of the user who created the counter
- color: the background color of the counter
- value: the current value of the counter (any string)
- position: the position of the counter in the player's game field

### Counter Movement

Counters will need to be draggable in the game field. Whenever a player drops a counter, we'll update the counter object in the game doc to reflect the new position.

### Correctly Notating Counter Position

Mapping the position of a counter on one player's screen to the position of the same counter on the opponent's screen is straight up nasty. We need to account for different screen sizes and different device pixel ratios. Moreover, when rendering opponent tokens, we need to invert the y axis of their positions since the opponent's board is flipped.

I think saving the y position relative to the top left of the PlayerField is the easiest way to handle this.
