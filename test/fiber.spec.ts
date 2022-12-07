// @env jsdom
import { Fiber } from '../src/fiber'

describe('Fiber', () => {
  it('new Fiber()', () => {
    const fiber = new Fiber()
    expect(fiber).toBeInstanceOf(Fiber)
  })

  describe('get(obj)', () => {
    it('returns same lane for object', async () => {
      const fiber = new Fiber()

      const obj = {}
      const lane = fiber.get(obj)

      expect(fiber.get(obj)).toBe(lane)
    })

    it('schedules flush at microtask', async () => {
      const fiber = new Fiber()

      const onFlushStart = jest.fn()
      fiber.on('flushstart', onFlushStart)

      const onFlushEnd = jest.fn()
      fiber.on('flushend', onFlushEnd)

      fiber.get({})

      await Promise.resolve()

      expect(onFlushStart).toBeCalledTimes(1)
      expect(onFlushEnd).toBeCalledTimes(1)
    })

    it('runs lane', async () => {
      const fiber = new Fiber()

      const obj = {}
      const fn = jest.fn()
      const lane = fiber.get(obj)
      lane.effects.add(fn)

      await Promise.resolve()

      expect(fn).toBeCalledTimes(1)
    })

    it('can insert additional lanes while flushing', async () => {
      const fiber = new Fiber()

      const obj = {}

      let count = 0

      const fn2 = jest.fn()
      const fn1 = jest.fn(() => {
        if (count++ === 0) {
          const lane = fiber.get(obj)
          lane.effects.add(fn2)
        }
      })

      const lane = fiber.get(obj)
      lane.effects.add(fn1)

      await Promise.resolve()

      expect(fn1).toBeCalledTimes(1)
      expect(fn2).toBeCalledTimes(1)
    })

    it('prevents infinite loop', async () => {
      const fiber = new Fiber()

      const obj = {}

      const fn = jest.fn(() => {
        const obj = {}
        const lane = fiber.get(obj)
        lane.effects.add(fn)
      })

      const lane = fiber.get(obj)
      lane.effects.add(fn)

      const errorFn = jest.fn()
      fiber.on('error', errorFn)

      await Promise.resolve()

      expect(fn).toBeCalledTimes(10)
      expect(errorFn).toBeCalledTimes(1)
      expect(errorFn.mock.lastCall[0]).toBeInstanceOf(Error)
      expect(errorFn.mock.lastCall[0].message).toContain('infinite loop')
    })
  })
})
