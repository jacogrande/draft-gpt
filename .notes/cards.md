Here's the latest issue: The Card component is designed at a certain scale, and, while I can change that scale with the css transform scale property, that doesn't change the size of the component in the document flow. This leads to janky looking components that have giant margins.

## First Solution

I'm gonna use the `html2canvas` library to give me more control of the display of each card.
I'll make a new `CanvasCard` component that will render the actual card offscreen, and then use the `html2canvas` library to take a screenshot of the component and display it as a canvas element.

**RESULTS:** `html2canvas` is actually really resource intensive. It slows down the page considerably.

## Solution #2

Okay, this time I'll try and just rebuild the card component with the canvas element. It'll need to display all the text and everything, but I should be able to make it look okay.

**RESULTS:** This looks super jank, and it requires some CORS shenanigans to get the image to display. I hate CORS shenanigans.

## Solution #3

I'll dynamically update card styles with a `scale` prop.
