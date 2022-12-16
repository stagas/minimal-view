// @env jsdom
import { wait } from 'everyday-utils'
// import { createHook, Hook } from 'html-vdom'
import { Fiber } from '../src/fiber'
import { State } from '../src/state'

describe('State', () => {
  describe('new State(hook)', () => {
    it('creates instance', () => {
      const fiber = new Fiber()
      // const hook: Hook = Object.assign(createHook(), { fn: () => { } })

      const state = new State('foo', fiber)
      expect(state).toBeInstanceOf(State)
    })

    // it('runs hook initially', async () => {
    //   const fiber = new Fiber()

    //   new State('foo', fiber)
    //   expect(hook.fn).toBeCalledTimes(0)
    //   await Promise.resolve()
    //   expect(hook.fn).toBeCalledTimes(1)
    // })

    it('assigns only props', () => {
      const fiber = new Fiber()

      const props = { foo: true }
      const state = new State('foo', fiber, props)
      expect(state.$.foo).toBe(true)
    })

    it('assigns only local', () => {
      const fiber = new Fiber()

      class local {
        bar = true
      }
      const state = new State('foo', fiber, {}, local)
      expect(state.$.bar).toBe(true)
    })

    it('assigns both props + local', () => {
      const fiber = new Fiber()

      const props = { foo: true }
      class local {
        bar = true
      }
      const state = new State('foo', fiber, props, local)
      expect(state.$.foo).toBe(true)
      expect(state.$.bar).toBe(true)
    })

    it('refs', () => {
      const fiber = new Fiber()

      class local {
        element?: HTMLElement
      }
      const state = new State('foo', fiber, void 0, local)
      expect('element' in state.refs).toBe(true)
    })

    // it('assign json', () => {
    //   const fiber = new Fiber()

    //   const props = { foo: void 0, json: { foo: true } }
    //   const state = new State('foo', fiber, props)
    //   expect(state.$.foo).toBe(true)
    // })

    // it('assign ref.current.json', () => {
    //   const fiber = new Fiber()

    //   const props = { foo: void 0, ref: { current: { json: { foo: true } } } }
    //   const state = new State('foo', fiber, props)
    //   expect(state.$.foo).toBe(true)
    // })
  })


  describe('effect(({ dep }) => ..) [sync]', () => {
    it('adds an effect', async () => {
      const fiber = new Fiber()

      const fn = jest.fn()
      const state = new State('foo', fiber)

      state.fx(() => fn())

      expect(fn).toBeCalledTimes(0)
      await Promise.resolve()
      expect(fn).toBeCalledTimes(1)
    })

    it('runs effect when dependency met', async () => {
      const fiber = new Fiber()
      const results: string[] = []

      const fn = jest.fn(
        (param: any) => { results.push(param) }
      )
      const state = new State('foo', fiber, { foo: 'a' })

      state.fx(({ foo }) => fn(foo))

      expect(fn).toBeCalledTimes(0)
      await Promise.resolve()
      expect(fn).toBeCalledTimes(1)
      expect(results).toEqual(['a'])
    })

    it('runs effect when dependency changes', async () => {
      const fiber = new Fiber()
      const results: string[] = []

      const fn = jest.fn(
        (param: any) => { results.push(param) }
      )
      const state = new State('foo', fiber, { foo: 'a' })

      state.fx(({ foo }) => fn(foo))

      expect(fn).toBeCalledTimes(0)
      await Promise.resolve()
      expect(fn).toBeCalledTimes(1)
      expect(results).toEqual(['a'])

      state.$.foo = 'b'
      await Promise.resolve()
      expect(fn).toBeCalledTimes(2)
      expect(results).toEqual(['a', 'b'])
    })

    it('runs dispose when dependency changes', async () => {
      const fiber = new Fiber()
      const results: string[] = []

      const fn = jest.fn(
        (param: any) => { results.push(param) }
      )
      const state = new State('foo', fiber, { foo: 'a' })

      const dispose = jest.fn()

      state.fx(({ foo }) => {
        fn(foo)
        return dispose
      })

      expect(fn).toBeCalledTimes(0)
      await Promise.resolve()
      expect(fn).toBeCalledTimes(1)
      expect(results).toEqual(['a'])

      state.$.foo = 'b'
      await Promise.resolve()
      expect(fn).toBeCalledTimes(2)
      expect(dispose).toBeCalledTimes(1)
      expect(results).toEqual(['a', 'b'])
    })

    it('runs dispose when effect disposed', async () => {
      const fiber = new Fiber()
      const results: string[] = []

      const fn = jest.fn(
        (param: any) => { results.push(param) }
      )
      const state = new State('foo', fiber, { foo: 'a' })

      const dispose = jest.fn()

      const offEffect = state.fx(({ foo }) => {
        fn(foo)
        return dispose
      })

      expect(fn).toBeCalledTimes(0)
      await Promise.resolve()
      expect(fn).toBeCalledTimes(1)
      expect(results).toEqual(['a'])

      offEffect()
      await Promise.resolve()
      expect(fn).toBeCalledTimes(1)
      expect(dispose).toBeCalledTimes(1)
    })

    // it('runs dispose when hook removed', async () => {
    //   const fiber = new Fiber()
    //   const results: string[] = []

    //   const fn = jest.fn(
    //     (param: any) => { results.push(param) }
    //   )
    //   const state = new State('foo', fiber, { foo: 'a' })

    //   const dispose = jest.fn()

    //   state.effect(({ foo }) => {
    //     fn(foo)
    //     return dispose
    //   })

    //   expect(fn).toBeCalledTimes(0)
    //   await Promise.resolve()
    //   expect(fn).toBeCalledTimes(1)
    //   expect(results).toEqual(['a'])

    //   hook.emit('remove')

    //   await Promise.resolve()
    //   expect(fn).toBeCalledTimes(1)
    //   expect(dispose).toBeCalledTimes(1)
    // })

    it('runs dispose when dispose changes to void', async () => {
      const fiber = new Fiber()
      const results: string[] = []

      const fn = jest.fn(
        (param: any) => { results.push(param) }
      )
      const state = new State('foo', fiber, { foo: 'a' })

      const dispose = jest.fn()

      let toggle = false
      state.fx(({ foo }) => {
        fn(foo)
        return toggle ? void 0 : dispose
      })

      expect(fn).toBeCalledTimes(0)
      await Promise.resolve()
      expect(fn).toBeCalledTimes(1)
      expect(results).toEqual(['a'])

      toggle = true
      state.$.foo = 'another'
      await Promise.resolve()
      expect(fn).toBeCalledTimes(2)
      expect(dispose).toBeCalledTimes(1)
    })

    it('multiple changes in same task, same depedency, drops inbetween', async () => {
      const fiber = new Fiber()
      const results: string[] = []

      const fn = jest.fn(
        (param: any) => { results.push(param) }
      )
      const state = new State('foo', fiber, { foo: 'a' })

      const dispose = jest.fn()

      state.fx(({ foo }) => {
        fn(foo)
        return dispose
      })

      expect(fn).toBeCalledTimes(0)
      await Promise.resolve()
      expect(fn).toBeCalledTimes(1)
      expect(results).toEqual(['a'])

      state.$.foo = 'b'
      state.$.foo = 'c'
      await Promise.resolve()
      expect(results).toEqual(['a', 'c'])
      expect(fn).toBeCalledTimes(2)
      expect(dispose).toBeCalledTimes(1)
    })

    it('throws when dependency is missing', async () => {
      const fiber = new Fiber()

      const state = new State('foo', fiber, { foo: 'a' })

      expect(() => {
        // @ts-ignore
        state.fx(({ bar }) => { })
      }).toThrow('dependencies')
    })
  })

  describe('effect(async ({ dep }) => ..) [async]', () => {
    it('adds an effect', async () => {
      const fiber = new Fiber()

      const fn = jest.fn()
      const state = new State('foo', fiber)

      state.fx(async () => fn())

      expect(fn).toBeCalledTimes(0)
      await Promise.resolve()
      expect(fn).toBeCalledTimes(1)
    })

    it('runs effect when dependency met', async () => {
      const fiber = new Fiber()
      const results: string[] = []

      const fn = jest.fn(
        (param: any) => { results.push(param) }
      )
      const state = new State('foo', fiber, { foo: 'a' })

      state.fx(async ({ foo }) => fn(foo))

      expect(fn).toBeCalledTimes(0)
      await Promise.resolve()
      expect(fn).toBeCalledTimes(1)
      expect(results).toEqual(['a'])
    })

    it('runs effect when dependency changes', async () => {
      const fiber = new Fiber()
      const results: string[] = []

      const fn = jest.fn(
        (param: any) => { results.push(param) }
      )
      const state = new State('foo', fiber, { foo: 'a' })

      state.fx(async ({ foo }) => fn(foo))

      expect(fn).toBeCalledTimes(0)
      await Promise.resolve()
      expect(fn).toBeCalledTimes(1)
      expect(results).toEqual(['a'])

      state.$.foo = 'b'
      await Promise.resolve()
      expect(fn).toBeCalledTimes(2)
      expect(results).toEqual(['a', 'b'])
    })

    it('runs dispose when dependency changes', async () => {
      const fiber = new Fiber()
      const results: string[] = []

      const fn = jest.fn(
        (param: any) => { results.push(param) }
      )
      const state = new State('foo', fiber, { foo: 'a' })

      const dispose = jest.fn()

      state.fx(async ({ foo }) => {
        fn(foo)
        return dispose
      })

      expect(fn).toBeCalledTimes(0)
      await Promise.resolve()
      expect(fn).toBeCalledTimes(1)
      expect(results).toEqual(['a'])

      state.$.foo = 'b'
      await Promise.resolve()
      expect(fn).toBeCalledTimes(2)
      expect(dispose).toBeCalledTimes(1)
      expect(results).toEqual(['a', 'b'])
    })

    it('runs dispose when effect disposed', async () => {
      const fiber = new Fiber()
      const results: string[] = []

      const fn = jest.fn(
        (param: any) => { results.push(param) }
      )
      const state = new State('foo', fiber, { foo: 'a' })

      const dispose = jest.fn()

      const offEffect = state.fx(async ({ foo }) => {
        fn(foo)
        return dispose
      })

      expect(fn).toBeCalledTimes(0)
      await Promise.resolve()
      expect(fn).toBeCalledTimes(1)
      expect(results).toEqual(['a'])

      offEffect()
      await Promise.resolve()
      await Promise.resolve()
      await Promise.resolve()
      expect(fn).toBeCalledTimes(1)
      expect(dispose).toBeCalledTimes(1)
    })

    it('runs nested dispose', async () => {
      const fiber = new Fiber()
      const results: string[] = []
      const results2: string[] = []

      const fn = jest.fn(
        (param: any) => { results.push(param) }
      )
      const fn2 = jest.fn(
        (param: any) => { results2.push(param) }
      )
      const state = new State('foo', fiber, { foo: 'a', bar: 'b' })

      const dispose = jest.fn()

      state.fx(async ({ foo }) => {
        fn(foo)
        return state.fx(async ({ bar }) => {
          fn2(bar)
          return dispose
        })
      })

      expect(fn).toBeCalledTimes(0)
      expect(fn2).toBeCalledTimes(0)
      await Promise.resolve()
      expect(fn).toBeCalledTimes(1)
      expect(fn2).toBeCalledTimes(1)

      expect(results).toEqual(['a'])
      expect(results2).toEqual(['b'])
      expect(dispose).toBeCalledTimes(0)

      state.$.foo = 'another'
      await Promise.resolve()
      await Promise.resolve()
      await Promise.resolve()
      expect(fn).toBeCalledTimes(2)
      expect(results).toEqual(['a', 'another'])
      expect(results2).toEqual(['b', 'b'])
      // expect(fn2).toBeCalledTimes(2)
      expect(dispose).toBeCalledTimes(1)
    })

    it('runs nested dispose when effect is not set second time', async () => {
      const fiber = new Fiber()
      const results: string[] = []
      const results2: string[] = []

      const fn = jest.fn(
        (param: any) => { results.push(param) }
      )
      const fn2 = jest.fn(
        (param: any) => { results2.push(param) }
      )
      const state = new State('foo', fiber, { foo: 'a', bar: 'b' })

      const dispose = jest.fn()

      let toggle = false
      state.fx(async ({ foo }) => {
        fn(foo)
        return toggle ? void 0 : state.fx(async ({ bar }) => {
          fn2(bar)
          return dispose
        })
      })

      expect(fn).toBeCalledTimes(0)
      expect(fn2).toBeCalledTimes(0)
      await Promise.resolve()
      expect(fn).toBeCalledTimes(1)
      expect(fn2).toBeCalledTimes(1)

      expect(results).toEqual(['a'])
      expect(results2).toEqual(['b'])
      expect(dispose).toBeCalledTimes(0)

      toggle = true
      state.$.foo = 'another'
      await Promise.resolve()
      expect(fn).toBeCalledTimes(2)
      expect(fn2).toBeCalledTimes(1)
      expect(dispose).toBeCalledTimes(1)
    })

    it('runs dispose when dispose changes to void and doesnt run again in toggle', async () => {
      const fiber = new Fiber()
      const results: string[] = []

      const fn = jest.fn(
        (param: any) => { results.push(param) }
      )
      const state = new State('foo', fiber, { foo: 'a' })

      const dispose = jest.fn()

      let toggle = false
      state.fx(async ({ foo }) => {
        fn(foo)
        return toggle ? void 0 : dispose
      })

      expect(fn).toBeCalledTimes(0)
      await Promise.resolve()
      expect(fn).toBeCalledTimes(1)
      expect(results).toEqual(['a'])

      toggle = true
      state.$.foo = 'another'
      await Promise.resolve()
      expect(fn).toBeCalledTimes(2)
      expect(dispose).toBeCalledTimes(1)

      toggle = false
      state.$.foo = 'one more'
      await Promise.resolve()
      expect(fn).toBeCalledTimes(3)
      expect(dispose).toBeCalledTimes(1)
    })

    it('multiple changes in same task, same depedency, drops inbetween', async () => {
      const fiber = new Fiber()
      const results: string[] = []

      const fn = jest.fn(
        (param: any) => { results.push(param) }
      )
      const state = new State('foo', fiber, { foo: 'a' })

      let count = 0

      state.fx(async ({ foo }) => {
        fn(foo)
        return () => {
          count++
        }
      })

      expect(fn).toBeCalledTimes(0)
      await Promise.resolve()
      expect(fn).toBeCalledTimes(1)
      expect(results).toEqual(['a'])

      state.$.foo = 'b'
      state.$.foo = 'c'
      await Promise.resolve()
      expect(results).toEqual(['a', 'c'])
      expect(fn).toBeCalledTimes(2)
      await Promise.resolve()
      await Promise.resolve()
      await Promise.resolve()
      expect(count).toBe(1)
    })
  })

  describe('effect.debounce(ms)(..) [sync]', () => {
    it('runs at the end', async () => {
      const fiber = new Fiber()
      const results: string[] = []

      const fn = jest.fn(
        (param: any) => { results.push(param) }
      )
      const state = new State('foo', fiber, { foo: 'a' })

      const dispose = jest.fn()

      state.fx.debounce(20)(({ foo }) => {
        fn(foo)
        return dispose
      })

      expect(fn).toBeCalledTimes(0)
      await Promise.resolve()
      expect(fn).toBeCalledTimes(0)
      await wait(20)
      expect(results).toEqual(['a'])
      expect(fn).toBeCalledTimes(1)
    })

    it('multiple changes, runs at the end once', async () => {
      const fiber = new Fiber()
      const results: string[] = []

      const fn = jest.fn(
        (param: any) => { results.push(param) }
      )
      const state = new State('foo', fiber, { foo: 'a' })

      const dispose = jest.fn()

      state.fx.debounce(20)(({ foo }) => {
        fn(foo)
        return dispose
      })

      state.$.foo = 'b'
      state.$.foo = 'c'

      await wait(30)
      expect(results).toEqual(['c'])
      expect(fn).toBeCalledTimes(1)

      await wait(30)
      expect(results).toEqual(['c'])
      expect(fn).toBeCalledTimes(1)
    })

    it('multiple changes in different frames, runs at the end once', async () => {
      const fiber = new Fiber()
      const results: string[] = []

      const fn = jest.fn(
        (param: any) => { results.push(param) }
      )
      const state = new State('foo', fiber, { foo: 'a' })

      const dispose = jest.fn()

      state.fx.debounce(20)(({ foo }) => {
        fn(foo)
        return dispose
      })

      await wait(5)
      state.$.foo = 'b'
      await wait(5)
      state.$.foo = 'c'

      await wait(25)
      expect(results).toEqual(['c'])
      expect(fn).toBeCalledTimes(1)

      await wait(25)
      expect(results).toEqual(['c'])
      expect(fn).toBeCalledTimes(1)
    })

    it('runs dispose at the end', async () => {
      const fiber = new Fiber()
      const results: string[] = []

      const fn = jest.fn(
        (param: any) => { results.push(param) }
      )
      const state = new State('foo', fiber, { foo: 'a' })

      const dispose = jest.fn()

      state.fx.debounce(20)(({ foo }) => {
        fn(foo)
        return dispose
      })

      await wait(30)
      expect(results).toEqual(['a'])
      expect(fn).toBeCalledTimes(1)
      expect(dispose).toBeCalledTimes(0)

      state.$.foo = 'b'
      expect(dispose).toBeCalledTimes(0)
      await wait(5)
      expect(results).toEqual(['a'])
      expect(dispose).toBeCalledTimes(0)

      await wait(30)
      expect(results).toEqual(['a', 'b'])
      expect(dispose).toBeCalledTimes(1)

      await wait(30)
      expect(results).toEqual(['a', 'b'])
      expect(dispose).toBeCalledTimes(1)
    })

    it('runs dispose when dispose changes to void and doesnt run again in toggle', async () => {
      const fiber = new Fiber()
      const results: string[] = []

      const fn = jest.fn(
        (param: any) => { results.push(param) }
      )
      const state = new State('foo', fiber, { foo: 'a' as any })

      const dispose = jest.fn()

      state.fx.debounce(20)(({ foo }) => {
        fn(foo)
        return dispose
      })

      expect(fn).toBeCalledTimes(0)
      await wait(30)
      expect(fn).toBeCalledTimes(1)
      expect(results).toEqual(['a'])

      state.$.foo = void 0
      await wait(30)
      expect(fn).toBeCalledTimes(1)
      expect(dispose).toBeCalledTimes(1)

      state.$.foo = 'one more'
      await wait(30)
      expect(fn).toBeCalledTimes(2)
      expect(dispose).toBeCalledTimes(2)
    })

    it('runs nested dispose', async () => {
      const fiber = new Fiber()
      const results: string[] = []
      const results2: string[] = []

      const fn = jest.fn(
        (param: any) => { results.push(param) }
      )
      const fn2 = jest.fn(
        (param: any) => { results2.push(param) }
      )
      const state = new State('foo', fiber, { foo: 'a', bar: 'b' })

      const dispose = jest.fn()

      state.fx.debounce(20)(({ foo }) => {
        fn(foo)
        return state.fx.debounce(20)(({ bar }) => {
          fn2(bar)
          return dispose
        })
      })

      expect(fn).toBeCalledTimes(0)
      expect(fn2).toBeCalledTimes(0)

      await wait(30)
      expect(fn).toBeCalledTimes(1)
      expect(fn2).toBeCalledTimes(0)
      expect(results).toEqual(['a'])
      expect(results2).toEqual([])

      await wait(30)
      expect(fn).toBeCalledTimes(1)
      expect(fn2).toBeCalledTimes(1)
      expect(results).toEqual(['a'])
      expect(results2).toEqual(['b'])

      expect(dispose).toBeCalledTimes(0)

      state.$.foo = 'another'
      expect(dispose).toBeCalledTimes(0)

      await wait(30)
      expect(fn).toBeCalledTimes(2)
      expect(fn2).toBeCalledTimes(1)
      expect(results).toEqual(['a', 'another'])
      expect(results2).toEqual(['b'])

      await wait(30)
      expect(dispose).toBeCalledTimes(1)
    })

    it('multiple changes, runs nested dispose once', async () => {
      const fiber = new Fiber()
      const results: string[] = []
      const results2: string[] = []

      const fn = jest.fn(
        (param: any) => { results.push(param) }
      )
      const fn2 = jest.fn(
        (param: any) => { results2.push(param) }
      )
      const state = new State('foo', fiber, { foo: 'a', bar: 'b' })

      const dispose = jest.fn(() => {
        // debugger
      })

      state.fx.debounce(20)(({ foo }) => {
        fn(foo)
        return state.fx.debounce(20)(({ bar }) => {
          fn2(bar)
          return dispose
        })
      })

      expect(fn).toBeCalledTimes(0)
      expect(fn2).toBeCalledTimes(0)

      await wait(30)
      expect(fn).toBeCalledTimes(1)
      expect(fn2).toBeCalledTimes(0)
      expect(results).toEqual(['a'])
      expect(results2).toEqual([])

      await wait(30)
      expect(fn).toBeCalledTimes(1)
      expect(fn2).toBeCalledTimes(1)
      expect(results).toEqual(['a'])
      expect(results2).toEqual(['b'])

      expect(dispose).toBeCalledTimes(0)

      state.$.foo = 'b'
      await wait(5)
      state.$.foo = 'c'
      await wait(5)
      state.$.foo = 'd'
      await wait(5)
      expect(dispose).toBeCalledTimes(0)

      await wait(30)
      expect(fn).toBeCalledTimes(2)
      expect(fn2).toBeCalledTimes(1)
      expect(results).toEqual(['a', 'd'])
      expect(results2).toEqual(['b'])
      expect(dispose).toBeCalledTimes(1)

      await wait(30)
      expect(fn2).toBeCalledTimes(2)
      expect(dispose).toBeCalledTimes(1)

      await wait(100)
      expect(fn2).toBeCalledTimes(2)
      expect(dispose).toBeCalledTimes(1)
    })

    it('runs nested dispose when effect is not set second time', async () => {
      const fiber = new Fiber()
      const results: string[] = []
      const results2: string[] = []

      const fn = jest.fn(
        (param: any) => { results.push(param) }
      )
      const fn2 = jest.fn(
        (param: any) => { results2.push(param) }
      )
      const state = new State('foo', fiber, { foo: 'a', bar: 'b' })

      const dispose = jest.fn()

      let toggle = false
      state.fx.debounce(20)(({ foo }) => {
        fn(foo)
        return toggle ? void 0 : state.fx.debounce(20)(({ bar }) => {
          fn2(bar)
          return dispose
        })
      })

      expect(fn).toBeCalledTimes(0)
      expect(fn2).toBeCalledTimes(0)

      await wait(30)
      expect(fn).toBeCalledTimes(1)
      expect(fn2).toBeCalledTimes(0)
      expect(results).toEqual(['a'])
      expect(results2).toEqual([])

      await wait(30)
      expect(fn).toBeCalledTimes(1)
      expect(fn2).toBeCalledTimes(1)
      expect(results).toEqual(['a'])
      expect(results2).toEqual(['b'])

      expect(dispose).toBeCalledTimes(0)

      toggle = true
      state.$.foo = 'another'
      expect(dispose).toBeCalledTimes(0)

      await wait(30)
      expect(fn).toBeCalledTimes(2)
      expect(fn2).toBeCalledTimes(1)
      expect(results).toEqual(['a', 'another'])
      expect(results2).toEqual(['b'])

      await wait(30)
      expect(dispose).toBeCalledTimes(1)
    })

    it('runs nested dispose once when effect is not set toggling multiple times', async () => {
      const fiber = new Fiber()
      const results: string[] = []
      const results2: string[] = []

      const fn = jest.fn(
        (param: any) => { results.push(param) }
      )
      const fn2 = jest.fn(
        (param: any) => { results2.push(param) }
      )
      const state = new State('foo', fiber, { foo: 'a', bar: 'b' })

      let toggle = false
      let count = 0
      state.fx.debounce(20)(({ foo }) => {
        fn(foo)
        return toggle ? void 0 : state.fx.debounce(20)(({ bar }) => {
          fn2(bar)
          return () => {
            count++
          }
        })
      })

      expect(fn).toBeCalledTimes(0)
      expect(fn2).toBeCalledTimes(0)

      await wait(30)
      expect(fn).toBeCalledTimes(1)
      expect(fn2).toBeCalledTimes(0)
      expect(results).toEqual(['a'])
      expect(results2).toEqual([])

      await wait(30)
      expect(fn).toBeCalledTimes(1)
      expect(fn2).toBeCalledTimes(1)
      expect(results).toEqual(['a'])
      expect(results2).toEqual(['b'])

      expect(count).toBe(0)

      state.$.foo = 'b'
      // state.bar = 'b'
      await wait(30)
      toggle = true
      state.$.foo = 'c'
      state.$.bar = 'c'
      await wait(5)
      toggle = false
      state.$.foo = 'd'
      state.$.bar = 'd'

      expect(count).toBe(1)

      await wait(30)
      expect(fn).toBeCalledTimes(3)
      expect(fn2).toBeCalledTimes(2)
      expect(results).toEqual(['a', 'b', 'd'])
      expect(results2).toEqual(['b', 'd'])

      expect(count).toBe(2)
      // await wait(0)
      await wait(30)
      expect(results2).toEqual(['b', 'd', 'd'])
      expect(count).toBe(2)
    })
  })

  describe('dispose()', () => {
    it('disposes effects', () => {
      const fiber = new Fiber()

      const fn = jest.fn()
      const state = new State('foo', fiber)

      state.fx(() => fn())
      expect(state.size).toBe(1)

      state.dispose()
      expect(state.size).toBe(0)
    })
  })

  // describe('second run', () => {
  //   it('retains same effects', async () => {
  //     const fiber = new Fiber()
  //     const hook: Hook = Object.assign(createHook(), {
  //       fn: jest.fn(() => {
  //         state.effect(() => a())
  //         state.effect(() => b())
  //       })
  //     })

  //     const a = jest.fn()
  //     const b = jest.fn()
  //     const c = jest.fn()
  //     const state = new State('foo', fiber)

  //     // size + 1 for the hook
  //     expect(state.size).toBe(1)

  //     await Promise.resolve()

  //     expect(state.size).toBe(3)
  //     expect(a).toBeCalledTimes(1)
  //     expect(b).toBeCalledTimes(1)

  //     hook()

  //     expect(state.size).toBe(3)
  //     state.effect(() => c())
  //     expect(state.size).toBe(4)

  //     expect(a).toBeCalledTimes(1)
  //     expect(b).toBeCalledTimes(1)
  //     await Promise.resolve()
  //     expect(c).toBeCalledTimes(1)

  //     state.dispose()
  //     expect(state.size).toBe(0)
  //   })
  // })
})
