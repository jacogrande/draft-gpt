import { expect, test } from "vitest";
import { rejection, signIn, startBackend } from "../../tests/backend";
import { api } from "../_generated/api";

test("a signed-out visitor has no user and cannot change anything", async () => {
  const backend = startBackend();

  expect(await backend.query(api.identity.users.me, {})).toBeNull();
  await expect(
    backend.mutation(api.identity.users.setUsername, { username: "Urza" })
  ).rejects.toThrow(rejection("UNAUTHENTICATED"));
});

test("a player chooses a username", async () => {
  const backend = startBackend();
  const player = await signIn(backend, "placeholder");

  await player.as.mutation(api.identity.users.setUsername, {
    username: "  Mishra   the  Artificer ",
  });

  const me = await player.as.query(api.identity.users.me, {});
  expect(me?.username).toBe("Mishra the Artificer");
});

test("blank and overlong usernames are refused", async () => {
  const backend = startBackend();
  const player = await signIn(backend, "placeholder");

  for (const username of ["   ", "x".repeat(25)]) {
    await expect(
      player.as.mutation(api.identity.users.setUsername, { username })
    ).rejects.toThrow(rejection("INVALID_USERNAME"));
  }
});
