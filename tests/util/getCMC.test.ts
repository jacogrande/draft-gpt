import { expect, test } from "bun:test";
import { getCMC } from "~/util/getCMC";

test("returns 0 for empty string", () => {
  expect(getCMC("")).toBe(0);
});

test("returns 1 for single digit mana cost", () => {
  expect(getCMC("1")).toBe(1);
  expect(getCMC("W")).toBe(1);
  expect(getCMC("U")).toBe(1);
});

test("returns correct CMC for complex mana costs", () => {
  expect(getCMC("1WW")).toBe(3);
  expect(getCMC("2BU")).toBe(4);
  expect(getCMC("XR")).toBe(1);
});
