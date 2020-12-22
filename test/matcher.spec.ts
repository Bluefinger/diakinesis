import { expect } from "chai";
import { createMatcher } from "../src";

type TestCase = [string, string, Record<string, string> | undefined, string];

const cases: TestCase[] = [
  ["/:first/:second", "/ok", undefined, "should not match if missing required params"],
  ["/:first", "/ok", { first: "ok" }, "should extract simple, named params"],
  ["/:first/", "/ok", undefined, "should not tolerate missing trailing slashes"],
  ["/:first/", "/ok/", { first: "ok" }, "should tolerate trailing slashes when explicit"],
  ["/:first/:second", "/ok/", undefined, "should not match if has slash but no value"],
  ["/:first/:second", "/ok/second", { first: "ok", second: "second" }, "can extract two values"],
  [
    "/:first(/:second)",
    "/ok/second",
    { first: "ok", second: "second" },
    "second value optional and is supplied",
  ],
  ["/:first(/go/:second)", "/ok", { first: "ok" }, "second value optional and not supplied"],
  [
    "/:first(/go/:second)",
    "/ok/go/4",
    { first: "ok", second: "4" },
    "second group optional and is supplied",
  ],
  [
    "/:first(/go/:second)(/do/:third)",
    "/ok/do/4",
    { first: "ok", third: "4" },
    "third optional group is provided while second optional is not supplied",
  ],
  [
    "#(:first)(/go/:second)(/do/:third)",
    "#/go/4",
    { second: "4" },
    "with all optional match groups, should provide only second match group from url",
  ],
  [
    "#(:first)(/go/:second)(/do/:third)",
    "#yeet/go/4",
    { first: "yeet", second: "4" },
    "with all optional match groups, should provide only first & second match groups from url",
  ],
  [
    "#(:first)(/go/:second)(/do/:third)",
    "#yeet",
    { first: "yeet" },
    "with all optional match groups, should provide first match group from url",
  ],
  [
    "(/section/:first)(/go/:second)(/do/:third)",
    "/section/5",
    { first: "5" },
    "with all optional match groups, should provide only second match group from url",
  ],
  ["/users/:id", "/something-else", undefined, "should not match top level url component"],
  [
    "/users/:id",
    "/users/scrooge-mc-duck",
    { id: "scrooge-mc-duck" },
    "should match the value in url",
  ],
  ["/users/(:id)", "/users/", {}, "should match without the optional value in url"],
  [
    "/schools/:schoolId/teachers/:teacherId",
    "/schools/richland/teachers/47",
    { schoolId: "richland", teacherId: "47" },
    "should match all multiple values in url",
  ],
  [
    "/random/*",
    "/random/something/stuff",
    { path: "something/stuff" },
    "should pass the matched catch-all url component as path",
  ],
  [
    "*",
    "/sdfasfas",
    { path: "/sdfasfas" },
    "should pass the top-level catch-all in its entirety as path",
  ],
];

describe("createMatcher", () => {
  const SOME_PAGE = "PAGE";
  for (const [pattern, url, expectedResult, description] of cases) {
    it(description, () => {
      const result = createMatcher({
        [pattern]: SOME_PAGE,
      })(url);
      if (result) {
        if (!expectedResult) {
          expect.fail(result, expectedResult, "should not have gotten a match");
        }
        expect(result).to.deep.equal({
          page: SOME_PAGE,
          params: expectedResult,
        });
      } else {
        if (expectedResult) {
          expect.fail(
            result,
            expectedResult,
            `should have gotten a match, pattern: ${pattern} url: ${url}`
          );
        }
        expect(result).to.equal(expectedResult);
      }
    });
  }

  it("can match multiple times after initialisation with the same pattern", () => {
    const matcher = createMatcher({
      "/:page": SOME_PAGE,
    });

    expect(matcher("/a")?.page).to.equal(SOME_PAGE);
    expect(matcher("/b")?.page).to.equal(SOME_PAGE);
  });
});
