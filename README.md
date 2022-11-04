

<h1>
minimal-view <a href="https://npmjs.org/package/minimal-view"><img src="https://img.shields.io/badge/npm-v1.0.0-F00.svg?colorA=000"/></a> <a href="src"><img src="https://img.shields.io/badge/loc-133-FFF.svg?colorA=000"/></a> <a href="https://cdn.jsdelivr.net/npm/minimal-view@1.0.0/dist/minimal-view.min.js"><img src="https://img.shields.io/badge/brotli-3.2K-333.svg?colorA=000"/></a> <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-F0B.svg?colorA=000"/></a>
</h1>

<p></p>

Minimal reactive component view library.

<h4>
<table><tr><td title="Triple click to select and copy paste">
<code>npm i minimal-view </code>
</td><td title="Triple click to select and copy paste">
<code>pnpm add minimal-view </code>
</td><td title="Triple click to select and copy paste">
<code>yarn add minimal-view</code>
</td></tr></table>
</h4>

## Examples

<details id="example$web" title="web" open><summary><span><a href="#example$web">#</a></span>  <code><strong>web</strong></code></summary>  <ul>    <details id="source$web" title="web source code" ><summary><span><a href="#source$web">#</a></span>  <code><strong>view source</strong></code></summary>  <a href="example/web.tsx">example/web.tsx</a>  <p>

```tsx
/** @jsxImportSource minimal-view */

import { render, use } from 'minimal-view'

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
```

</p>
</details></ul></details>


## API

<p>  <details id="Deps$26" title="TypeAlias" ><summary><span><a href="#Deps$26">#</a></span>  <code><strong>Deps</strong></code>    </summary>  <a href=""></a>  <ul><p>[K   in   keyof     <a href="#T$27">T</a>  ]-?:  <span>NonNullable</span>&lt;<a href="#T$27">T</a>  [<span>K</span>]&gt;</p>        </ul></details><details id="Props$28" title="TypeAlias" ><summary><span><a href="#Props$28">#</a></span>  <code><strong>Props</strong></code>    </summary>  <a href=""></a>  <ul><p>{<p>  <details id="effect$30" title="Property" ><summary><span><a href="#effect$30">#</a></span>  <code><strong>effect</strong></code>    </summary>  <a href=""></a>  <ul><p><details id="__type$31" title="Function" ><summary><span><a href="#__type$31">#</a></span>  <em>(fn)</em>    </summary>    <ul>    <p>    <details id="fn$33" title="Function" ><summary><span><a href="#fn$33">#</a></span>  <code><strong>fn</strong></code><em>(deps)</em>    </summary>    <ul>    <p>    <details id="deps$36" title="Parameter" ><summary><span><a href="#deps$36">#</a></span>  <code><strong>deps</strong></code>    </summary>    <ul><p><a href="#Deps$26">Deps</a>&lt;<a href="#T$39">T</a>&gt;</p>        </ul></details>  <p><strong>fn</strong><em>(deps)</em>  &nbsp;=&gt;  <ul>void</ul></p></p>    </ul></details>  <p><strong></strong><em>(fn)</em>  &nbsp;=&gt;  <ul>void</ul></p></p>    </ul></details></p>        </ul></details><details id="ref$38" title="Property" ><summary><span><a href="#ref$38">#</a></span>  <code><strong>ref</strong></code>    </summary>  <a href=""></a>  <ul><p>any</p>        </ul></details><details id="view$37" title="Property" ><summary><span><a href="#view$37">#</a></span>  <code><strong>view</strong></code>    </summary>  <a href=""></a>  <ul><p><span>JSX.Element</span></p>        </ul></details></p>} &amp; [K   in   keyof     <a href="#T$39">T</a>  ]:  <a href="#T$39">T</a>  [<span>K</span>]</p>        </ul></details><details id="effect$13" title="Function" ><summary><span><a href="#effect$13">#</a></span>  <code><strong>effect</strong></code><em>(deps, fn)</em>    </summary>  <a href=""></a>  <ul>    <p>    <details id="deps$16" title="Parameter" ><summary><span><a href="#deps$16">#</a></span>  <code><strong>deps</strong></code>    </summary>    <ul><p><a href="#T$15">T</a></p>        </ul></details><details id="fn$17" title="Parameter" ><summary><span><a href="#fn$17">#</a></span>  <code><strong>fn</strong></code>    </summary>    <ul><p><span>Fx</span>&lt;<a href="#T$15">T</a>&gt;</p>        </ul></details>  <p><strong>effect</strong>&lt;<span>T</span><span>&nbsp;extends&nbsp;</span>     <span>Boxs</span>&lt;any&gt;&gt;<em>(deps, fn)</em>  &nbsp;=&gt;  <ul>void</ul></p></p>    </ul></details><details id="render$18" title="Function" ><summary><span><a href="#render$18">#</a></span>  <code><strong>render</strong></code><em>(n)</em>    </summary>  <a href=""></a>  <ul>    <p>    <details id="n$20" title="Parameter" ><summary><span><a href="#n$20">#</a></span>  <code><strong>n</strong></code>    </summary>    <ul><p><span>VKid</span></p>        </ul></details>  <p><strong>render</strong><em>(n)</em>  &nbsp;=&gt;  <ul><span>DocumentFragment</span></ul></p>  <details id="n$22" title="Parameter" ><summary><span><a href="#n$22">#</a></span>  <code><strong>n</strong></code>    </summary>    <ul><p><span>VKid</span></p>        </ul></details><details id="el$23" title="Parameter" ><summary><span><a href="#el$23">#</a></span>  <code><strong>el</strong></code>    </summary>    <ul><p><span>TargetEl</span></p>        </ul></details><details id="doc$24" title="Parameter" ><summary><span><a href="#doc$24">#</a></span>  <code><strong>doc</strong></code>    </summary>    <ul><p><span>Doc</span></p>        </ul></details><details id="withNull$25" title="Parameter" ><summary><span><a href="#withNull$25">#</a></span>  <code><strong>withNull</strong></code>    </summary>    <ul><p>boolean</p>        </ul></details>  <p><strong>render</strong><em>(n, el, doc, withNull)</em>  &nbsp;=&gt;  <ul><span>TargetEl</span></ul></p></p>    </ul></details><details id="use$1" title="Function" ><summary><span><a href="#use$1">#</a></span>  <code><strong>use</strong></code><em>(ctor)</em>    </summary>  <a href=""></a>  <ul>    <p>    <details id="ctor$4" title="Parameter" ><summary><span><a href="#ctor$4">#</a></span>  <code><strong>ctor</strong></code>    </summary>    <ul><p><span>Class</span>&lt;<a href="#T$3">T</a>&gt;</p>        </ul></details>  <p><strong>use</strong>&lt;<span>T</span>&gt;<em>(ctor)</em>  &nbsp;=&gt;  <ul><a href="#Props$28">Props</a>&lt;<a href="#T$3">T</a>&gt;</ul></p>  <details id="props$7" title="Parameter" ><summary><span><a href="#props$7">#</a></span>  <code><strong>props</strong></code>    </summary>    <ul><p><a href="#U$6">U</a></p>        </ul></details>  <p><strong>use</strong>&lt;<span>U</span>&gt;<em>(props)</em>  &nbsp;=&gt;  <ul><a href="#Props$28">Props</a>&lt;<a href="#U$6">U</a>&gt;</ul></p>  <details id="props$11" title="Parameter" ><summary><span><a href="#props$11">#</a></span>  <code><strong>props</strong></code>    </summary>    <ul><p><a href="#U$10">U</a></p>        </ul></details><details id="ctor$12" title="Parameter" ><summary><span><a href="#ctor$12">#</a></span>  <code><strong>ctor</strong></code>    </summary>    <ul><p><span>Class</span>&lt;<a href="#T$9">T</a>&gt;</p>        </ul></details>  <p><strong>use</strong>&lt;<span>T</span>, <span>U</span>&gt;<em>(props, ctor)</em>  &nbsp;=&gt;  <ul><a href="#Props$28">Props</a>&lt;<a href="#U$10">U</a> &amp; <a href="#T$9">T</a>&gt;</ul></p></p>    </ul></details></p>

## Credits
- [argtor](https://npmjs.org/package/argtor) by [stagas](https://github.com/stagas) &ndash; Extracts destructured argument names from a function.
- [everyday-types](https://npmjs.org/package/everyday-types) by [stagas](https://github.com/stagas) &ndash; Everyday utility types
- [everyday-utils](https://npmjs.org/package/everyday-utils) by [stagas](https://github.com/stagas) &ndash; Everyday utilities
- [html-vdom](https://npmjs.org/package/html-vdom) by [stagas](https://github.com/stagas) &ndash; JSX virtual DOM using standard HTML
- [minimal-reactive](https://npmjs.org/package/minimal-reactive) by [stagas](https://github.com/stagas) &ndash; Smallest possible implementation of reactive programming, effects and dependencies.
- [proxy-toolkit](https://npmjs.org/package/proxy-toolkit) by [stagas](https://github.com/stagas) &ndash; Proxy toolkit.

## Contributing

[Fork](https://github.com/stagas/minimal-view/fork) or [edit](https://github.dev/stagas/minimal-view) and submit a PR.

All contributions are welcome!

## License

<a href="LICENSE">MIT</a> &copy; 2022 [stagas](https://github.com/stagas)
