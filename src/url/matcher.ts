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
  params: Readonly<Record<string, string>>;
}
export type RouteMatcher = (url: string) => MatchResult;

interface MatchDefinition {
  page: string;
  regexp: RegExp;
  params: ReadonlyArray<string>;
}

const createMatchDefinition = ([pattern, page]: [string, string]): MatchDefinition => {
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
  return {
    regexp: new RegExp(`^${matchPattern}(?:\\?([\\s\\S]*))?$`),
    page,
    params,
  };
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

/**
 * Ugly function for lazy-loading MatchDefinitions
 */
const getMatchDefinition = (route: [string, unknown]): MatchDefinition =>
  ((route[1] as string).length !== undefined
    ? (route[1] = createMatchDefinition(route as [string, string]))
    : route[1]) as MatchDefinition;

export const createMatcher = (routes: Record<string, string>, fallback: string): RouteMatcher => {
  const indexedRoutes = Object.entries(routes);
  return (url) => {
    for (const route of indexedRoutes) {
      const { regexp, page, params } = getMatchDefinition(route);
      const matches = regexp.exec(url);
      if (matches) {
        return {
          page,
          params: extractMatchedParams(matches, params),
        };
      }
    }
    return {
      page: fallback,
      params: {
        url,
      },
    };
  };
};
