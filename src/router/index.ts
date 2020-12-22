import { EMPTY } from "../constants";
import { MatchResult, extract, parse, stringify, createMatcher, createToPath } from "../url";

const QUERY = /\?.*/;

export const enum StateMode {
  REPLACE = "replaceState",
  PUSH = "pushState",
}

export const enum Mode {
  HISTORY = "history",
  HASHBANG = "hashbang",
  PLAINHASH = "plainhash",
}

const RootPaths: Record<Mode, string> = {
  history: "",
  hashbang: "#!",
  plainhash: "#",
};

type ConvertMatchToRoute = (
  match: MatchResult,
  queryParams: Record<string, string>,
  replace: boolean
) => Route;

export interface RouterOpts {
  routes: Record<string, string>;
  mode: Mode;
  queryMode?: boolean;
  glw?: Window & typeof globalThis;
}

export interface Route {
  page: string;
  params: Readonly<Record<string, string>>;
  query: Readonly<Record<string, string>>;
  replace: boolean;
}

export interface Router {
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

const convertMatchToRoute: ConvertMatchToRoute = (match, query, replace) => ({
  ...match,
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
  const matcher = createMatcher(routes, "404");
  const root = RootPaths[mode] || RootPaths.hashbang;
  const getUrl = createGetUrl(root, glw);
  const getPath = () => getUrl().slice(root.length);
  const queryParse = queryMode ? (path: string) => parse(extract(path)) : () => EMPTY;
  const queryStringify = queryMode ? stringify : () => "";

  const toRoute = (path: string, replace = false): Route =>
    convertMatchToRoute(matcher(getPathWithoutQuery(path)), queryParse(path), replace);
  const toPath = createToPath(routes);
  const toUrl = ({ page, params, query }: Route) =>
    `${root}${toPath(page, params)}${queryStringify(query)}`;

  let updater: ((ev?: Event) => void) | undefined;
  const init = (onRouteChange: (input: Route) => void) => {
    updater = (ev?: Event) => {
      ev?.preventDefault();
      onRouteChange(toRoute(getPath()));
    };
    glw.onpopstate = updater;
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
