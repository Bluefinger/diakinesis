import { Component, Route, Router } from "../../../src";

export type RouteState = {
  route: Route;
} & Record<string, unknown>;

export const RouteHandler = ({
  initialRoute,
  syncLocation,
}: Router): Component<RouteState, Record<string, any>> => {
  return {
    id: "router",
    initial: () => ({ route: initialRoute }),
    effects: () => ({ route }) => {
      syncLocation(route);
    },
  };
};
