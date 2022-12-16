/* eslint-disable @typescript-eslint/ban-types */
import { Class } from 'everyday-types'
import { State } from './state'
import { fiber } from './fiber'

export type Reactive<TName extends string = any, TProps = any, TLocal = any> = State<TName, TProps, TLocal>

export type ReactiveFactory<TName extends string, TProps, TLocal> = {
  (props: TProps): Reactive<TName, TProps, TLocal>
  $: Reactive<TName, TProps, TLocal>['$']
  State: Reactive<TName, TProps, TLocal>
}

export function reactive<TName extends string, TProps, TLocal, TActions, TEffect extends (
  state: Reactive<TName, TProps, TLocal & TActions>
) => (($: Reactive<TName, TProps, TLocal & TActions>['$']) => void) | void>(
  name: TName,
  defaultProps: Class<TProps>,
  ctor: Class<TLocal>,
  actions: (
    state: Reactive<TName, TProps, TLocal>
  ) => TActions,
  fn: TEffect
): ReactiveFactory<TName, TProps, TLocal & TActions> {
  function create(props: TProps) {
    const state = new State(
      name,
      fiber,
      {
        ...new defaultProps(),
        ...props
      },
      ctor
    ) as Reactive<TName, TProps, TLocal>

    state.name = name

    Object.assign(state.$, actions(state))

    const stateWithActions = state as Reactive<TName, TProps, TLocal & TActions>

    stateWithActions.fx(() => {
      const off = fn(stateWithActions)
      return () => off?.(stateWithActions.$)
    })

    return stateWithActions
  }

  create.$ = {} as any
  create.State = {} as any

  return create
}
