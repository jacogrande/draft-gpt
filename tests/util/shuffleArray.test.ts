import shuffleArray from "~/util/shuffleArray";
import { expect, test } from "bun:test";

test("shuffles an array", () => {
  const array = [1, 2, 3, 4, 5];
  const shuffledArray = shuffleArray(array);
  expect(shuffledArray).not.toEqual(array);
});
