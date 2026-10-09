export const SETTING_SYSTEM_PROMPT = `You are a genius game designer with an in depth knowledge of Magic: The Gathering card design. You've read every card and every single Mark Rosewater blog post on Blogatog. You've created thousands of Magic cards and are now focused on facilitating the ideal draft environment through set design. You're well versed in mythology and worldbuilding, and you love creating new worlds. You focus on fantasy worlds, sometimes with a little hint of heroic fantasy, or classical fantasy, or mythology, or history, or sci-fi. You're a strong scholar of Hegelean Aesthetics.`;

export const SETTING_USER_PROMPT = `You've been tasked with creating a new setting for the upcoming Magic: The Gathering set. You are responsible for coming up with a central theme of the world as well as the mechanics that reflect this theme. Be sure that the world is fantastical, unique, creative, and interesting, and be sure new mechanics you create are fresh and original while still promoting fun games of Magic.

## SETTING THESIS EXAMPLES
- Lorwyn: Lorwyn is an idyllic world where races of fable thrive in perpetual midsummer.
- Mirrodin: On Mirrodin, everything is made of metal—from forests to mountains to grass. Five suns cast their light on the plane, one for each color of mana.
- Kamigawa: Reminiscent of sengoku-era Japan, this plane contains two symbiotic worlds: the utsushiyo, or material realm, and the kakuriyo, or kami spirit realm. Each kami was a divinity, and the way to happiness was to honor these gods and live by their ways. The inhabitants of Kamigawa were content with this life of devotion. Then the unimaginable happened. Their gods turned on them.

## SETTING MECHANIC EXAMPLES
- Lorwyn: Clash (Each clashing player reveals the top card of their library, then puts that card on the top or bottom. A player wins if their card had a higher converted mana cost.)
- Lorwyn: Evoke is a keyword ability that represents a static ability and a triggered ability; it allows a player to play an alternate cost for a creature spell that possesses this ability, but the creature is then sacrificed when it enters the battlefield. 
- Mirrodin: Affinity — Makes cards cheaper to cast by {1} for each permanent controlled by its caster of a certain type specified (usually artifacts).
- Mirrodin: Entwine — Appears on modal spells and represents an extra cost; paying that cost allows you to use both effects instead of only one, such as on Tooth and Nail.
- Kamigawa: Bushido, or "way of the warrior", increases a creature's power and toughness by the Bushido number when it combats another creature. (This is usually compared to flanking, which weakens (-1/-1) the blockers of the creature.)
- Kamigawa: Arcane spells - some instant or sorcery spells have the Arcane subtype, which represent spells or abilities used by the kami. It does nothing by itself, but other cards may interact with it.
- Kamigawa: Splice onto Arcane - spells having this keyword can be "attached" to another Arcane spell for additional mana investment. The "spliced" spell remains in the player's hand able to be reused another time.

When creating the world's thesis, think of the twists of existing Magic sets and the multitude of unique worlds they inhabit. When coming up with a new mechanic, think of a way to build on the existing abilies and mechanics of Magic. The new mechanic should be fun and exciting while still working within the bounds of the game's rules. When designing the set archetypes, be sure that only one or two touch on the new mechanic and that the others use the existing Magic design space. Remember, when designing mechanics, the word "spell" means any card that has been cast and is on the stack.`;

export const SETTING_JSON_SCHEMA = {
  name: "set",
  strict: false,
  schema: {
    type: "object",
    properties: {
      name: {
        type: "string",
        description: "The name of the world the set takes place in",
      },
      thesis: {
        type: "string",
        description:
          "A brief description of the twist of the world or the setting. It should unique and creative, and should be something that sets the world apart from other Magic: The Gathering worlds while maintaining the same aesthetics.",
      },
      description: {
        type: "string",
        description:
          "A short paragraph describing the setting and what makes it unique",
      },
      legendaryComponents: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "The name of the legendary component",
            },
            type: {
              type: "string",
              enum: [
                "Creature",
                "Artifact",
                "Land",
                "Event",
                "Enchantment",
                "Planeswalker",
              ],
              description: "The type of the legendary component",
            },
            description: {
              type: "string",
              description: "A brief description of the legendary component",
            },
          },
          required: ["name", "type", "description"],
        },
        minItems: 3,
        maxItems: 3,
        description: "Three legendary components of the setting",
      },
      newMechanic: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "The name of the new mechanic",
          },
          description: {
            type: "string",
            description:
              "A description of what cards with this mechanic do and how it fits into the standard Magic: The Gathering mechanics",
          },
          rules_text: {
            type: "string",
            description:
              "The rules text of the mechanic, describing its abilities and effects",
          },
        },
        required: ["name", "description", "rules_text"],
        description:
          "A new mechanic specific to this set that doesn't stray too far from the traditional rules",
      },
      setArchetypes: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "The name of the archetype",
            },
            description: {
              type: "string",
              description:
                "A brief description of how the archetype uses existing Magic: The Gathering archetypes and designs as well as how the archetype fits into this set",
            },
          },
          required: ["name", "description"],
        },
        minItems: 8,
        maxItems: 8,
        description:
          "Eight set archetypes that define the draft experience. Examples include 'R/B Aggro', '+1/+1 Counters', 'Flicker', 'Ramp', and 'Artifacts'. These should leverage existing Magic: The Gathering design space.",
      },
    },
    required: [
      "name",
      "thesis",
      "setIcon",
      "description",
      "legendaryComponents",
      "newMechanic",
      "setArchetypes",
    ],
    additionalProperties: false,
  },
};
