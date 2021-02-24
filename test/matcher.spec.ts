import { expect } from "chai";
import { createMatcher } from "../src";

type TestCase = [string, string, [string, Record<string, string>], string];

const cases: TestCase[] = [
  ["/:first/:second", "/ok", ["404", { url: "/ok" }], "should not match if missing required params"],
  ["/:first", "/ok", ["success", { first: "ok" }], "should extract simple, named params"],
  ["/:first/", "/ok", ["404", { url: "/ok" }], "should not tolerate missing trailing slashes"],
  ["/:first/", "/ok/", ["success", { first: "ok" }], "should tolerate trailing slashes when explicit"],
  ["/:first/:second", "/ok/", ["404", { url: "/ok/" }], "should not match if has slash but no value"],
  ["/:first/:second", "/ok/second", ["success", { first: "ok", second: "second" }], "can extract two values"],
  [
    "/:first(/:second)",
    "/ok/second",
    ["success", { first: "ok", second: "second" }],
    "second value optional and is supplied",
  ],
  ["/:first(/go/:second)", "/ok", ["success", { first: "ok" }], "second value optional and not supplied"],
  [
    "/:first(/go/:second)",
    "/ok/go/4",
    ["success", { first: "ok", second: "4" }],
    "second group optional and is supplied",
  ],
  [
    "/:first(/go/:second)(/do/:third)",
    "/ok/do/4",
    ["success", { first: "ok", third: "4" }],
    "third optional group is provided while second optional is not supplied",
  ],
  [
    "#(:first)(/go/:second)(/do/:third)",
    "#/go/4",
    ["success", { second: "4" }],
    "with all optional match groups, should provide only second match group from url",
  ],
  [
    "#(:first)(/go/:second)(/do/:third)",
    "#yeet/go/4",
    ["success", { first: "yeet", second: "4" }],
    "with all optional match groups, should provide only first & second match groups from url",
  ],
  [
    "#(:first)(/go/:second)(/do/:third)",
    "#yeet",
    ["success", { first: "yeet" }],
    "with all optional match groups, should provide first match group from url",
  ],
  [
    "(/section/:first)(/go/:second)(/do/:third)",
    "/section/5",
    ["success", { first: "5" }],
    "with all optional match groups, should provide only second match group from url",
  ],
  ["/users/:id", "/something-else", ["404", { url: "/something-else" }], "should not match top level url component"],
  [
    "/users/:id",
    "/users/scrooge-mc-duck",
    ["success", { id: "scrooge-mc-duck" }],
    "should match the value in url",
  ],
  ["/users/(:id)", "/users/", ["success", {}], "should match without the optional value in url"],
  [
    "/schools/:schoolId/teachers/:teacherId",
    "/schools/richland/teachers/47",
    ["success", { schoolId: "richland", teacherId: "47" }],
    "should match all multiple values in url",
  ],
  [
    "/random/*",
    "/random/something/stuff",
    ["success", { path: "something/stuff" }],
    "should pass the matched catch-all url component as path",
  ],
  [
    "*",
    "/sdfasfas",
    ["success", { path: "/sdfasfas" }],
    "should pass the top-level catch-all in its entirety as path",
  ],
];

describe("createMatcher", () => {
  const SOME_PAGE = "success";
  for (const [pattern, url, [expectedPage, expectedParams], description] of cases) {
    it(description, () => {
      const result = createMatcher({
        [pattern]: SOME_PAGE,
      }, "404")(url);
      expect(result).to.deep.equal({
        page: expectedPage,
        params: expectedParams,
      });
    });
  }

  it("can match multiple times after initialisation with the same pattern", () => {
    const matcher = createMatcher({
      "/:page": SOME_PAGE,
    }, "404");

    expect(matcher("/a")?.page).to.equal(SOME_PAGE);
    expect(matcher("/b")?.page).to.equal(SOME_PAGE);
  });
});
