import { expect, test } from "vitest";
import { basicLand } from "../../convex/deck/zones";
import { attemptToAddMana } from "~/util/attemptToAddMana";

test.each([
  ["W", "plains"],
  ["U", "island"],
  ["B", "swamp"],
  ["R", "mountain"],
  ["G", "forest"],
] as const)("selects a matching land for %s regardless of input casing", (symbol, name) => {
  const land = basicLand(name, "land");
  expect(attemptToAddMana(symbol, [land])).toEqual([land]);
  expect(attemptToAddMana(symbol.toLowerCase(), [land])).toEqual([land]);
});

test("reserves colored mana before selecting lands for generic mana", () => {
  const plains = basicLand("plains", "plains");
  const island = basicLand("island", "island");
  expect(attemptToAddMana("1W", [plains, island])).toEqual([plains, island]);
  expect(attemptToAddMana("1W", [plains])).toBeNull();
});

test("rejects missing colors and tapped lands", () => {
  const plains = basicLand("plains", "plains");
  const island = basicLand("island", "island");
  expect(attemptToAddMana("W", [island])).toBeNull();
  expect(attemptToAddMana("W", [{ ...plains, tapped: true }, island])).toBeNull();
  expect(attemptToAddMana("WW", [plains, island])).toBeNull();
});
