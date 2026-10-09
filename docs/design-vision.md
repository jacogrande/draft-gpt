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

Art should look like pulp: a small illustration made quickly and by hand for a cheap fantasy paperback, magazine, or storybook, which is how early Magic card art looked. Loose and economical, with big simple shapes, flat areas of colour, a few strokes standing in for detail, and corners left barely finished. A little odd and charming, never polished, glossy, rendered, or photographic.

Three things keep it from tipping into modern fantasy art:

- **Restraint.** No intricate ornament, no swarms of particles or sparks, no glowing effects the scene did not ask for.
- **Understatement.** The subject is caught in a quiet, ordinary, or odd moment. No heroic poses, no epic scale, no sweeping vistas.
- **Few colours.** Each tradition names three or four, slightly faded like an old printed cover.

Within that, variety is the point. Each card is made in one of 28 traditions, picked at random, so a pack looks like a shelf of old paperbacks and storybooks by different hands. They range across:

- **Pulp and paperback covers:** weird-fiction pastels, sword-and-planet oils, lurid newsstand covers, surreal and luminous science-fantasy paperbacks.
- **Ink and line:** rulebook ink, horror comics, clear-line European comics, whimsical and macabre magazine illustration.
- **Storybook and folk:** fairy-tale gouache, gnarled ink and wash, Russian folk-tale outline, medieval bestiary margins, Japanese warrior prints.
- **Odd ones out:** Polish posters, decadent black and white, the first collectible card game art.

Each tradition names the illustrators it draws on (Margaret Brundage, Frank Frazetta, Richard Powers, Arthur Rackham, Moebius, Quinton Hoover, and so on), a kind of light, and three or four colours. Everyone named is no longer living and stands for a school; prompts do not name living artists. The full list is `convex/draft/artSchools.ts`, and a sample of every one is in `docs/specs/card-art-traditions.html`.

Each image is a wide landscape crop with one large subject against a plain or barely suggested background, readable at thumbnail size, with no text, border, or frame, because the card component supplies those. The shared direction is in `convex/draft/artPrompt.ts`.

## Type

- **Inter** for all interface and card text.
- **Goudy Mediaeval** is bundled and registered as the serif family, intended for a more storybook voice. It is not used anywhere yet, and the `@font-face` URL in `app/tailwind.css` does not match the filenames in `public/fonts/`.
