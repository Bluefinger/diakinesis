import { expect } from "chai";
import { map, reduce, filter, uniqueMap, flatten } from "../src/iterables";

const iterable = new Set([1, 2, 3, 4]);

describe("iterator methods", () => {
  describe("map", () => {
    it("takes a iterable and maps it into an array of new values", () => {
      const mapped = map(iterable, (n) => n * 2);
      expect([...mapped]).to.deep.equal([2, 4, 6, 8]);
    });
  });
  describe("reduce", () => {
    it("takes an iterable and reduces it into a single value", () => {
      const reduced = reduce(0, iterable, (acc, val) => acc + val);
      expect(reduced).to.equal(10);
    });
  });
  describe("filter", () => {
    it("takes an iterable and filters values that don't pass the condition", () => {
      const filtered = filter(iterable, (n) => n % 2 === 0);
      expect([...filtered]).to.deep.equal([2, 4]);
    });
  });
  describe("uniqueMap", () => {
    it("takes an iterable and maps unique values into a new array", () => {
      const values = [1, 2, 2, 3, 3, 3, 4];
      const uniqued = uniqueMap(values, (n) => n * 2);
      expect([...uniqued]).to.deep.equal([2, 4, 6, 8]);
    });
  });
  describe("flatten", () => {
    it("flattens a single level of nested iterables into a flat array", () => {
      const notFlat = [[1, 2], [3, 4, 5], 6];
      const flattened = flatten(notFlat);
      expect([...flattened]).to.deep.equal([1, 2, 3, 4, 5, 6]);
    });
  });
});
