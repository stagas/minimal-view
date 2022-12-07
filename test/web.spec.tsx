/** @jsxImportSource ../src */
// @env jsdom
import { web, view, render, hook } from '../src'

const html = (div: any) => div.firstChild.shadowRoot.innerHTML as string

const div = () => document.createElement('div')

const query = (div: any, sel = 'p') => [...div.firstChild.shadowRoot.querySelectorAll(sel)]

const task = async () => {
  await Promise.resolve()
  await Promise.resolve()
}

describe('web', () => {
  it('works', async () => {
    const X = web('x', view(class props { }, class local { }, ({ $, fns }) => ({}), ({ $, fx }) => {
      fx(() => {
        $.view = <p>one</p>
      })
    }))

    const el = render(<X />, div())
    expect(el.outerHTML).toBe('<div><x-x></x-x></div>')
    await task()
    expect(html(el)).toBe('<style></style><p>one</p>')
  })

  it('keyed add', async () => {
    const X = web('x', view(class props {
      count?= 1
    }, class local { }, ({ $, fns }) => ({}), ({ $, fx }) => {
      fx(({ count }) => {
        $.view = Array.from({ length: count }, (_, i) =>
          <p key={i}>{i}</p>
        )
      })
    }))

    const el = render(<X />, div())
    expect(el.outerHTML).toBe('<div><x-x1></x-x1></div>')
    await task()
    expect(html(el)).toBe('<style></style><p>0</p>')
    const els = query(el)
    expect(els.length).toBe(1)

    render(<X count={2} />, el)
    await task()
    expect(html(el)).toBe('<style></style><p>0</p><p>1</p>')
    const res = query(el)
    expect(res.length).toBe(2)
    expect(els[0]).toBe(res[0])
  })

  it('keyed components add', async () => {
    const Y = view(class props {
      children?: JSX.Element
    }, class local { }, ({ $, fns }) => ({}), ({ $, fx }) => {
      fx(({ children }) => {
        $.view = <p>{children}</p>
      })
    })

    const X = web('x', view(class props {
      count?= 1
    }, class local { }, ({ $, fns }) => ({}), ({ $, fx }) => {
      fx(({ count }) => {
        $.view = Array.from({ length: count }, (_, i) =>
          <Y key={i}>{i}</Y>
        )
      })
    }))

    const el = render(<X />, div())
    expect(el.outerHTML).toBe('<div><x-x2></x-x2></div>')
    await task()
    await task()
    expect(html(el)).toBe('<style></style><p>0</p>')
    const els = query(el)
    expect(els.length).toBe(1)

    render(<X count={2} />, el)
    await task()
    await task()
    expect(html(el)).toBe('<style></style><p>0</p><p>1</p>')
    const res = query(el)
    expect(res.length).toBe(2)
    expect(els[0]).toBe(res[0])
  })

  it('keyed components unshift', async () => {
    const Y = view(class props {
      children?: JSX.Element
    }, class local { }, ({ $, fns }) => ({}), ({ $, fx }) => {
      fx(({ children }) => {
        $.view = <p>{children}</p>
      })
    })

    const X = web('x', view(class props {
      count?= 1
    }, class local { }, ({ $, fns }) => ({}), ({ $, fx }) => {
      fx(({ count }) => {
        $.view = Array.from({ length: count }, (_, i) =>
          <Y key={count - i}>{count - i}</Y>
        )
      })
    }))

    const el = render(<X />, div())
    expect(el.outerHTML).toBe('<div><x-x3></x-x3></div>')
    await task()
    await task()
    expect(html(el)).toBe('<style></style><p>1</p>')
    const els = query(el)
    expect(els.length).toBe(1)

    render(<X count={2} />, el)
    await task()
    await task()
    expect(html(el)).toBe('<style></style><p>2</p><p>1</p>')
    const res = query(el)
    expect(res.length).toBe(2)
    expect(els[0]).toBe(res[1])

    render(<X count={3} />, el)
    await task()
    await task()
    expect(html(el)).toBe('<style></style><p>3</p><p>2</p><p>1</p>')
    const res2 = query(el)
    expect(res2.length).toBe(3)
    expect(els[0]).toBe(res2[2])
    expect(res[0]).toBe(res2[1])
  })

  it('keyed components hook unshift', async () => {
    let count = 1

    const Y = view(class props {
      children?: JSX.Element
    }, class local { }, ({ $, fns }) => ({}), ({ $, fx }) => {
      fx(({ children }) => {
        $.view = <p>{children}</p>
      })
    })

    const X = web('x', view(class props {
      count?= 1
    }, class local { }, ({ $, fns }) => ({}), ({ $, fx }) => {
      fx(({ count }) => {
        const El = (_: any, i: number) =>
          <Y key={count - i}>{count - i}</Y>

        $.view = Array.from({ length: count }, El)
      })
    }))

    let update: any
    const Z = () => {
      update = hook
      return <X count={count} />
    }

    const el = render(<Z />, div())
    expect(el.outerHTML).toBe('<div><x-x4></x-x4></div>')
    await task()
    await task()
    expect(html(el)).toBe('<style></style><p>1</p>')
    const els = query(el)
    expect(els.length).toBe(1)

    count = 2
    update()
    await task()
    await task()
    expect(html(el)).toBe('<style></style><p>2</p><p>1</p>')
    const res = query(el)
    expect(res.length).toBe(2)
    expect(els[0]).toBe(res[1])

    count = 3
    update()
    await task()
    await task()
    expect(html(el)).toBe('<style></style><p>3</p><p>2</p><p>1</p>')
    const res2 = query(el)
    expect(res2.length).toBe(3)
    expect(els[0]).toBe(res2[2])
    expect(res[0]).toBe(res2[1])
  })
})
