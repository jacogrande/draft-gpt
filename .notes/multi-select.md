Things are working pretty fine. I got drag and drop working to move cards to the different game zones, and I got hand management working.
The problem I've run into (well, not really a problem, but more of a frustrating ux) is that I can't select multiple cards at once.
Doing so poses a few challenges:

A) How does a user select multiple cards at once?
B) How does a user move all selected cards at once? If dragging, do all the cards move together? What are the alternatives?
C) How do we keep track of the selected cards in the app state?

### A) How does a user select multiple cards at once?

I see two possible solutions: The user can hold down the shift key and click multiple cards, or the user can right click and drag a selection box around multiple cards.

**Pros of the shift key:** This is considerably easier to implement since we wouldn't have to track down which DOM elements are within the selection box.
**Cons of the shift key:** More clicks for the user.

I think that's enough evidence off the bat that the shift key is the way to go.

### B) How does a user move all selected cards at once?

Here are my solutions ordered by simplicity at a glance:

1. The user drags their most recently selected card to the target zone. We only animate the card that was dragged.
   Once the user drops the card in a new zone, we move all of the selected cards to the new zone.
2. The user right clicks and selects the `Move to Zone` option of a custom context menu.
   While building this menu may be difficult, I think it'll be required for a few other features anyway.
3. The user drags a card and all of the other selected cards move with it. IDK how to even do this. Would I have to store each card's draggable position in state?

Here's the problem. To me, the sollutions ordered by best UX seem to be a direct inverse of the previous list.
I guess that means that the middle option is the best compromise.
