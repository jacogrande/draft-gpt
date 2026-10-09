import { expect, test } from "vitest";
import { pickSchool, SCHOOLS } from "./artSchools";

test("every roll from 0 to 1 lands on a school, and every school can be reached", () => {
  const reached = new Set(
    Array.from({ length: 1001 }, (_, step) => pickSchool(step / 1000).name)
  );

  expect(reached.size).toBe(SCHOOLS.length);
  expect(new Set(SCHOOLS.map((school) => school.name)).size).toBe(
    SCHOOLS.length
  );
});
