import { MatchResult, extract, parse, stringify, RoutesInput, createMatcher } from "../url";

const EMPTY = Object.freeze({});

const QUERY = /\?.*/;
const PATH_MATCHER = /(:[^/]*)/g;

const enum StateMode {
  REPLACE = "replaceState",
  PUSH = "pushState",
}

const enum Mode {
  HISTORY = "history",
  HASHBANG = "hashbang",
  PLAINHASH = "plainhash",
}

const RootPaths: Record<string, string> = {
  history: "",
  hashbang: "#!",
  plainhash: "#",
};

type ConvertMatchToRoute = (
  match: MatchResult,
  queryParams: Record<string, string>,
  replace: boolean
) => Route;

interface RouterOpts {
  routes: RoutesInput;
  mode: Mode;
  queryMode?: boolean;
  glw?: Window & typeof globalThis;
}

interface Route {
  page: string;
  params: Readonly<Record<string, string>>;
  query: Readonly<Record<string, string>>;
  replace: boolean;
}

interface Router {
  initialRoute: Route;
  init: (onRouteChange: (input: Route) => void) => void;
  syncLocation: (route: Route) => void;
  makeLinkHandler: (url: string) => (ev: Event) => void;
  toRoute: (path: string, replace?: boolean) => Route;
}

const getPathWithoutQuery = (path: string) => path.replace(QUERY, "");

const createGetUrl = (prefix: string, glw: Window & typeof globalThis) => {
  const { decodeURI, location } = glw;
  if (prefix === RootPaths.history) {
    return () => decodeURI(location.pathname + location.search);
  } else {
    return () => decodeURI(location.hash || `${prefix}/`);
  }
};

const stripTrailingSlash = (url: string) => (url.endsWith("/") ? url.slice(0, -1) : url);
const identity = <T>(n: T) => n;

const createToPath = (routeConfig: RoutesInput, getStatePath: (url: string) => string) => {
  const pathLookup = Object.entries(routeConfig).reduce<Record<string, string>>(
    (result, [path, page]) => {
      result[path] = page;
      return result;
    },
    {}
  );

  return (page: string, params: Record<string, string>) => {
    const path = getStatePath(pathLookup[page]);

    return (path.match(PATH_MATCHER) || []).reduce(
      (result, pathParam) =>
        result.replace(new RegExp(pathParam), encodeURI(params[pathParam.slice(1)])),
      path
    );
  };
};

const convertMatchToRoute: ConvertMatchToRoute = ({ page, params }, query, replace) => ({
  page,
  params,
  query,
  replace,
});

export const initRouter = ({
  routes,
  mode = Mode.HASHBANG,
  queryMode = false,
  glw = window,
}: RouterOpts): Router => {
  if (!routes) {
    throw new Error("Routes must be defined");
  }
  const linkCache: Record<string, (ev: Event) => void> = {};
  const matcher = createMatcher(routes);
  const root = RootPaths[mode] || RootPaths.hashbang;
  const getUrl = createGetUrl(root, glw);
  const getPath = () => getUrl().slice(root.length);
  const queryParse = queryMode ? (path: string) => parse(extract(path)) : () => EMPTY;
  const queryStringify = queryMode ? stringify : () => "";
  const getStatePath = mode === Mode.HISTORY ? stripTrailingSlash : identity;

  const toRoute = (path: string, replace = false): Route => {
    const matchPath = getPathWithoutQuery(path);
    const route = matcher(matchPath);
    if (route) {
      return convertMatchToRoute(route, queryParse(path), replace);
    } else {
      throw new Error("Route matcher has no catch-all!");
    }
  };
  const toPath = createToPath(routes, getStatePath);
  const toUrl = ({ page, params, query }: Route) =>
    `${root}${toPath(page, params)}${queryStringify(query)}`;

  let updater: (() => void) | undefined;
  const init = (onRouteChange: (input: Route) => void) => {
    updater = () => onRouteChange(toRoute(getPath()));
    glw.addEventListener("popstate", updater, { passive: true });
  };
  const makeLinkHandler = (url: string) =>
    (linkCache[url] ??= (ev: Event) => {
      ev.preventDefault();
      glw.history.pushState(EMPTY, "", url);
      updater?.();
    });

  const syncLocation = (route: Route) => {
    const update = toUrl(route);
    const location = getUrl();
    if (update !== location) {
      const fn: StateMode = route.replace ? StateMode.REPLACE : StateMode.PUSH;
      glw.history[fn].call(glw.history, EMPTY, "", update);
    }
  };

  return { initialRoute: toRoute(getPath()), init, syncLocation, makeLinkHandler, toRoute };
};
