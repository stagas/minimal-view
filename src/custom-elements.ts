
// until a getName() is implemented or similar
// we polyfill it to capture the tagNames
// of foreign custom elements
// https://github.com/WICG/webcomponents/issues/566

import { Class } from 'everyday-types'
import { kebab } from 'everyday-utils'

export interface Options<T> extends ElementDefinitionOptions {
  interface?: Class<T>
}

declare const customElements: CustomElementRegistry & {
  getName(ctor: CustomElementConstructor): string | undefined
}

if (!customElements.getName) {
  const tags: WeakMap<typeof HTMLElement, string> = new WeakMap()
  const { define } = customElements
  customElements.define = function (
    name: string,
    ctor: CustomElementConstructor,
    options?: ElementDefinitionOptions,
  ): void {
    tags.set(ctor, name)
    return define.call(customElements, name, ctor, options)
  }
  customElements.getName = function (ctor: CustomElementConstructor) {
    return tags.get(ctor)
  }
}

let monotonicId = 0

export function getTag(name: string) {
  let tag = kebab(name.replace(/[^a-z0-9]/ig, '')).replace('-element', '')
  // custom elements require a hyphen
  if (!tag.includes('-')) tag = `x-${tag}`

  // don't conflict name semi-deterministically in order
  // to avoid invalidating test snapshots
  while (customElements.get(tag) != null) {
    tag += (++monotonicId).toString(36)
  }

  return tag
}
