import { html } from "lit-html";
import { ViewFn } from "../../../src";
import { HomeActions, HomeState } from "./types";

export const HomeView = (): ViewFn<HomeState, HomeActions> => (app) => {
  const { actions } = app;
  return html`<div class="home">
    <form @submit=${actions.login}>
      <input type="text" id="username" />
      <button type="submit">Log in</button>
    </form>
  </div>`;
};
