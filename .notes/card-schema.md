Here's Claude's suggestion for a card JSON schema:

```JSON
{
  "name": "Magic Card",
  "strict": false,
  "schema": {
    "type": "object",
    "required": [
      "name",
      "mana_cost",
      "type",
      "rarity",
      "rules_text",
      "set"
    ],
    "properties": {
      "set": {
        "type": "string",
        "description": "The set or expansion the card belongs to"
      },
      "name": {
        "type": "string",
        "description": "The name of the magic card"
      },
      "type": {
        "type": "string",
        "enum": [
            "Creature",
            "Enchantment",
            "Instant",
            "Planeswalker",
            "Land",
            "Artifact",
            "Sorcery",
        ],
        "description": "The primary type of the card"
      },
      "power": {
        "type": "integer",
        "description": "The power of the creature card (if applicable)"
      },
      "rarity": {
        "enum": [
          "Common",
          "Uncommon",
          "Rare",
          "Mythic Rare"
        ],
        "type": "string",
        "description": "The rarity of the card. This indicates its value and power level."
      },
      "subtype": {
        "type": "string",
        "description": "The subtype of the card (e.g., Spirit, Elf, Wizard)"
      },
      "mana_cost": {
        "type": "string",
        "description": "The mana cost of the card, represented as a string (e.g. '1WB', 'RR', or '4')"
      },
      "toughness": {
        "type": "integer",
        "description": "The toughness of the creature card (if applicable)"
      },
      "rules_text": {
        "type": "string",
        "description": "The rules text of the card, describing its abilities and effects"
      },
      "flavor_text": {
        "type": "string",
        "description": "The flavor text of the card, providing lore or atmosphere"
      }
    },
    "additionalProperties": false
  }
}
```

I think this is a good starting point, but we may need to update the property descriptions depending on GPT's output quality.

Here's a SCHEMA for a pack:

```JSON
{
  "name": "Pack",
  "strict": false,
  "schema": {
    "type": "array",
    "items": {
      "type": "object",
      "required": [
        "name",
        "mana_cost",
        "type",
        "rarity",
        "rules_text",
        "set"
      ],
      "properties": {
        "set": {
          "type": "string",
          "description": "The set or expansion the card belongs to"
        },
        "name": {
          "type": "string",
          "description": "The name of the magic card"
        },
        "type": {
          "type": "string",
          "enum": [
            "Creature",
            "Enchantment",
            "Instant",
            "Planeswalker",
            "Land",
            "Artifact",
            "Sorcery"
          ],
          "description": "The primary type of the card"
        },
        "power": {
          "type": "integer",
          "description": "The power of the creature card (if applicable)"
        },
        "rarity": {
          "enum": [
            "Common",
            "Uncommon",
            "Rare",
            "Mythic Rare"
          ],
          "type": "string",
          "description": "The rarity of the card. This indicates its value and power level."
        },
        "subtype": {
          "type": "string",
          "description": "The subtype of the card (e.g., Spirit, Elf, Wizard)"
        },
        "mana_cost": {
          "type": "string",
          "description": "The mana cost of the card, represented as a string (e.g. '1WB', 'RR', or '4')"
        },
        "toughness": {
          "type": "integer",
          "description": "The toughness of the creature card (if applicable)"
        },
        "rules_text": {
          "type": "string",
          "description": "The rules text of the card, describing its abilities and effects"
        },
        "flavor_text": {
          "type": "string",
          "description": "The flavor text of the card, providing lore or atmosphere"
        }
      },
      "additionalProperties": false
    },
    "description": "A pack of cards from this set. Each pack contains a near even distribution of colors. Each pack contains 10 commons, 4 uncommons, and 1 rare.",
    "additionalProperties": false,
    "minItems": 15,
    "maxItems": 15
  }
}
```
