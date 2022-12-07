type Fn = () => void

function laneFnRun(fn: Fn) {
  fn()
}

export class Lane {
  declare complete?: boolean

  effects = new Set<Fn>()

  get size() {
    return this.effects.size
  }

  laneRun() {
    if (this.complete) {
      throw new Error('Lane has already completed.')
    }

    if (this.effects.size) {
      this.effects.forEach(laneFnRun)
    }

    this.complete = true

    // we want to forbid assigning effects
    // after running, this will throw if there is
    // an attempt to access again.
    // @ts-ignore
    this.effects = void 0
  }
}
