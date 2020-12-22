import { RouteState } from "../router";

export type HomeState = {
  title: string;
  username?: string;
} & RouteState &
  Record<string, unknown>;

export type HomeActions = {
  login: (ev: Event) => void;
  logout: (ev: Event) => void;
};
