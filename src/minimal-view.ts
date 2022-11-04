import { Boxs, Sub, Fx, effect as eff, dep, Dep, Off } from 'minimal-reactive'
import { accessors, entries } from 'everyday-utils'
import { Class } from 'everyday-types'
import { Getter } from 'proxy-toolkit'
import { argtor } from 'argtor'

import { hook, Hook } from './jsx-runtime'

export { render } from 'html-vdom'

export type Deps<T> = {
  [K in keyof T]-?: NonNullable<T[K]>
}

export type Props<T> = {
  effect: (fn: (deps: Deps<T>) => void) => void
  view: JSX.Element
  ref: any
} & {
    [K in keyof T]: T[K]
  }

interface State {
  fx: Sub[]
  pos: number
  deps?: Record<string, Dep<unknown>>
  effects: Map<any, () => void>
  disposes: Set<() => void>
}

let lane: any[] | void
let queue: any[] | void

const states = new WeakMap<Hook, State>()
const disposes = new WeakMap()

function flush() {
  if (queue) {
    for (const thisLane of queue) {
      lane = thisLane
      for (const hook of thisLane) {
        const state = states.get(hook)!

        state.pos = 0

        state.effects.forEach(fn => fn())
        state.effects.clear()

        hook()

        state.disposes.forEach(fn => disposes.get(fn)?.())
        state.disposes.clear()

        state.pos = 0
      }
    }
    queue = lane = void 0
  }
}

function getState(hook: Hook) {
  const current = hook
  if (!current) return void 0 as any

  if (!lane) {
    lane = []
    if (!queue) {
      queue = []
      queueMicrotask(flush)
    }
    queue.push(lane)
  }

  if (!lane.includes(current)) lane.push(current)

  let state: State

  if (states.has(current)) {
    state = states.get(current)!
  } else {
    state = {
      fx: [],
      pos: 0,
      effects: new Map(),
      disposes: new Set(),
    }
    states.set(current, state)
  }

  return state
}

export function use<T>(ctor: Class<T>): Props<T>
export function use<U>(props: U): Props<U>
export function use<T, U>(props: U, ctor?: Class<T>): Props<U & T>
export function use<T, U>(props: U, ctor: Class<T> = class { } as Class<T>): Props<U & T> {
  const state = getState(hook)

  const prev = state.deps

  if (typeof props === 'function') {
    // @ts-ignore
    ctor = props; props = {}
  }

  state.deps ??= Object.fromEntries(
    entries({ ...(new ctor()), ...props } as { [K in keyof T]: T[K] })
      .map(([key, value]) => [key, dep(value)]))

  Object.assign(state, props)

  if (prev !== state.deps) {
    accessors(state, state.deps,
      (_, dep: Dep<any>) => ({
        get() {
          return dep.value
        },
        set(value) {
          dep.value = value
          return true
        }
      })
    )
  }

  state.effect ??= (fn: (deps: T) => Off) => {
    const keys = argtor(fn)
    const deps = Object.fromEntries(
      [...keys].map((key) =>
        [key, state.deps[key]])) as Boxs<T>
    effect(deps, fn)
  }

  state.ref ??= Getter((key) => ({
    get current() {
      return state[key]
    },
    set current(el) {
      state[key] = el
    }
  }))

  return state
}

export function effect<T extends Boxs<any>>(deps: T, fn: Fx<T>) {
  const update = hook
  const state = getState(update)

  if (state.pos >= state.fx.length) {
    state.fx.push(eff(deps, (props) => {
      const state = getState(update)

      state.effects.set(fn, () => {
        disposes.set(fn, fn(props))
      })

      return () => {
        state.disposes.add(fn)
      }
    }))
  }

  state.pos++
}
