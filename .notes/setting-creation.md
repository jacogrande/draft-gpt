## Setting Creation

We allow players waiting to ready up in the lobby to make worldbuilding suggestions.
The idea is that we'll funnel these suggestions into GPT in order to create a setting for the set.

### Setting Requirements

Here are all the things that the setting needs to have in order to be considered complete:

1. A name
2. A thesis ("Pirates vs Zombies", "Water world", "Black hole in the center of the world", etc.)
3. A Set Icon (we can randomly select one from the set icons list)
4. A paragraph description of the setting and what makes it unique
5. Three legendary components of the setting (e.g. A Famous Ruler, A Magical Artifact, A Mysterious Creature)
6. A new mechanic for the setting.
7. 8 set synergies (e.g. "B/R Aggro", "Elves", "Artifacts", "Spellcasting", "Discard", "Rebels")

I think if GPT can fill out those items, we'll be able to plug it into the card generation engine and get a pretty coherent set, including art and flavor text.
The hope is that this project can provide a hyper-unique and engaging draft experience every single time.
Part of what drives that is player's ability to add their own flavor to the setting.

### First Draft of Setting JSON Schema

```json
{
  "name": "set",
  "strict": false,
  "schema": {
    "type": "object",
    "properties": {
      "name": {
        "type": "string",
        "description": "The name of the set"
      },
      "thesis": {
        "type": "string",
        "description": "A brief description of what makes the world interesting"
      },
      "description": {
        "type": "string",
        "description": "A short paragraph describing the setting and what makes it unique"
      },
      "legendaryComponents": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "name": {
              "type": "string",
              "description": "The name of the legendary component"
            },
            "type": {
              "type": "string",
              "enum": ["Ruler", "Artifact", "Creature", "Location", "Event"],
              "description": "The type of the legendary component"
            },
            "description": {
              "type": "string",
              "description": "A brief description of the legendary component"
            }
          },
          "required": ["name", "type", "description"]
        },
        "minItems": 3,
        "maxItems": 3,
        "description": "Three legendary components of the setting"
      },
      "newMechanic": {
        "type": "object",
        "properties": {
          "name": {
            "type": "string",
            "description": "The name of the new mechanic"
          },
          "description": {
            "type": "string",
            "description": "A description of how the new mechanic works"
          }
        },
        "required": ["name", "description"],
        "description": "A new mechanic specific to this set"
      },
      "setSynergies": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "name": {
              "type": "string",
              "description": "The name of the synergy"
            },
            "description": {
              "type": "string",
              "description": "A brief description of how the synergy uses existing Magic: The Gathering archetypes and designs as well as how the synergy fits into this set"
            }
          },
          "required": ["name", "description"]
        },
        "minItems": 8,
        "maxItems": 8,
        "description": "Eight standard set synergies that define the draft archetypes. Examples include 'R/B Aggro', '+1/+1 Counters', 'Flicker', 'Ramp', and 'Artifacts'. These should leverage existing Magic: The Gathering design space."
      }
    },
    "required": [
      "name",
      "thesis",
      "setIcon",
      "description",
      "legendaryComponents",
      "newMechanic",
      "setSynergies"
    ],
    "additionalProperties": false
  }
}
```
