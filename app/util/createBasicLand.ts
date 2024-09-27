import { Timestamp } from "firebase/firestore";
import { randomUid } from "~/util/randomUid";
import { BasicLand, Card } from "~/util/types";

const IMAGES: Record<BasicLand, string> = {
  plains: "/basics/plains.png",
  forest: "/basics/forest.png",
  mountain: "/basics/mountain.png",
  swamp: "/basics/swamp.png",
  island: "/basics/island.png",
};

export const createBasicLand = (type: BasicLand): Card => {
  return {
    name: type,
    mana_cost: "",
    art_direction: "",
    type: "Basic Land",
    subtype: type,
    rarity: "Common",
    rules_text: "",
    flavor_text: "",
    power: 0,
    toughness: 0,
    set: "",
    legendary: false,
    image_url: IMAGES[type],
    id: randomUid(),
    packId: "",
    createdAt: Timestamp.now(),
    pickedBy: "",
  };
};
