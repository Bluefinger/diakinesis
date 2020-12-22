import { html } from "lit-html";
import { ViewFn } from "../../../src";

export const TasksView = (): ViewFn<any, any> => () => {
  return html`<div class="tasks">
    <div class="task-list">Showing tasks:</div>
  </div>`;
};
