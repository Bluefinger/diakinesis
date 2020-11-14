const OPTIONAL = /\((.*?)\)/g;
const PARAM = /:\w+/g;
const TO_ESCAPE = /[-{}[\]+?.,\\^$|#\s]/g;
const ALL = /\*/g;

const ESCAPED_CHARS = "\\$&";
const OPTIONAL_MATCH = "(?:$1)?";
const PARAM_MATCH = "([^/?]+)";
const CATCH_ALL_MATCH = "([^?]*?)";

export interface MatchResult {
  page: string;
  url: string;
  params: Readonly<Record<string, string>>;
  pattern: string;
}
export type RouteMatcher = (url: string) => MatchResult | undefined;
export type RoutesInput = Record<string, string>;

interface MatchDefinition {
  page: string;
  regexp: RegExp;
  params: ReadonlyArray<string>;
}
type RouteIndex = [string, MatchDefinition];

const createIndex = (route: [unknown, unknown]): RouteIndex => {
  const [pattern, page] = route as [string, string];
  const params: string[] = [];
  const matchPattern = pattern
    .replace(TO_ESCAPE, ESCAPED_CHARS)
    .replace(OPTIONAL, OPTIONAL_MATCH)
    .replace(PARAM, (match) => {
      params.push(match.slice(1));
      return PARAM_MATCH;
    })
    .replace(ALL, () => {
      params.push("path");
      return CATCH_ALL_MATCH;
    });
  route[1] = {
    regexp: new RegExp(`^${matchPattern}(?:\\?([\\s\\S]*))?$`),
    page,
    params,
  };
  return route as RouteIndex;
};

const extractMatchedParams = (
  matches: RegExpExecArray,
  params: ReadonlyArray<string>
): Readonly<Record<string, string>> => {
  const extracted: Record<string, string> = {};
  for (let i = params.length; i--; ) {
    const value = matches[i + 1];
    if (value) {
      extracted[params[i]] = value;
    }
  }
  return extracted;
};

export const createMatcher = (routes: RoutesInput): RouteMatcher => {
  const indexedRoutes = Object.entries(routes).map(createIndex);
  return (url) => {
    for (const [pattern, { regexp, params, page }] of indexedRoutes) {
      const matches = regexp.exec(url);
      if (matches) {
        return {
          page,
          url,
          params: extractMatchedParams(matches, params),
          pattern,
        };
      }
    }
  };
};
