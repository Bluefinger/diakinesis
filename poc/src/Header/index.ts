import { html, TemplateResult } from "lit-html";

export const Header = <
  State extends Record<string, unknown>,
  Actions extends Record<string, (...args: any[]) => void>
>({
  state,
  actions,
}: {
  state: State;
  actions: Actions;
}): TemplateResult =>
  html`<header>
    <h1>${state.username ? `${state.title}: ${state.username}` : state.title}</h1>
    <p>${state.username ? html`<button @click=${actions.logout}>Log out</button>` : null}</p>
  </header>`;
