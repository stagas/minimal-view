import { EventEmitter } from 'everyday-utils'
import { Lane } from './lane'

export class Fiber extends EventEmitter<{
  flushstart: () => void
  flushend: () => void
  error: (error: Error) => void
}> {
  #lane: Lane = new Lane()
  #lanes = new Map<object, Lane>()

  #running = false
  #runLanes = () => {
    this.emit('flushstart')
    try {
      let count = 0
      while (this.#lane.size) {
        if (++count > 10) {
          this.emit('error',
            new Error('Possible infinite loop while flushing.')
          )
          return
        }
        this.#lanes.clear()
        const lane = this.#lane
        this.#lane = new Lane()
        lane.laneRun()
        // await new Promise(resolve => setTimeout(resolve, 5))
        // await Promise.resolve()

      }
    } finally {
      this.#running = false
      this.emit('flushend')
    }
  }

  get(obj: object) {
    let lane = this.#lanes.get(obj)

    if (!lane) {
      this.#lanes.set(obj, lane = this.#lane)

      if (!this.#running) {
        this.#running = true
        queueMicrotask(this.#runLanes)
      }
    }

    return lane
  }
}

export const fiber = new Fiber()
