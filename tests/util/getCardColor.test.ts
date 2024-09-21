import { expect, test } from "bun:test";
import { getCardColor } from "~/util/getCardColor";

test("returns colorless for empty string", () => {
  expect(getCardColor("")).toBe("colorless");
});

test("returns multi for multiple indicators", () => {
  expect(getCardColor("1RW")).toBe("multi");
  expect(getCardColor("wRRbbbuu")).toBe("multi");
  expect(getCardColor("gurb")).toBe("multi");
});

test("returns color for single indicator", () => {
  expect(getCardColor("5r")).toBe("red");
  expect(getCardColor("www")).toBe("white");
  expect(getCardColor("u")).toBe("blue");
  expect(getCardColor("1bb")).toBe("black");
  expect(getCardColor("g")).toBe("green");
});

test("returns colorless for no indicators", () => {
  expect(getCardColor("8")).toBe("colorless");
  expect(getCardColor("0")).toBe("colorless");
});
