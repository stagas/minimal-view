/** @jsxImportSource ../src */

// import { Class } from 'everyday-types'
import { effect } from 'minimal-reactive'
import { view, render } from '../src'

// let i = 0
effect.debug = (changed, fn, ...stackErr) => {
  console.groupCollapsed(...changed)
  console.log((fn as any).source)
  stackErr.forEach(err => console.warn(err))
  console.groupEnd()
  // if (i++ > 100) effect.stop()
}

// let inc = 0


const Button = view(class props {
  isActive!: boolean
  onToggle!: () => void
}, class local {
  more?: string
}, ({ $, fx }) => {
  fx(({ onToggle, isActive }) => {
    // console.log('fire', onToggle, isActive)
    $.view =
      <button onclick={onToggle}>{
        isActive ? 'off' : 'on'
      }</button>
  })
  // return ({ isActive, onToggle }) => {
  //   if (isActive) onToggle()
  // }
})

// setTimeout(() => {
//   effect.stop()
// }, 50)

// Button(props: { color: string }) {
//   hook.$ ??= use(props, class local {
//     btn?: HTMLButtonElement
//     view: JSX.Element
//   })

//   const $ = hook.$

//   let someScoped = 0

//   // const id = inc++
//   $.effect(({ color }) => {
//     // console.log('COLOR IS', color)
//     // console.log('I AM', id)
//     $.view = `${color} scoped: ${someScoped++}`
//     // queueMicrotask(() => {
//     // })
//     return () => {
//       console.warn('color disposed')
//     }
//   })

//   return <button ref={$.refs.btn}>{$.view}</button>
// }

// function App() {
//   const $ = use(class local {
//     color = 'pink'
//     text = 'hello'
//     counter = 0
//     late?: boolean
//     some?: Stateful<{
//       prop?: boolean,
//       deep?: Stateful<{ other?: number }>
//     }>
//     status?: JSX.Element
//   })
//     .reduce(
//       ({ counter }) => ({
//         total: counter
//       }))
//     .reduce(
//       ({ color, text }) => ({
//         greeting: color + text
//       }))
//     .pick(
//       ({ some }) => ({
//         prop: some.prop,
//         deepOther: some.deep.other
//       }))

//   $.effect(({ counter, deepOther }) => {
//     if (counter % 2 === 1 + deepOther) {
//       $.late = true
//       $.color = ['red', 'green', 'blue'][Math.random() * 3 | 0]
//     } else {
//       $.late = false
//     }
//     return () => {
//       console.log('disposed?', counter)
//     }
//   })

//   $.effect(({ greeting, late }) => {
//     $.status = greeting + `${late ? <h1>LATE</h1> : 'early'}`
//   })

//   $.effect(({ text, color, counter }) => {
//     $.view =
//       <div onclick={() => {
//         $.text = 'yo'
//         $.counter++
//       }}>
//         hello world {color} {text} {counter}
//         <Button color={color} />
//       </div>
//   })

//   return <>
//     {$.view}
//     {$.status}
//   </>
// }

const App = view(
  class props {
    skata = 1
  }, class local {
  isActive = true
  items: any[] = []
  itemsView: JSX.Element = false
}, ({ $, fn, fx }) => {
  const onToggle = fn(
    ({ isActive }) =>
      () => {
        $.isActive = !isActive
      }
  )

  const addItem = fn(
    ({ isActive }) =>
      isActive
        ? (item: any) => { $.items = [...$.items, item] }
        : () => { console.log('not active') }
  )

  fx(({ items }) => {
    $.itemsView = items.map((item) => <i>{item}<br /></i>)
  })

  fx(({ $, itemsView, isActive }) => {
    // $.view = 'hi'
    $.view = <>
      <Button
        isActive={isActive}
        onToggle={onToggle}
      />

      <button onclick={() => addItem(Math.random())}>add item</button>

      {itemsView}
    </>
  })

  return ($) => {
    $.skata
  }
})

// let isActive = true

render(<App skata={2} />, document.body)
