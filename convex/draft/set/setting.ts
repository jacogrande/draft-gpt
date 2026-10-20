import { Setting } from "../tables";
import { Blueprint } from "./types";
export const settingFromBlueprint = (blueprint: Blueprint): Setting => ({
  name: blueprint.world.name,
  thesis: blueprint.world.premise,
  description: blueprint.world.description,
  legendaryComponents: [],
  newMechanic: {
    name: blueprint.mechanics.find((m) => m.isNew)?.name ?? "",
    description: blueprint.mechanics.find((m) => m.isNew)?.support ?? "",
    rules_text: blueprint.mechanics.find((m) => m.isNew)?.reminder ?? "",
  },
  setArchetypes: blueprint.archetypes.map((a) => ({
    name: `${a.id}: ${a.name}`,
    description: `${a.earlyGame} ${a.engine} ${a.winCondition}`,
  })),
});
