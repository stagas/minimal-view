/* eslint-disable @typescript-eslint/ban-types */
/** @jsxImportSource ../src */

// import { Class } from 'everyday-types'
import { web, view, render, element, on, queue, enableDebug } from '../src'

// enableDebug(5000)

const drawFns = new Set<any>()
function drawSchedule(fn: any) {
  drawFns.add(fn)
  anim()
}
function drawRemoveSchedule(fn: any) {
  drawFns.delete(fn)
}

function animCall(fn: any) { fn() }
const anim = queue.raf(function animRaf() {
  if (drawFns.size) {
    anim()
    const fns = [...drawFns]
    drawFns.clear()
    fns.forEach(animCall)
  }
})

const Button = web('btn', view(
  class props {
    state!: 'active' | 'inactive'
    isActive!: boolean
    onToggle!: () => void
    children?: JSX.Element
  }, class local {
  more?: string
}, ({ $, fx }) => {
  $.css = /*css*/`
  &([state=active]) {
    button {
      background: teal;
    }
  }
  &([state=inactive]) {
    button {
      background: grey;
    }
  }`

  fx(({ onToggle, isActive, children }) => {
    // console.log('fire', onToggle, isActive)
    $.view = <>
      <button onclick={onToggle}>
        {children}
        &nbsp;
        {isActive ? 'off' : 'on'}
      </button>
    </>
  })
}))

const Wave = web('wave', view(
  class props {
    width = 200
    height = 100
  }, class local {
  canvas?: HTMLCanvasElement
  ctx?: CanvasRenderingContext2D | null
  running = true
}, (({ $, fx, fn, refs }) => {
  $.css = /*css*/`
  canvas {
    background: #000;
    display: flex;
    image-rendering: pixelated;
  }`

  const pr = window.devicePixelRatio

  let t = 0
  let stop = () => { }
  const draw = fn(({ canvas, ctx, width, height }) => {
    stop = () => drawRemoveSchedule(drawTick)
    function drawTick() {
      drawSchedule(drawTick)
      // draw()
      ctx.imageSmoothingEnabled = false
      ctx.fillStyle = '#333'
      ctx.drawImage(canvas, -1, 0, width, height)
      ctx.fillRect(canvas.width - pr, 0, pr, height)
      ctx.fillStyle = '#aaa'
      t += 0.025
      ctx.fillRect(width - pr, (height - pr) * (Math.sin(t) * 0.5 + 0.5), pr, pr)
    }
    return drawTick
  })

  fx(({ canvas }) => {
    $.ctx = canvas.getContext('2d')
  })

  fx.raf(({ ctx, width, height }) => {
    ctx.fillStyle = '#333'
    ctx.fillRect(0, 0, width, height)
    draw()
  })

  fx(({ width, height }) => {
    $.view = <canvas ref={refs.canvas} width={width} height={height}
      onclick={() => {
        if ($.running) {
          stop()
          $.running = false
        } else {
          draw()
          $.running = true
        }
      }}
    />
  })
})))

const App = web('app', view(
  class props {
    numberOfItems = 1
  }, class local {
  host = element
  isActive = true
  items: any[] = []
  itemsView: JSX.Element = false
  scale = 1
}, ({ $, fx }) => {
  $.css = /*css*/`
  & {
    display: flex;
    flex-flow: row wrap;
    background: brown;
    padding: 10px;
    gap: 10px;
    transition: transform 100ms ease-out;
  }
  canvas {
    background: #000;
    display: block;
  }`

  fx.raf(({ host, scale }) => {
    host.style.transform = `scale(${scale})`
  })

  fx(() =>
    on(window, 'wheel').not.passive.prevent.stop.raf((ev) => {
      $.scale = Math.max(0.01, $.scale + ev.deltaY * 0.001)
    })
  )

  fx(({ numberOfItems }) => {
    $.itemsView = Array.from({ length: numberOfItems }, () =>
      <Wave width={200} height={100} />
    )
  })

  fx(({ itemsView }) => {
    $.view = <>
      {itemsView}
    </>
  })
}))

// let isActive = true

render(<>
  <style>{/*css*/`
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
  `}</style>
  <App numberOfItems={1} />
</>, document.body)
