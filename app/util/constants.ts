import { CardColor } from "~/util/types";

export const BASE_URL = "https://draftgpt.hasslebad.com";
export const LOBBIES_COLLECTION = "lobbies";
export const DEFAULT_IMAGE_EXTENSION = "jpeg";

export const ROUND_COUNT = 3;

export const CARD_COLORS: Record<CardColor, string> = {
  red: "bg-red-500/50",
  white: "bg-stone-200/50",
  blue: "bg-sky-500/50",
  black: "bg-zinc-800/50",
  green: "bg-green-500/50",
  multi: "bg-amber-500",
  colorless: "bg-slate-400/70",
};

export const ADJECTIVES = [
  "Altered",
  "Tattered",
  "Rusty",
  "Deadly",
  "Tron",
  "Delving",
  "Stormy",
  "Botched",
  "Bamboozled",
  "Crazed",
  "Cruel",
  "Rude",
  "Freaky",
  "Grumpy",
  "Free",
  "Flying",
  "Skulking",
  "Islandwalking",
  "Mountainwalking",
  "Defending",
  "Tough",
  "Strong",
  "Expensive",
  "Quintessential",
  "Wise",
  "Noble",
  "Nimble",
  "Cosmic",
  "Brilliant",
  "Sagacious",
  "Zesty",
  "Magnanimous",
  "Glorious",
  "Philanthropic",
  "Crafty",
  "Hasty",
  "Trampling",
  "Red",
  "Green",
  "Blue",
  "White",
  "Black",
  "Multi-Colored",
  "Luminous",
  "Shining",
  "Radiant",
  "Flipping",
  "Intrepid",
  "Ancestral",
  "Mystic",
  "Vivid",
  "Exuberant",
  "Energetic",
  "Shimmering",
  "Equipped",
  "Healing",
  "Reaching",
  "Colorless",
  "Controlling",
  "Costly",
  "Enchanted",
  "Exiled",
  "Flashing",
  "Goading",
  "Hexproof",
  "Indestructible",
  "Legendary",
  "Menacing",
  "Opposing",
  "Planeswalking",
  "Sacrificial",
  "Vigilant",
  "Serene",
  "Tranquil",
  "Zealous",
  "Astute",
  "Daring",
  "Broken",
  "Cheap",
  "Proxied",
  "Fake",
  "Squeaky",
  "Wonky",
  "Janky",
  "Frazzled",
  "Jittery",
  "Zany",
  "Gobsmacked",
];

export const NOUNS = [
  "Artifact",
  "Enchantment",
  "Planeswalker",
  "Mountain",
  "Island",
  "Forest",
  "Plains",
  "Swamp",
  "Plane",
  "Equipment",
  "Aura",
  "Kithkin",
  "Elemental",
  "Wizard",
  "Atog",
  "Ally",
  "Angel",
  "Mox",
  "Lotus",
  "Treefolk",
  "Land",
  "Mana",
  "Armadillo",
  "Goblin",
  "Elf",
  "Troll",
  "Basilisk",
  "Cleric",
  "Construct",
  "Cockatrice",
  "Coward",
  "Demigod",
  "Devil",
  "Dragon",
  "Djinn",
  "Dryad",
  "Efreet",
  "Eldrazi",
  "Faerie",
  "Fungus",
  "Hippogriff",
  "Homunculus",
  "Hydra",
  "Illusion",
  "Kavu",
  "Kitsune",
  "Kobold",
  "Lhurgoyf",
  "Masticore",
  "Merfolk",
  "Nephilim",
  "Ooze",
  "Ouphe",
  "Phyrexian",
  "Praetor",
  "Sliver",
  "Spirit",
  "Thopter",
  "Vedalken",
  "Warrior",
  "Wyrm",
  "Zombie",
  "Doohickey",
  "Platypus",
  "Teapot",
  "Time-Walk",
  "Bauble",
  "Orb",
  "Fetch-Land",
  "Proxy",
  "Rare",
  "Mythic",
  "Sorcerer",
  "Oracle",
  "Artificer",
  "Thief",
  "Assassin",
  "Cleric",
  "Mystic",
  "Pirate",
  "Druid",
  "Summoner",
  "Witch",
  "Counterspell",
  "Instant",
  "Sorcery",
  "Bolt",
  "Bird",
  "Verdict",
  "Strix",
  "Depths",
  "Crucible",
  "Delver",
  "Recall",
  "Twister",
  "Diamond",
  "Amber",
  "Opal",
  "Sapphire",
  "Ruby",
  "Emerald",
  "Pearl",
  "Jet",
];

export const SET_ICONS: string[] = [
  "GiAcorn",
  "GiAcid",
  "GiAlienFire",
  "GiAmplitude",
  "GiAngelWings",
  "GiAnvil",
  "GiApothecary",
  "GiArchitectMask",
  "GiArcingBolt",
  "GiAries",
  "GiAssassinPocket",
  "GiAstrolabe",
  "GiAtom",
  "GiAxeSwing",
  "GiAxeSword",
  "GiBarbedCoil",
  "GiBarbedSun",
  "GiBarbute",
  "GiBatteredAxe",
  "GiBattleAxe",
  "GiBeard",
  "GiBestialFangs",
  "GiBirdClaw",
  "GiBlackBridge",
  "GiBleedingEye",
  "GiBoarEnsign",
  "GiBookCover",
  "GiBoomerang",
  "GiBrainTentacle",
  "GiBrokenPottery",
  "GiBrutalHelm",
  "GiBrute",
  "GiBullHorns",
  "GiBullyMinion",
  "GiBurningDot",
  "GiBurningEye",
  "GiCandlebright",
  "GiCat",
  "GiCauldron",
  "GiChessRook",
  "GiChicken",
  "GiCircleClaws",
  "GiCirclingFish",
  "GiClover",
  "GiCoffin",
  "GiConcentrationOrb",
  "GiCrabClaw",
  "GiCrackedShield",
  "GiCurledTentacle",
  "GiDesertSkull",
  "GiDiplodocus",
  "GiDominoMask",
  "GiDoubleDragon",
  "GiEagleHead",
  "GiEgyptianBird",
  "GiExplosionRays",
  "GiFallingLeaf",
  "GiFeather",
  "GiFire",
  "GiFireflake",
  "GiFlamer",
  "GiFlowerEmblem",
  "GiFluffyTrefoil",
  "GiFluffyWing",
  "GiGavel",
  "GiGoose",
  "GiHandheldFan",
  "GiHeatHaze",
  "GiHeavyHelm",
  "GiHelicoprion",
  "GiHolyGrail",
  "GiHorseHead",
  "GiKiwiBird",
  "GiMagicPalm",
  "GiMagicPortal",
  "GiMantaRay",
  "GiMeatCleaver",
  "GiMoon",
  "GiMountaintop",
  "GiMushroom",
  "GiMushrooms",
  "GiPawPrint",
  "GiPegasus",
  "GiPilgrimHat",
  "GiPumpkin",
  "GiPotionBall",
  "GiSpikedDragonHead",
];
