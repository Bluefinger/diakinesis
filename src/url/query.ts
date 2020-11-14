export type QueryValues = string | number | boolean | null | undefined;

const CLEAN = /^[?#&]/;
const PLUS = /\+/g;
const AMPERSAND = "&";
const EMPTY = "";
const EQUAL = "=";
const STRING = "string";
const SPACE = " ";
const HASH = "#";
const QUESTION = "?";

const encode = (value: string | number | boolean) => encodeURIComponent(value);
const decode = (value: string) => decodeURIComponent(value);

const concatString = (result: string, value: string) =>
  result.concat(result ? AMPERSAND : EMPTY, value);

const splitOnFirst = (value: string, seperator: string): [string, string | null] => {
  const index = value.indexOf(seperator);
  return index >= 0 ? [value.slice(0, index), value.slice(index + 1)] : [value, null];
};

const encodeForArray = (key: string) => (result: string, value: QueryValues) => {
  if (value === null) {
    return concatString(result, encode(key));
  } else if (!(value === undefined || value === EMPTY)) {
    return concatString(result, `${encode(key)}=${encode(value)}`);
  }
  return result;
};

const parseForArray = (key: string, value: QueryValues, accumulator: Record<string, any>) => {
  if (accumulator[key] === undefined) {
    accumulator[key] = value;
  } else {
    accumulator[key] = Array.prototype.concat(accumulator[key], value);
  }
};

const removeHash = (value: string): string => {
  const hash = value.indexOf(HASH);
  if (hash >= 0) {
    return value.slice(0, hash);
  }
  return value;
};

export const extract = (value: string): string => {
  const deHashed = removeHash(value);
  const query = deHashed.indexOf(QUESTION);
  if (query >= 0) {
    return deHashed.slice(query + 1);
  }
  return EMPTY;
};

export const parse = (input: string): Readonly<Record<string, string>> => {
  const res = {} as Record<string, string>;
  if (typeof input === STRING) {
    input = input.trim().replace(CLEAN, EMPTY);
    if (input) {
      for (const param of input.split(AMPERSAND)) {
        const [key, value] = splitOnFirst(param.replace(PLUS, SPACE), EQUAL);
        parseForArray(decode(key), value !== null ? decode(value) : value, res);
      }
    }
  }
  return res;
};

export const stringify = (input: Record<string, QueryValues | QueryValues[]>): string => {
  let res = EMPTY;
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined) continue;
    else if (value === null) res = concatString(res, encode(key));
    else if (Array.isArray(value)) {
      res = concatString(res, value.reduce(encodeForArray(key), EMPTY));
    } else {
      res = concatString(res, `${encode(key)}=${encode(value)}`);
    }
  }
  return res.length ? `?${res}` : res;
};
