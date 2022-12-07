/* eslint-disable @typescript-eslint/ban-types */
import { queue } from 'event-toolkit'
import { Class } from 'everyday-types'
import { WeakMapFactory } from 'everyday-utils'
import { effect } from 'minimal-reactive'

export * from 'everyday-types'

import { Fiber } from './fiber'
import { hook, Hook } from './jsx-runtime'
import { State } from './state'

export * from './web'

export { render } from 'html-vdom'
export { hook, fiber, states }

const fiber = new Fiber()

const states = new WeakMapFactory<Hook, State<any, any>>(State)

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

export type ViewProps = { view: JSX.Element, css: JSX.Element }

export type View<TProps, TLocal> = ((props: TProps) => JSX.Element) & {
  defaultProps?: Record<string, unknown>
  local?: TLocal
  onInit?: (state: State<TProps, ViewProps>, update: () => void) => void
}

export type ViewState<TProps, TLocal> = State<TProps, TLocal & ViewProps & { $: ViewState<TProps, TLocal> }>

// export function view<TProps, TEffect extends (
//   state: ViewState<TProps, ViewProps>
// ) => (($: TProps & ViewProps) => void) | void>(
//   props: Class<TProps>,
//   fn: TEffect
// ): View<TProps, void>

// export function view<TProps, TLocal, TEffect extends (
//   state: ViewState<TProps, TLocal>
// ) => (($: TProps & TLocal & ViewProps) => void) | void>(
//   props: Class<TProps>,
//   local: Class<TLocal>,
//   fn: TEffect
// ): View<TProps, TLocal>

export function view<TProps, TLocal, TActions, TEffect extends (
  state: ViewState<TProps, TLocal & TActions>
) => (($: TProps & TLocal & TActions & ViewProps) => void) | void>(
  defaultProps: Class<TProps>,
  local: Class<TLocal> | TEffect,
  actions: (
    state: ViewState<TProps, TLocal>
  ) => TActions,
  fn: TEffect
): View<TProps, TLocal & TActions> {
  // if (!isClass(local)) {
  //   // @ts-ignore
  //   fn = local; local = class { }
  // }

  const viewFunc: View<TProps, TLocal & TActions> = function viewFn(props: any) {
    hook.state ??= (() => {
      const state = new State(
        fiber,
        {
          __style: '',
          view: void 0,
          ...viewFunc.defaultProps,
          ...new defaultProps(),
          ...props
        },
        local as Class<TLocal>
      )

      const self = hook
      const update = queue.task(hook)

      viewFunc.onInit?.(state as any, update)

      state.fx(function updateView({ view: _ }) {
        update()
      })

      hook.once('remove', () => {
        self.__dispose?.(state.$)
        state.dispose()
      })

      return state
    })()

    if (!hook.__dispose) {
      Object.assign(hook.state.$, actions(hook.state))
      // console.log(actions?.toString(), fn?.toString())
      hook.__dispose ??= ((fn as any)(hook.state) ?? (() => { }))
    }

    Object.assign((hook.state as any).$, props)

    return [
      (hook.state as any).$.__style,
      (hook.state as any).$.view
    ]
  }

  return viewFunc
}
