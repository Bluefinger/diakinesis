import { EMPTY } from "../constants";

interface PathLookup {
  path: string;
  match?: [string, string][] | null;
}

type PathResolver = (page: string, params?: Record<string, string>) => string;

export const createToPath = (routeConfig: Record<string, string>): PathResolver => {
  const matchParams = /(:[^/]*)/g;
  const pathLookup = Object.entries(routeConfig).reduce<Record<string, PathLookup>>(
    (result, [path, page]) => {
      result[page] = { path };
      return result;
    },
    {}
  );
  return (page, params = EMPTY) => {
    const lookup = pathLookup[page];
    if (lookup.match === undefined) {
      lookup.match = lookup.path.match(matchParams)?.map((param) => [param, param.slice(1)]);
    }
    return (
      lookup.match?.reduce(
        (result, [param, key]) => result.replace(param, encodeURI(params[key])),
        lookup.path
      ) || lookup.path
    );
  };
};
