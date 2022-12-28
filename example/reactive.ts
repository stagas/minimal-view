import { reactive } from '../src/reactive'

const X = reactive('x',
  class props {
    foo!: string
  },
  class local {
    a = 1
    b = 2
  },

  function actions({ $, fns, fn }) {
    return fns(new class actions {
      add = fn(({ a, b }) => () => {
        return a + b
      })
    })
  },

  function effects({ $, fx }) {
  }
)

const x = X({ foo: 'yes' })
