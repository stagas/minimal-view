/** @jsxImportSource ../src */

import { view } from '../src'

const V = view('x',
  class props {
    yo = 123
  },
  class local { },
  function actions({ $, fns, fn }) {
    return fns(new class actions {
      foo = () => {

      }
    })
  },
  function effects({ $, fx, deps, refs }) {
    fx(() => {
      $.foo()

      $.view = 'hey'
    })
  }
)
