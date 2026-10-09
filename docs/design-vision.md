# Design vision

> Drafted from what the UI and prompts do today, not from a conversation with Jackson. The principles are my reading of the existing choices; correct them where they miss.

## The idea

The cards are the art. Everything around them is a plain table to put them on.

A generated card carries all of the product's personality: a painted illustration, a coloured frame, a strange name, a mechanic nobody has seen. The interface around it stays quiet so that nothing competes with it.

## Principles

- **Cards look like cards.** A coloured, textured frame by colour identity, a name bar with mana symbols, art, a type line with rarity, a rules box, and power/toughness in the corner. Anyone who has played Magic should read one without thinking.
- **Chrome is plain.** Stock daisyUI components, Inter for interface text, generous spacing, few colours. Do not decorate the frame around the cards.
- **Follow the system theme.** Light and dark both work; neither is the "real" one.
- **Feel like a tabletop client.** The play screen borrows from Cockatrice: a sidebar for life totals, the log, and a large preview of whatever card is hovered; the opponent's board flipped across the top; your hand along the bottom.
- **Hands on the keyboard and mouse.** Drag cards between zones, shift-click to select several, right-click for a context menu, single-key shortcuts for common actions. The app is designed for a desktop browser.
- **Show what happened.** Every action a player takes appears in the log for both players. This is a design requirement as much as a feature, because it stands in for rules enforcement.
- **A sense of humour.** Draft lobbies get names like `janky-lhurgoyf`. The tone is a kitchen-table game with friends, not an esport.

## Card rendering

- Cards are HTML, not images or canvas, drawn at a base of 250 by 350 pixels. Size changes go through the `scale` prop on `Card`, which scales every dimension and font size. CSS `transform: scale()` was tried and rejected because it does not change the space the card takes in the layout.
- Frame textures are in `public/textures/`, one per colour identity plus gold for multicolour and a grey one for colourless.
- Text shrinks for long names and long rules text so that it fits the box.
- A tapped card rotates 90 degrees. A selected card gets a primary-colour ring, and unselected cards fade while a selection is active.

## Card art

Art should look like a painted fantasy book cover from the 1970s: pulp fantasy oils and acrylics in the manner of Frank Frazetta, Brom, and Michael Whelan. Each image prompt is the card's own art direction plus one of these style lines, chosen at random (`app/.server/prompts/imageAdditives.ts`). Art within a set should feel like it comes from the same world.

## Type

- **Inter** for all interface and card text.
- **Goudy Mediaeval** is bundled and registered as the serif family, intended for a more storybook voice. It is not used anywhere yet, and the `@font-face` URL in `app/tailwind.css` does not match the filenames in `public/fonts/`.
