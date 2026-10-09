import { expect, test } from "vitest";
import { passPack } from "./passing";
import { packOrders } from "./seating";

test("each player opens a pack and passes it to the next seat", () => {
  expect(packOrders(["a", "b", "c"], 1)).toEqual([
    ["a", "b", "c"],
    ["b", "c", "a"],
    ["c", "a", "b"],
  ]);
});

test("the second round passes in the opposite direction", () => {
  expect(packOrders(["a", "b", "c"], 2)).toEqual([
    ["c", "b", "a"],
    ["b", "a", "c"],
    ["a", "c", "b"],
  ]);
  expect(packOrders(["a", "b", "c"], 3)).toEqual(packOrders(["a", "b", "c"], 1));
});

test("a pack goes around the table until its last card is taken", () => {
  let pack = {
    order: ["a", "b"],
    position: 0,
    cardCount: 3,
    holderId: "a" as string | null,
  };
  const holders = [];
  while (pack.holderId !== null) {
    holders.push(pack.holderId);
    pack = { ...pack, ...passPack(pack) };
  }
  expect(holders).toEqual(["a", "b", "a"]);
});
