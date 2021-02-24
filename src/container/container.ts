import { createStream, map as mapStream, scan, defer } from "rythe";
import merge from "mergerino";
import { filter, map } from "../iterables";
import { Service, Action, EffectFn, Component, App, Register, Patch } from "./types";

const filterUndefined = <Value extends unknown>(value: Value | undefined): boolean =>
  value !== undefined;

const executeEffect = function <State extends Record<string, unknown>>(
  this: State,
  effect: EffectFn<State>
) {
  effect(this);
};

export const createAppContainer = <
  State extends Record<string, unknown> = Record<string, never>,
  Actions extends Record<string, Action> = Record<string, never>
>(): App<State, Actions> => {
  const services: Service<State>[] = [];
  const effects: EffectFn<State>[] = [];
  const actions = {} as Actions;
  const update = createStream<Patch<State>>();
  const registered = new Set<string>();

  const serviceAccumulator = (state: State, service: Service<State>): State =>
    merge(state, service(state));
  const serviceLayer = (state: State) => services.reduce(serviceAccumulator, state);

  const states = update.pipe(
    scan<Patch<State>, State>((state, patch) => serviceLayer(merge(state, patch)), {} as State)
  );

  const isNotRegistered = <C extends Component<State, Actions>>({ id }: C) => !registered.has(id);

  const registerComponent = <C extends Component<State, Actions>>({
    id,
    initial,
    actions: newActions,
    service,
    effects: effect,
  }: C) => {
    registered.add(id);
    if (newActions) {
      Object.assign(actions, newActions(update));
    }
    if (service) {
      services.push(service);
    }
    if (effect) {
      effects.push(effect(update, actions));
    }
    return initial?.(states());
  };

  states.pipe(
    mapStream((state) => {
      if (effects.length) {
        effects.forEach(executeEffect, state);
      }
    })
  );
  const deferred = states.pipe(
    defer,
    mapStream((state) => ({ state, actions }))
  );

  return {
    update,
    register: <Components extends Component<State, Actions>[]>(
      ...components: Components & Register<Components, State, Actions>
    ) => {
      const loadedComponents = [...filter(
        map(filter(components, isNotRegistered), registerComponent),
        filterUndefined
      )];
      if (loadedComponents.length) {
        update(merge(states(), loadedComponents));
      }
    },
    subscribe: (fn) => {
      deferred.pipe(mapStream(fn));
    },
  };
};
