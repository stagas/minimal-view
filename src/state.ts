/* eslint-disable @typescript-eslint/ban-types */
import { Change, Boxs, Dep, OffFx, effect, deps, Fx } from 'minimal-reactive'
import { toFluent, pick, accessors, cheapRandomId, once, bool, EventEmitter, debugObjectMethods, ansiColorFor, padEnd } from 'everyday-utils'
import { abort, chain, QueueOptions, wrapQueue } from 'event-toolkit'
import { Class, StringKeys } from 'everyday-types'
import { VRef } from 'html-vdom'
import { argtor } from 'argtor'

import { Fiber } from './fiber'
import { Lane } from './lane'

function printChanges(changes: Change[]) {
  changes.forEach((change) => {
    console.groupCollapsed(
      `\x1b[32m\x1b[1m${change.key}`
    )

    console.log('\x1b[1mPREV:\x1b[0m',
      typeof change.prev === 'string'
        ? JSON.stringify(change.prev) : change.prev)

    console.log('\x1b[1mNEXT:\x1b[0m',
      typeof change.next === 'string'
        ? JSON.stringify(change.next) : change.next
    )

    console.groupEnd()
  })
}

function printSideEffects(allChanges: [string, Change[]][]) {
  console.groupCollapsed(`SIDE\t\t\x1b[32m${[...new Set(allChanges.flatMap(([, changes]: any) => changes.map((change: Change) => change.key)))].join(' ')}\n\x1b[0m\x1b[1mEFFECTS:\t\x1b[33m${[...new Set(allChanges.map(([eff]: any) => eff))].join(' ')}`
  )

  allChanges.forEach(([eff, changes]) => {
    console.group(`\x1b[1m\x1b[33m${eff}`)
    printChanges(changes)
    console.groupEnd()
  })

  console.groupEnd()
}

export class FnOptions<T> extends QueueOptions {
  keys?: string[] & { source: string }
}

export class EffectOptions<T> extends FnOptions<T> {
  once = bool
}

export type Effect<T> = {
  (deps: Deps<T>, prev: T): Promise<OffFx | void> | OffFx | void
}

export type Func<T, R extends (...args: unknown[]) => unknown> = {
  (deps: Deps<T>, prev: Deps<T>): R
}

export type Deps<T> = {
  [K in keyof T]-?: NonNullable<T[K]>
}

export type Props<T> = {
  [K in keyof T]: NonNullable<T[K]>
}

export type Refs<T> = {
  [K in keyof T]-?: NonNullable<T[K]> extends HTMLElement ? VRef<T[K]> : never
}

const stack: any[] = []

export type Context<TName extends string, TProps, TLocal> = Props<TProps>
  & TLocal
  & {
    self: State<TName, TProps, TLocal>,
    deps: Boxs<TProps & TLocal>,
  }

export class State<
  TName extends string,
  TProps,
  TLocal,
> extends EventEmitter<{ change: (event: { fn: Effect<TProps & TLocal>, changes: Change[] }) => void }> {
  _id = cheapRandomId()

  $ = { self: this } as unknown as Context<TName, TProps, TLocal>
  deps: Boxs<TProps & TLocal>
  #fxs: OffFx[] = []

  // utils
  // TODO: assign them programatically
  abort = abort

  constructor(
    public name: TName,
    public fiber: Fiber,
    public props: TProps = {} as TProps,
    public local: Class<TLocal> = class { } as Class<TLocal>
  ) {
    super()

    this.deps = deps(
      Object.assign(
        { $: this.$ },
        new this.local(),
        this.props
      )
    )

    accessors(
      this.$,
      this.deps,
      (_, dep: Dep<any>) =>
        dep.accessors
    )

    this.$.deps = this.deps
  }

  get size() {
    return this.#fxs.length
  }

  get #lane(): Lane {
    return this.fiber.get(this)
  }

  get refs(): Refs<TProps & TLocal> {
    return this.deps as unknown as Refs<TProps & TLocal>
  }

  // fns = <R extends (...args: any[]) => any, T extends Record<string, Func<TProps & TLocal, R>>>(obj: T): { [K in keyof T]: ReturnType<T[K]> } => {
  //   return Object.fromEntries(
  //     Object.entries(obj as any)
  //       .map(([key, value]) => {
  //         return [key, this.fn(value)]
  //       }) as any
  //   ) as any
  // }

  fns = <V>(obj: V): V => {
    const changes = new Map()

    const getChanges = (x: any) => {
      return [
        ...x.changes,
        ...x.children.map((y: any) => getChanges(y.listener)).flat(Infinity)
      ]
    }

    const getActions = (x: any) => {
      return [
        ...x.children,
        ...x.children.map((y: any) => getActions(y.listener)).flat(Infinity)
      ]
    }

    const printAction = (x: any) => {
      const allChanges = getChanges(x.listener)
      const allActions = getActions(x.listener)

      console.groupCollapsed(`${padEnd(`${ansiColorFor(x.name)}:\x1b[0m`, 12)} \x1b[34m${x.key}(${x.args.length ? '...' : ''})${allChanges.length ? ` \x1b[31m[${allChanges.length}]` : ''}${allActions.length ? ` \x1b[34m[${allActions.length}]` : ''
        }`)

      console.groupCollapsed('ARGS:\t', x.args)
      console.log(x.listener.stackErr)
      console.groupEnd()

      console.log('\x1b[0m\x1b[1mRESULT:\t', x.result)

      printSideEffects(x.listener.changes)

      if (x.listener.children.length) {
        console.log('\x1b[1mACTIONS:')
      }
      for (const child of x.listener.children) {
        printAction(child)
      }

      console.groupEnd()
    }

    const actions = debugObjectMethods(obj, ['valueOf'], {
      before: (key, args, stackErr) => {
        const listener = Object.assign(({ fn, changes }: { fn: Effect<any>, changes: Change[] }) => {
          listener.changes.push([fn.name, changes])
        }, {
          stackErr,
          changes: [] as [string, Change[]][],
          children: []
        })

        changes.set(key, listener)
        stack.push(listener)
        this.on('change', listener as any)
      },
      after: (key, args, result) => {
        const listener = changes.get(key)
        this.off('change', listener)

        stack.pop()
        const action = {
          name: this.name, key, args, result, listener
        }

        printAction(action)
        // console.log(stack)
        // if (stack.length === 0) {
        //   // printAction(action)
        // } else {
        if (stack.length) {
          stack.at(-1).children.push(action)
        }
        // }

      }
    }, this.name)
    return actions
  }

  fn = toFluent(
    FnOptions,
    (options) =>
      <R extends (...args: any[]) => any>(fn: Func<TProps & TLocal, R>): R => {
        const keys = argtor<StringKeys<TProps & TLocal>>(fn as any)

        let inner: ((this: any, ...args: any[]) => any) & { dispose: () => void }

        function stateFn(this: any, ...args: any[]) {
          return inner?.apply(this, args as any)
        }

        const outer = wrapQueue(options)(stateFn)

        const updateFn = function (props: any, prev: any) {
          if (inner != null && 'dispose' in inner) inner.dispose()
          inner = fn(props, prev) as any
          Object.defineProperty(inner, 'name', { value: `${fn.name} (inner)` })
          Object.defineProperty(updateFn, 'name', { value: `${fn.name} (fn)` })
        }

          ; (outer as any).dispose = this.fx.keys(keys as any)(updateFn)

        Object.defineProperty(outer, 'key', {
          set(x: string) {
            Object.defineProperty(fn, 'name', { value: x })
            Object.defineProperty(updateFn, 'name', { value: `${x} (update)` })
          },
          get() {
            return fn.name
          }
        })

        return outer as any
      })

  fx = toFluent(
    EffectOptions,
    (options) =>
      (fn: Effect<TProps & TLocal>) => {
        // const name = fn.name
        // @ts-ignore
        const isDebug = !!globalThis.DEBUG && globalThis.DEBUG.includes(this.name)

        const keys =
          options.keys ?? argtor(fn as any)

        // throw if dependencies are missing
        const missing = keys
          .filter((key) =>
            !(key in this.deps)
          )

        if (missing.length) {
          throw new TypeError(`Missing dependencies: ${JSON.stringify(missing)}\n${keys.source}`)
        }

        const deps = pick(this.deps, keys as any)

        let dispose: any

        const qfn = wrapQueue({
          ...options,
          hooks: {
            before: () => {
              // if (stack.at(-1) !== this) {
              //   stack.push(this)
              // }
              dispose?.()
            },
            // after: () => {
            //   stack.pop()
            // }
          }
        })(fn)

        let last: any

        const self = this

        let earliestPrev: any

        const fx = Object.assign((
          (props, changes, prev) => {
            earliestPrev ??= prev

            let disposed = false

            this.emit('change', { fn, changes })

            this.#lane.effects.add(function laneFn() {
              if (disposed) return

              let listener: any

              // @ts-ignore
              if (isDebug) {
                listener = Object.assign(({ fn, changes }: { fn: Effect<any>, changes: Change[] }) => {
                  listener.changes.push([fn.name, changes])
                }, { changes: [] as [string, Change[]][] })

                self.on('change', listener as any)
              }

              const p = earliestPrev
              earliestPrev = null
              const res = qfn(props as any, p)

              if (res instanceof Promise) {
                // disposed = false
                res.then((_dispose) => {
                  if (last === _dispose) return
                  last = _dispose

                  if (disposed) _dispose?.()
                  else dispose = _dispose

                  if (options.once) off()
                })
              } else {
                dispose = res
                if (options.once) off()
              }

              if (isDebug) {
                self.off('change', listener)

                console.groupCollapsed(
                  `${padEnd(`${ansiColorFor(self.name)}:\x1b[0m`, 12)} \x1b[33m${fn.name.padEnd(19)}\t\x1b[32m${changes.map((change) => change.key).join(' ')
                  }${listener.changes.length ? ` \x1b[31m[${listener.changes.length}]` : ''}`
                )

                printChanges(changes)
                // console.groupEnd()

                if (listener.changes.length) {
                  printSideEffects(listener.changes)
                }

                console.groupEnd()
              }
            })

            return (reconnect, disconnect) => {
              disposed = true
              if (!reconnect && !disconnect) {
                dispose?.()
              }
            }
          }) as Fx<any>,
          { source: keys.source }
        )

        const off = once(chain(
          effect(deps, fx),
          () => {
            if (isDebug) {
              console.warn(`dispose[${this.name}]:`, fn.name || '(anonymous)')
            }
            // cache.delete(id)
            dispose?.()
          }
        ))

        this.#fxs.push(off)
        // cache.set(id, off)
        return off
      }
  )

  dispose() {
    chain(this.#fxs.splice(0))()
  }
}

// export const State = _State as {
//   new <TProps, TLocal>(
//     // hook: Hook,
//     fiber: Fiber,
//     props?: TProps,
//     local?: Class<TLocal>
//   ): State<TProps, TLocal>
// }

// export interface Stateful<
//   TProps = {},
//   TLocal = {},
// > {
//   $: Required<State<TProps, TLocal>>
// }

// export type StateOf<T extends Stateful<any>> = {
//   [U in keyof T['$']['deps']]-?:
//   T['$'][U] extends Stateful<any>
//   ? StateOf<T['$'][U]>
//   : T['$'][U]
// }

// export type StatefulObjects<T> = {
//   [K in keyof T as T[K] extends Stateful<any> ? K : never]-?: T[K] extends Stateful<any>
//   ? StateOf<T[K]>
//   : never
// }

// type Pick<T> = StatefulObjects<Required<T>>

// export type State<
//   TProps = {},
//   TLocal = {},
// > =
//   // & (TProps extends void ? void : TProps)
//   // & (TLocal extends void ? void : TLocal)
//   & _State<TProps & TLocal>
  // & {
  //   pick: <R>(fn: (deps: Pick<T>) => R) =>
  //     State<TProps, TLocal & R>
  //   reduce: <R>(fn: (deps: TProps & TLocal) => R) =>
  //     State<TProps, TLocal & R>
  //   // <R>(fn: (deps: TProps & TLocal) => R):
  //   //   State<TProps & R, TLocal>
  // }
