import type { Stream } from "rythe";
import type { ObjectPatch, FunctionPatch } from "mergerino";

type inferComponent<
  Comp extends Component<any, any>,
  State extends Record<string, unknown>,
  Actions extends Record<string, (...args: any[]) => void>
> = Comp extends Component<infer S, infer A>
  ? Component<State extends S ? S : never, Actions extends A ? A : never>
  : never;

export type Patch<State extends Record<string, unknown>> =
  | ObjectPatch<State>
  | FunctionPatch<State>;

export type PatchFn<State extends Record<string, unknown>> = (state: State) => State;

export type Action = (...args: any[]) => void;
export type Effect<S extends Record<string, unknown>, A extends Record<string, Action>> = (
  update: Stream<Patch<S>>,
  actions: A
) => EffectFn<S>;
export type EffectFn<S extends Record<string, unknown>> = (state: S) => void;

export type Service<S extends Record<string, unknown>> = (state: S) => Patch<S> | undefined;

export type Register<
  Components extends Component<any, any>[],
  State extends Record<string, unknown>,
  Actions extends Record<string, (...args: any[]) => void>
> = {
  [I in keyof Components]: Components[I] extends Component<any, any>
    ? inferComponent<Components[I], State, Actions>
    : never;
};

export interface Component<
  State extends Record<string, unknown>,
  Actions extends Record<string, (...args: any[]) => void>
> {
  id: string;
  initial?: PatchFn<State>;
  actions?: (updater: Stream<Patch<State>>) => Actions;
  effects?: Effect<State, Actions>;
  service?: Service<State>;
}

export type ViewFn<
  State extends Record<string, unknown>,
  Actions extends Record<string, (...args: any[]) => void>
> = (app: { state: State; actions: Actions }) => void;

export interface App<
  State extends Record<string, unknown>,
  Actions extends Record<string, (...args: any[]) => void>
> {
  register: <Components extends Component<any, any>[]>(
    ...components: Components & Register<Components, State, Actions>
  ) => void;
  subscribe: (fn: (app: { state: State; actions: Actions }) => void) => void;
}
