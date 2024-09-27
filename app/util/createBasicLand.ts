import { Timestamp } from "firebase/firestore";
import { randomUid } from "~/util/randomUid";
import { BasicLand, Card } from "~/util/types";

const IMAGES: Record<BasicLand, string> = {
  plains: "/basics/plains.jpg",
  forest: "/basics/forest.jpg",
  mountain: "/basics/mountain.jpg",
  swamp: "/basics/swamp.jpg",
  island: "/basics/island.jpg",
};

export const createBasicLand = (type: BasicLand): Card => {
  const name = type.charAt(0).toUpperCase() + type.slice(1);
  return {
    name,
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
