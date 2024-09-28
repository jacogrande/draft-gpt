/**
 * Generate 4 random characters (A-Z0-9) and return them as a string
 * @returns a random game name
 */
export const randomGameName = (): string => {
  const allowedChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const randomChars = new Array(4)
    .fill(null)
    .map(() => allowedChars[Math.floor(Math.random() * allowedChars.length)]);
  return randomChars.join("");
};
