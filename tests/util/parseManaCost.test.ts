import { expect, test } from "bun:test";
import { parseManaCost } from "~/util/parseManaCost";

test("parses all colors", () => {
  const manaCost = "WUBRG";
  const symbols = parseManaCost(manaCost);
  expect(symbols).toEqual(["W", "U", "B", "R", "G"]);
});

test("parses complex mana costs", () => {
  const manaCost = "2WWB";
  const symbols = parseManaCost(manaCost);
  expect(symbols).toEqual(["2", "W", "W", "B"]);
  const manaCost2 = "11R";
  const symbols2 = parseManaCost(manaCost2);
  expect(symbols2).toEqual(["11", "R"]);
});
