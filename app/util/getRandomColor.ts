const TAILWIND_COLORS = [
  "red",
  "orange",
  "amber",
  "yellow",
  "lime",
  "green",
  "emerald",
  "teal",
  "cyan",
  "sky",
  "blue",
  "indigo",
  "violet",
  "purple",
  "fuchsia",
  "pink",
  "rose",
];

export const getRandomColor = (): string => {
  const randomIndex = Math.floor(Math.random() * TAILWIND_COLORS.length);
  return TAILWIND_COLORS[randomIndex];
};
