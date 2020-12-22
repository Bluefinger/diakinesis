import { html } from "lit-html";
import { ViewFn } from "../../../src";

export const NotFoundView = (): ViewFn<any, any> => () => {
  return html`<div class="error-404">
    <div class="error-message">404 not found</div>
  </div>`;
};
