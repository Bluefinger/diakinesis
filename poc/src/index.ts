import { render, html } from "lit-html";
import { createAppContainer, initRouter, Mode } from "../../src";
import { NotFoundView } from "./404";
import { Header } from "./Header";
import { HomeActions, HomeComponent, HomeState, HomeView } from "./Home";
import { RouteHandler, RouteState } from "./router";
import { TasksView } from "./Tasks";

const root = document.createElement("div");
root.id = "app-root";

const routes = {
  "/": "Home",
  "/tasks": "Tasks",
  "/404": "404",
};

const router = initRouter({ routes, mode: Mode.HASHBANG });

const views = {
  Home: HomeView(),
  Tasks: TasksView(),
  404: NotFoundView(),
};

const App = (app: { state: RouteState & HomeState; actions: HomeActions }) => {
  const page = views[app.state.route.page as keyof typeof views];
  return html`<div class="poc">${Header(app)}${page(app)}</div>`;
};

const container = createAppContainer<RouteState & HomeState, HomeActions>();

container.register(RouteHandler(router), HomeComponent(router));

router.init((route) => {
  container.update({ route });
});

container.subscribe((app) => render(App(app), root));

document.body.prepend(root);
