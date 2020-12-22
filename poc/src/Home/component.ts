import { Component, Router } from "../../../src";
import { HomeActions, HomeState } from "./types";

const nonLoggedPages = ["Home", "404"];

export const HomeComponent = (router: Router): Component<HomeState, HomeActions> => ({
  id: "Home",
  initial: () => ({
    title: "List of Things to do",
  }),
  actions: (update) => ({
    login: (ev) => {
      ev.preventDefault();
      const form = ev.target as HTMLFormElement | null;
      const input = form?.elements.namedItem("username") as HTMLInputElement | null;
      const username = input?.value.trim();
      update({
        username,
      });
    },
    logout: (ev) => {
      ev.preventDefault();
      update({
        username: undefined,
      });
    },
  }),
  service: (state) => {
    if (state.username && state.route.page === "Home") {
      return {
        route: router.toRoute("/tasks", true),
      };
    } else if (!state.username && !nonLoggedPages.includes(state.route.page)) {
      return {
        route: router.toRoute("/", true),
      };
    }
  },
});
