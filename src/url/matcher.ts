const OPTIONAL = /\((.*?)\)/g;
const PARAM = /:\w+/g;
const TO_ESCAPE = /[-{}[\]+?.,\\^$|#\s]/g;
const ALL = /\*/g;

const ESCAPED_CHARS = "\\$&";
const OPTIONAL_MATCH = "(?:$1)?";
const PARAM_MATCH = "([^/?]+)";
const CATCH_ALL_MATCH = "([^?]*?)";

interface RouteDefinition<T> {
  page: T;
  regexp: RegExp;
  params: string[];
}

interface RouteResult<T> {
  page: T;
  url: string;
  params: Record<string, string>;
  pattern: string;
}

type RoutesInput<T> = Record<string, T>;
type RouteIndex<T> = [string, RouteDefinition<T>];
type RouteMatcher<T> = (url: string) => RouteResult<T> | undefined;

const createDefinition = <T>([pattern, page]: [string, T]): RouteDefinition<T> => {
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
    page,
    params,
    regexp: new RegExp(`^${matchPattern}(?:\\?([\\s\\S]*))?$`),
  };
};

const getDefinition = <T>(route: [string, unknown]): RouteDefinition<T> => {
  if (!(route as RouteIndex<T>)[1].regexp) {
    route[1] = createDefinition(route);
  }
  return route[1] as RouteDefinition<T>;
};

const extractMatchedParams = (matches: RegExpExecArray, params: string[]) =>
  params.reduce<Record<string, string>>((matched, param, index) => {
    const value = matches[index + 1];
    if (value) {
      matched[param] = value;
    }
    return matched;
  }, {});

export const createMatcher = <T>(routes: RoutesInput<T>): RouteMatcher<T> => {
  const indexedRoutes = Object.entries<unknown>(routes);
  return (url) => {
    for (const route of indexedRoutes) {
      const { regexp, params, page } = getDefinition<T>(route);
      const matches = regexp.exec(url);
      if (matches) {
        return {
          page,
          url,
          params: extractMatchedParams(matches, params),
          pattern: route[0],
        };
      }
    }
  };
};
