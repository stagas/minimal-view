/* eslint-disable @typescript-eslint/ban-types */
import { Class } from 'everyday-types'
import { css as makeCss } from 'nested-css'

import { getTag, Options } from './custom-elements'
import { jsx, render } from './jsx-runtime'
import { State } from './state'
import { View } from './view'

export type WebElement<TName extends string = '', TProps = {}, TLocal = {}> = {
  new(): WebElement<TName, TProps, TLocal>
  Web: Component<TName, TProps, TLocal>
  Fn: (props: TProps) => JSX.Element
}

export let element: HTMLElement | undefined

export const Classes = [] as any[]

export type Component<TName extends string = '', TProps = {}, TLocal = {}> = (
  (props: TProps) => JSX.Element
) & {
  Fn: (props: TProps) => JSX.Element
  Context: State<TName, TProps, TLocal>['$']
  Element: Class<TProps & HTMLElement> & Component<TName, TProps, TLocal>
  toString(): string
}

// export type Context<T extends Component<any, TProps, TLocal>, TProps = {}, TLocal = {}> = TProps & TLocal

export function web<TName extends string = '', TProps = {}, TLocal = {}>(
  fn: View<TName, TProps, TLocal>,
  options?: Options<TProps>,
  parent: typeof HTMLElement = HTMLElement
): WebElement<TName, TProps, TLocal>['Web'] {
  fn.defaultProps = { css: '' }
  fn.onInit = (state, update) => {
    // state.name = name
    // @ts-ignore
    state.fx(function updateCss({ css }) {
      (state.$ as any).__style =
        jsx('style', { children: makeCss`${css}`() }, void 0)
      update()
    })
  }
  const tag = getTag(fn.viewName)

  const Web: Component<TName, TProps, TLocal> = (props: TProps) =>
    jsx(tag, props, void 0)

  Web.Fn = fn as any
  Web.Context = {} as any
  Web.toString = () => tag!

  class ctor extends parent {
    static Web = Web
    static Fn = fn
    onprops(props: TProps) {
      element = this
      render(
        jsx(fn, props, void 0),
        this.shadowRoot ?? this.attachShadow({ mode: 'open' })
      )
    }
    disconnectedCallback() {
      queueMicrotask(() => {
        if (!this.isConnected && this.shadowRoot) {
          render(null, this.shadowRoot)
        }
      })
    }
  }

  Web.Element = ctor as any

  Object.defineProperty(ctor, 'name', { value: tag })
  customElements.define(tag, ctor, options)
  Classes.push(ctor)

  return ctor.Web as any
}
