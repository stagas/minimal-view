// @env jsdom
import { Lane } from '../src/lane'

describe('Lane', () => {
  it('new Lane()', () => {
    const lane = new Lane()
    expect(lane).toBeInstanceOf(Lane)
  })

  describe('size', () => {
    it('returns lane total size', () => {
      const lane = new Lane()
      expect(lane.size).toBe(0)
      lane.effects.add(() => { })
      expect(lane.size).toBe(1)
    })
  })

  describe('run()', () => {
    it('runs effects + disposes in order', () => {
      const results: string[] = []

      const effects = [
        jest.fn(() => {
          results.push('e1')
        }),
        jest.fn(() => {
          results.push('e2')
        }),
      ]

      const lane = new Lane()

      effects.forEach((fn) =>
        lane.effects.add(fn))

      lane.laneRun()

      expect(results).toEqual([
        'e1', 'e2'
      ])

      effects.forEach((fn) => {
        expect(fn).toBeCalledTimes(1)
      })
    })

    it('runs only once', () => {
      const lane = new Lane()
      expect(lane.complete).toBeFalsy()
      lane.laneRun()
      expect(() => lane.laneRun()).toThrow('completed')
      expect(lane.complete).toBe(true)
    })
  })
})
