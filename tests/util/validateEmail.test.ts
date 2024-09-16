import { validateEmail } from "~/util/validateEmail";
import { expect, test } from "bun:test";

test("confirms valid email", () => {
  expect(validateEmail("test@example.com")).toBe(true);
});

test("denies invalid emails", () => {
  expect(validateEmail("test@example")).toBe(false);
  expect(validateEmail("test@example.com.")).toBe(false);
  expect(validateEmail("testasdfj")).toBe(false);
});
