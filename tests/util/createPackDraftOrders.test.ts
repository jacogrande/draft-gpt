import { expect, test } from "bun:test";
import { createPackDraftOrders } from "~/util/createPackDraftOrders";

test("creates pack orders", () => {
  const userIds = ["a", "b", "c"];
  const packOrders = createPackDraftOrders(userIds);
  expect(packOrders.length).toBe(userIds.length);
  expect(packOrders[0]).toEqual(["a", "b", "c"]);
  expect(packOrders[1]).toEqual(["b", "c", "a"]);
  expect(packOrders[2]).toEqual(["c", "a", "b"]);
});
