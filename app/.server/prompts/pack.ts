export const PACK_SYSTEM_PROMPT = `You are a genius game designer with an in depth knowledge of Magic: The Gathering card design. You've read every card and every single Mark Rosewater blog post on Blogatog. You've created thousands of Magic cards and are now focused on facilitating the ideal draft environment through set design.`;

export const PACK_USER_PRMOPT = `You've been provided with this data as direction for the new set you'll be designing:
\`\`\`json
<<STRINGIFIED_JSON_DATA>>
\`\`\`

## Instructions
With this theme and design in mind, create 12 new cards for this set. Make sure the cards are all seriously designed and aesthetically similar to standard Magic: The Gathering cards. The cards should be mostly common and uncommon, with a Rare/Mythic or two sprinkled in.

### Mechanics
Be sure that these cards reinforce the designated design space of this set. The new cards should be built with the archetypes established by the set design object. Only a two or three cards should leverage the new mechanic. The rest should deeply explore the other synergies and archetypes established in the setting object. Remember, when the word "spell" is used, it refers to a card on the stack.

### Cards for Everyone
Make sure that there are cards designed for Timmys (loves playing big creatures and casting big powerful spells), Johnnys (loves building complex combo decks), and Spikes (loves the competition and strives to win).

### Name
Make sure the new cards have very unique names. Use "Show, don't tell" to help with the worldbuilding and aesthetics of the set. The name and flavor of the cards should not only fit with the set design, but add new details to it. The names of the cards should all sound like real Magic cards.

### Power Level
This set should have a similar power level to a Vintage Cube, Modern Masters set, or Competitive Magic decks. It should encourage high power, competitive play with strong cards. The mana curve should be relatively low and the value of each card should be relatively high.

### Color Identities
Make sure that the cards' colors are evenly dispersed between Red, Green, White, Blue, Black, Colorless, and Multicolored.

### Flavor Text
Flavor text should be used sparingly, and should help give the players a sense of the world building. Flavor text should "show, not tell", using names of people and places. Some flavor text can be a quote by a character in the world. If so, make sure the quote is attributed to that character.
`;

export const PACK_FUNCTION_SCHEMA = {
  name: "create_cards",
  description: "Generate 12 entirely new cards for this set",
  strict: true,
  parameters: {
    additionalProperties: false,
    required: ["cards"],
    type: "object",
    properties: {
      cards: {
        type: "array",
        items: {
          type: "object",
          required: [
            "name",
            "mana_cost",
            "type",
            "rarity",
            "rules_text",
            "set",
            "power",
            "legendary",
            "subtype",
            "toughness",
            "flavor_text",
            "linked_card",
          ],
          properties: {
            set: {
              type: "string",
              description: "The set or expansion the card belongs to",
            },
            name: {
              type: "string",
              description: "The name of the magic card",
            },
            type: {
              enum: [
                "Creature",
                "Enchantment",
                "Instant",
                "Planeswalker",
                "Land",
                "Artifact",
                "Sorcery",
              ],
              type: "string",
              description: "The primary type of the card",
            },
            power: {
              type: "integer",
              description: "The power of the creature card (if applicable)",
            },
            rarity: {
              enum: ["Common", "Uncommon", "Rare", "Mythic Rare"],
              type: "string",
              description:
                "The rarity of the card. This indicates its value and power level.",
            },
            legendary: {
              type: "boolean",
              description: "Whether or not this card is legendary",
            },
            subtype: {
              type: "string",
              description:
                "(optional) The subtype of the card (e.g., Spirit, Elf, Wizard)",
            },
            mana_cost: {
              type: "string",
              description:
                "The mana cost of the card, represented as a string (e.g. '1WB', 'RR', or '4')",
            },
            toughness: {
              type: "integer",
              description: "The toughness of the creature card (if applicable)",
            },
            rules_text: {
              type: "string",
              description:
                "The rules text of the card, describing its abilities and effects",
            },
            flavor_text: {
              type: "string",
              description:
                "(optional) The flavor text of the card, providing lore or atmosphere",
            },
            linked_card: {
              type: "string",
              description:
                "(optional) name of a card that is linked to this one",
            },
          },
          description: "12 entirely new, well designed cards for this set",
          additionalProperties: false,
        },
      },
    },
  },
};
