export const MAX_USERNAME_LENGTH = 24;

export const parseUsername = (raw: string): string | null => {
  const username = raw.normalize("NFKC").trim().replace(/\s+/g, " ");
  const length = [...username].length;
  return length >= 1 && length <= MAX_USERNAME_LENGTH ? username : null;
};

export const displayName = (user: { username?: string; name?: string }) =>
  user.username ?? user.name ?? "Player";
