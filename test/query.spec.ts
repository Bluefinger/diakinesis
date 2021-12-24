import { expect } from "chai";
import { extract, parse, stringify } from "../src/url";

describe("query string tools", () => {
  describe("extract", () => {
    it("extracts query from a url string", () => {
      const url1 = "http://localhost/route?query=string+theory&other=1#thing";
      const url2 = "http://localhost/route?query=string%20theory&other=1&other=2";
      const url3 = "http://localhost/route";
      expect(extract(url1)).to.equal("query=string+theory&other=1");
      expect(extract(url2)).to.equal("query=string%20theory&other=1&other=2");
      expect(extract(url3)).to.equal("");
    });
  });

  describe("parse", () => {
    it("parses query string extracted from url", () => {
      const query = extract(
        "http://localhost/route?query=string%20theory+d&other=1&other=2&nulled#thing"
      );
      expect(parse(query)).to.deep.equal({
        query: "string theory d",
        other: ["1", "2"],
        nulled: null,
      });
    });
    it("returns an empty object when it receives invalid input", () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      expect(parse({} as any)).to.deep.equal({});
    });
    it("returns an empty object when given an empty string", () => {
      expect(parse("")).to.deep.equal({});
    });
  });

  describe("stringify", () => {
    it("returns a query string from a key/value object", () => {
      const payload = {
        query: "string theory",
        other: ["1", "2", "", undefined, null],
        nulled: null,
        removed: undefined,
      };
      expect(stringify(payload)).to.equal("?query=string%20theory&other=1&other=2&other&nulled");
    });
    it("returns an empty string from an empty object", () => {
      const payload = {};
      expect(stringify(payload)).to.equal("");
    });
  });
});
