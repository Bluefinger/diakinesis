import { expect } from "chai";
import Sinon, { spy, useFakeTimers } from "sinon";
import { createAppContainer, Component } from "../src/container";

describe("createAppContainer", () => {
  const clock = useFakeTimers();

  it("creates a state container that you can subscribe to", async () => {
    const app = createAppContainer();
    const spiedSubscribeFn = spy(({ state, actions }) => {
      expect(state).to.deep.equal({});
      expect(actions).to.deep.equal({});
    });
    app.subscribe(spiedSubscribeFn);
    expect(spiedSubscribeFn.callCount).to.equal(0);
    await clock.runToLastAsync();
    expect(spiedSubscribeFn.callCount).to.equal(1);
  });

  it("can registers a component, initialising its initial state", async () => {
    const app = createAppContainer<Record<string, any>>();
    const initial = spy(() => ({ field: "something" }));
    const component: Component<Record<string, any>, Record<string, any>> = {
      id: "component",
      initial,
    };
    app.register(component);
    app.subscribe(({ state }) => {
      expect(state).to.deep.equal({ field: "something" });
    });
    await clock.runToLastAsync();
    expect(initial.callCount).to.equal(1);
  });

  it("can register a component's actions", async () => {
    const app = createAppContainer<Record<string, any>>();
    const componentActions = {
      test: spy(),
    };
    const component: Component<Record<string, any>, Record<string, any>> = {
      id: "component",
      actions: () => componentActions,
    };
    app.register(component);
    app.subscribe(({ actions }) => {
      expect(actions).to.deep.equal(componentActions);
    });
    await clock.runToLastAsync();
  });

  it("can register a component's service", async () => {
    const app = createAppContainer<Record<string, any>>();
    const service = spy(() => ({
      field: (val: string) => `serviced:${val}`,
    }));
    const component: Component<Record<string, any>, Record<string, any>> = {
      id: "component",
      initial: () => ({ field: "something" }),
      service,
    };
    app.register(component);
    app.subscribe(({ state }) => {
      expect(state).to.deep.equal({ field: "serviced:something" });
    });
    await clock.runToLastAsync();
    expect(service.callCount).to.equal(1);
  });

  it("can register a component's effects", async () => {
    const app = createAppContainer<Record<string, any>, Record<string, Sinon.SinonSpy>>();
    const component: Component<Record<string, any>, Record<string, Sinon.SinonSpy>> = {
      id: "component",
      initial: () => ({}),
      actions: () => ({
        test: spy(),
      }),
      effects: (_, actions) => () => {
        actions.test();
      },
    };
    app.register(component);
    app.subscribe(({ actions }) => {
      expect(actions.test.callCount).to.equal(1);
    });
    await clock.runToLastAsync();
  });

  after(() => {
    clock.uninstall();
  });
});
