import { expect } from "chai";
import { createToPath } from "../src";

const routes = {
  "/": "Home",
  "/users": "Users",
  "/users/:id": "Account",
};

const testCases: [string, string, Record<string, string> | undefined, string][] = [
  ["creates a Home path", "Home", undefined, "/"],
  ["creates a Users path", "Users", undefined, "/users"],
  ["creates a Account path", "Account", { id: "1" }, "/users/1"],
  [
    "ignores params that are not needed for path construction",
    "Account",
    { id: "2", other: "thing" },
    "/users/2",
  ],
  [
    "will not form the path correctly if not given the required params",
    "Account",
    undefined,
    "/users/undefined",
  ],
];

describe("createToPath", () => {
  const toPath = createToPath(routes);
  for (const [description, page, params, result] of testCases) {
    it(description, () => {
      expect(toPath(page, params)).to.equal(result);
    });
  }
});
