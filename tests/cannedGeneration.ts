export const cannedSetting = {
  name: "Glasswake",
  thesis: "An ocean frozen into glass overnight.",
  description: "Sailors now walk where they once drowned.",
  legendaryComponents: [
    { name: "The Last Tide", type: "Event", description: "It never came in." },
  ],
  newMechanic: {
    name: "Shatter",
    description: "Break a permanent for value.",
    rules_text: "Shatter N (Sacrifice this: draw N cards.)",
  },
  setArchetypes: [{ name: "U/R Shards", description: "Spells matter." }],
};

const card = (index: number) => ({
  name: `Glass Sentinel ${index}`,
  mana_cost: "1U",
  art_direction: "A knight of frosted glass.",
  type: "Creature",
  subtype: "Construct",
  rarity: "Common",
  rules_text: "Shatter 1",
  flavor_text: "",
  power: 2,
  toughness: 2,
  set: "Glasswake",
  legendary: false,
});

export const cannedPack = () => ({
  cards: Array.from({ length: 12 }, (_, index) => card(index)),
});

export const CANNED_IMAGE =
  "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAAMCAgICAgMCAgIDAwMDBAYEBAQEBAgGBgUGCQgKCgkICQkKDA8MCgsOCwkJDRENDg8QEBEQCgwSExIQEw8QEBD/yQALCAABAAEBAREA/8wABgAQEAX/2gAIAQEAAD8A0s8g/9k=";
