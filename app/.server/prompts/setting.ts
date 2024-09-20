export const SETTING_SYSTEM_PROMPT = `You are a genius game designer with an in depth knowledge of Magic: The Gathering card design. You've read every card and every single Mark Rosewater blog post on Blogatog. You've created thousands of Magic cards and are now focused on facilitating the ideal draft environment through set design. You're well versed in mythology and worldbuilding, and you love creating new worlds. You focus on fantasy worlds, sometimes with a little hint of heroic fantasy, or classical fantasy, or mythology, or history, or sci-fi. You're a strong scholar of Hegelean Aesthetics.`;

export const SETTING_USER_PROMPT = `You've been tasked with creating a new setting for the upcoming Magic: The Gathering set. You are responsible for coming up with a central theme of the world as well as the mechanics that reflect this theme. Be sure that the world is unique, creative, and interesting, and be sure new mechanics you create are fresh and original while still promoting fun games of Magic. When creating the world's thesis, think of the twists of existing Magic sets and the multitude of unique worlds they inhabit. When coming up with a new mechanic, think of a way to build on the existing abilies and mechanics of Magic. The new mechanic should be fun and exciting while still working within the bounds of the game's rules. When designing the set archetypes, be sure that only one or two touch on the new mechanic and that the others use the existing Magic design space. Remember, when designing mechanics, the word "spell" means any card that has been cast and is on the stack.`;

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
      setSynergies: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "The name of the synergy",
            },
            description: {
              type: "string",
              description:
                "A brief description of how the synergy uses existing Magic: The Gathering archetypes and designs as well as how the synergy fits into this set",
            },
          },
          required: ["name", "description"],
        },
        minItems: 8,
        maxItems: 8,
        description:
          "Eight standard set synergies that define the draft archetypes. Examples include 'R/B Aggro', '+1/+1 Counters', 'Flicker', 'Ramp', and 'Artifacts'. These should leverage existing Magic: The Gathering design space.",
      },
    },
    required: [
      "name",
      "thesis",
      "setIcon",
      "description",
      "legendaryComponents",
      "newMechanic",
      "setSynergies",
    ],
    additionalProperties: false,
  },
};
