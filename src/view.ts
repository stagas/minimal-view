/* eslint-disable @typescript-eslint/ban-types */
import { queue } from 'event-toolkit'
import { Class } from 'everyday-types'
import { accessors } from 'everyday-utils'
// import { WeakMapFactory } from 'everyday-utils'
import { Dep, deps, effect } from 'minimal-reactive'

export * from 'everyday-types'

import { fiber } from './fiber'
import { hook, Hook } from './jsx-runtime'
import { State } from './state'

export * from './web'

export { render } from 'html-vdom'
export { hook }

// const states = new WeakMapFactory<Hook, State<any, any>>(State)

export function enableDebug(maxUpdates = 2000, maxUpdatesWithinMs = 10) {
  fiber.on('flushstart', () => {
    console.log('****** FLUSH START ******')
  })
  fiber.on('flushend', () => {
    console.log('****** FLUSH END ******')
  })
  effect.maxUpdates = maxUpdates
  effect.maxUpdatesWithinMs = maxUpdatesWithinMs
  effect.debug = (changed, fn, ...stackErr) => {
    console.groupCollapsed(...changed)
    console.log((fn as any).source)
    stackErr.forEach(err => console.warn(err))
    console.groupEnd()
  }
}

export type ViewLocal = {
  view: JSX.Element,
  css?: JSX.Element
  __style: string,
}

export type ViewState<TName extends string, TProps, TLocal> =
  State<TName, TProps, TLocal & ViewLocal>

export type View<TName extends string, TProps, TLocal> = {
  (props: TProps): JSX.Element
  $: ViewState<TName, TProps, TLocal>['$']
  Data: TProps & TLocal
  Hook: Hook<{ state: ViewState<TName, TProps, TLocal> }>
  viewName: TName
  defaultProps?: Record<string, unknown>
  local?: TLocal
  onInit?: (state: ViewState<TName, TProps, TLocal>, update: () => void) => void
}

export function view<
  TName extends string,
  TProps,
  TLocal,
  TActions,
  TEffect extends (
    state: ViewState<TName, TProps, TLocal & TActions>
  ) => (($: TProps & TLocal & TActions) => void) | void
>(
  name: TName,
  defaultProps: Class<TProps>,
  local: Class<TLocal>,
  actions: (
    state: ViewState<TName, TProps, TLocal>
  ) => TActions,
  fn: TEffect
): View<TName, TProps, TLocal & TActions> {
  // if (!isClass(local)) {
  //   // @ts-ignore
  //   fn = local; local = class { }
  // }

  const viewFunc: View<TName, TProps, ViewLocal & TLocal> = function viewFn(props: TProps) {
    const self = hook as Hook<{
      state: ViewState<TName, TProps, TLocal>,
      __dispose: ($: TProps & TLocal & TActions) => void
    }>

    self.state ??= (() => {
      const state = new State(
        name,
        fiber,
        {
          __style: '',
          view: void 0,
          ...viewFunc.defaultProps,
          ...new defaultProps(),
          ...props
        },
        local as any
      ) as ViewState<TName, TProps, TLocal>

      const fns = deps(actions(state) as any)

      accessors(
        state.$,
        fns,
        (_, dep: Dep<any>) =>
          dep.accessors
      )

      Object.assign(state.deps, fns)

      const update = queue.task(self)

      viewFunc.onInit?.(state, update)

      state.fx(function updateView({ view: _ }) {
        update()
      })

      self.once('remove', () => {
        self.__dispose?.(state.$ as any)
        state.dispose()
      })

      return state
    })()

    if (!self.__dispose) {
      const stateWithActions = self.state as ViewState<TName, TProps, TLocal & TActions>
      self.__dispose ??= (fn(stateWithActions) ?? (() => { }))
    }

    Object.assign(self.state.$, props)

    return [
      self.state.$.__style,
      self.state.$.view
    ]
  }

  viewFunc.$ = {} as any
  viewFunc.Data = {} as any
  viewFunc.Hook = {} as any
  viewFunc.viewName = name

  return viewFunc as any
}

export function part(fn: (update: (view: JSX.Element) => void) => void) {
  let update: any
  let view: any

  const trigger = (newView: any) => {
    view = newView
    update?.()
  }

  fn(trigger)

  return () => {
    update = hook
    return view
  }
}
