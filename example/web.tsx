/** @jsxImportSource ../src */

import { render, use } from '../src'

function Button(props: { color: string }) {
  const $ = use(props, class local {
    btn?: HTMLButtonElement
  })

  let someScoped = 0

  $.effect(({ color }) => {
    $.view = `${color} scoped: ${someScoped++}`
    return () => {
      console.warn('color disposed')
    }
  })

  return <button ref={$.ref.btn}>{$.view}</button>
}

function App() {
  const $ = use(class local {
    color = 'pink'
    text = 'hello'
    counter = 0
    late?: boolean
    status?: JSX.Element
  })

  $.effect(({ counter }) => {
    if (counter % 2 === 1) {
      $.late = true
      $.color = ['red', 'green', 'blue'][Math.random() * 3 | 0]
    } else {
      $.late = false
    }
    return () => {
      console.log('disposed?', counter)
    }
  })

  $.effect(({ late }) => {
    $.status = late ? <h1>LATE</h1> : 'early'
  })

  $.effect(({ text, color, counter }) => {
    $.view =
      <div onclick={() => {
        $.text = 'yo'
        $.counter++
      }}>
        hello world {color} {text} {counter}
        <Button color={color} />
      </div>
  })

  return <>
    {$.view}
    {$.status}
  </>
}

render(<App />, document.body)
