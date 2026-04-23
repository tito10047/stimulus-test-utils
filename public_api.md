# `@tito10047/stimulus-test-utils` — Public API

A zero‑config, Testing‑Library‑flavoured test harness for [Stimulus](https://stimulus.hotwired.dev) controllers. Author your tests in plain JavaScript or TypeScript, mount a controller with one call, simulate user interactions, and assert DOM / controller state — without ever touching JSDOM, the Stimulus `Application`, or `MutationObserver` timing by hand.

## Installation

```bash
npm install -D @tito10047/stimulus-test-utils @hotwired/stimulus vitest happy-dom
```

`@hotwired/stimulus` is a **peer dependency** — you bring the version your app uses.

With Vitest, enable the DOM environment once in `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'
export default defineConfig({
  test: {
    environment: 'happy-dom',
    setupFiles: ['@tito10047/stimulus-test-utils/register'],
  },
})
```

The optional `/register` side‑effect module wires `afterEach(cleanup)` for you. Prefer manual wiring? Skip `setupFiles` and call `cleanup()` yourself.

## 60‑second example

Given this controller:

```js
// hello_controller.js
import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  static targets = ['name', 'output']
  static values = { greeting: { type: String, default: 'Hello' } }

  greet() {
    this.outputTarget.textContent = `${this.greetingValue}, ${this.nameTarget.value}!`
  }
}
```

Here is a complete test:

```js
import { render, attr } from '@tito10047/stimulus-test-utils'
import { expect, test } from 'vitest'
import HelloController from './hello_controller.js'

test('greets by name', async () => {
  const { element, controller, user, getByRole } = await render(HelloController, {
    html: `
      <div ${attr.controller('hello', { greeting: 'Hi' })}>
        <input ${attr.target('hello', 'name')} />
        <button ${attr.action('hello', 'greet', 'click')}>Greet</button>
        <span ${attr.target('hello', 'output')}></span>
      </div>
    `,
  })

  await user.type(element.querySelector('input'), 'Ada')
  await user.click(getByRole('button', { name: 'Greet' }))

  expect(controller.outputTarget.textContent).toBe('Hi, Ada!')
})
```

No `Application.start()`. No `document.body.innerHTML = …`. No manual `await nextTick()`. That is the entire story.

The `attr` helpers are optional — plain `data-*` attributes work equally well. They exist purely to keep fixtures refactor‑safe and free of typos. See [HTML attribute helpers](#html-attribute-helpers) below.

---

## `render(ControllerClass, options)`

```ts
const result = await render(ControllerClass, options)
```

Mounts `options.html` into the DOM, starts a Stimulus `Application`, registers the controller under the inferred (or provided) identifier, and **waits for `connect()` to fire** before resolving.

### Options

| Option | Type | Default | Description |
|---|---|---|---|
| `html` | `string \| HTMLElement` | — **(required)** | Fixture to mount. Strings are parsed as HTML and appended to `container`. Existing elements are used in place. |
| `identifier` | `string` | inferred from class name | Stimulus identifier, e.g. `"hello-world"` for `HelloWorldController`. Required for anonymous/minified classes. |
| `controllers` | `Record<string, ControllerConstructor>` | `{}` | Extra controllers to register (outlets, nested controllers, helpers). |
| `application` | `Application` | fresh instance | Bring your own pre‑configured Stimulus `Application` (e.g. with custom `schema` or `errorHandler`). |
| `container` | `HTMLElement` | `document.body` | Where to attach the fixture. |

### Return value — `RenderResult`

```ts
{
  controller,    // the instantiated controller, post-connect()
  element,       // the [data-controller~="<identifier>"] root
  application,   // the Stimulus Application
  user,          // UserEvent helpers (see below)
  waitFor,       // async assertion helper
  rerender,      // replace the fixture HTML
  unmount,       // stop app + remove fixture
  // Scoped query helpers (see below):
  getByTestId, queryByTestId, findByTestId, getAllByTestId,
  getByRole,   queryByRole,   findByRole,   getAllByRole,
  getByText,   queryByText,   findByText,   getAllByText,
  getByLabelText, queryByLabelText, findByLabelText,
}
```

---

## HTML attribute helpers

Writing Stimulus fixtures as raw strings is error‑prone: a typo in `data-hello-greeting-value` silently becomes *undefined* at runtime and your test fails with a confusing message. The package ships tiny, dependency‑free helpers that return ready‑to‑interpolate attribute specs — so your fixtures stay readable *and* refactor‑safe.

```ts
import { attr } from '@tito10047/stimulus-test-utils'
```

### `AttrSpec` — return type of every helper

Every helper returns an **`AttrSpec`** object, not a raw `string`. `AttrSpec` implements `Symbol.toPrimitive` / `toString()` / `toJSON()`, so it serializes transparently inside template literals:

```ts
`<div ${attr.controller('hello')}>`
// => '<div data-controller="hello">'
```

You never need to call `.toString()` manually — JavaScript does it for you whenever an `AttrSpec` is interpolated into a string. The reason helpers return an object (not a plain string) is **composition**: `attr.combine()` merges multiple specs by reading their structured data, not by parsing strings — no brittle regex, no HTML‑escape footguns.

```ts
interface AttrSpec {
  toString(): string
  toJSON(): string
  [Symbol.toPrimitive](hint: string): string
}
```

> **Note:** `typeof spec === 'object'`, not `'string'`. If you need a plain string (e.g. to pass to a non‑template‑literal API), call `String(spec)` or `` `${spec}` ``.

### `attr.controller(identifier, values?, classes?, outlets?)`

Produces the `data-controller` attribute plus every `data-<identifier>-*-value`, `data-<identifier>-*-class`, and `data-<identifier>-*-outlet` attribute in one call.

```ts
attr.controller('hello')
// => 'data-controller="hello"'

attr.controller('hello', { greeting: 'Hi', count: 3, active: true })
// => 'data-controller="hello" data-hello-greeting-value="Hi" data-hello-count-value="3" data-hello-active-value="true"'

attr.controller('hello', { user: { name: 'Ada' } })
// => 'data-controller="hello" data-hello-user-value="{&quot;name&quot;:&quot;Ada&quot;}"'

attr.controller('modal', {}, { open: 'is-open', closed: 'is-closed' })
// => 'data-controller="modal" data-modal-open-class="is-open" data-modal-closed-class="is-closed"'

attr.controller('modal', {}, {}, { dialog: "[data-controller~='dialog']" })
// => 'data-controller="modal" data-modal-dialog-outlet="[data-controller~=&#39;dialog&#39;]"'
```

Signature:

```ts
function controller(
  identifier: string,
  values?: Record<string, string | number | boolean | object | null>,
  classes?: Record<string, string>,
  outlets?: Record<string, string>,
): AttrSpec
```

- Keys are converted from `camelCase` / `snake_case` to Stimulus' `kebab-case` automatically (`greetingMessage` → `greeting-message`).
- Non‑string values are `JSON.stringify`‑ed, matching Stimulus' value‑type coercion rules (`Number`, `Boolean`, `Object`, `Array`).
- All attribute values are HTML‑escaped so quotes and `<`/`>` in your data can never break the fixture.

To attach **multiple** controllers to the same element, use [`attr.combine()`](#attrcombinespecs--merge-multiple-attrspecs-onto-one-element) — do **not** pass an array here. A single `attr.controller` call always describes exactly one controller.

### `attr.target(identifier, ...names)`

Produces `data-<identifier>-target="name1 name2 …"`.

```ts
attr.target('hello', 'name')
// => 'data-hello-target="name"'

attr.target('hello', 'name', 'output')
// => 'data-hello-target="name output"'
```

Signature:

```ts
function target(identifier: string, ...targetNames: string[]): AttrSpec
```

### `attr.action(identifier, method, event?, options?)`

Produces a single `data-action` descriptor. If the element already has other actions, concatenate the returned string inside one `data-action="…"` attribute, or use multiple calls separated by a space:

```ts
attr.action('hello', 'greet')
// => 'data-action="hello#greet"'            (default event for the element type)

attr.action('hello', 'greet', 'click')
// => 'data-action="click->hello#greet"'

attr.action('hello', 'submit', 'submit', { prevent: true, stop: true })
// => 'data-action="submit->hello#submit:prevent:stop"'

attr.action('hello', 'onKey', 'keydown.enter')
// => 'data-action="keydown.enter->hello#onKey"'
```

Signature:

```ts
function action(
  identifier: string,
  method: string,
  event?: string,                                       // e.g. 'click', 'keydown.enter'
  options?: { prevent?: boolean; stop?: boolean; once?: boolean; passive?: boolean; capture?: boolean; self?: boolean },
): AttrSpec
```

To attach **multiple** actions to the same element, wrap them with [`attr.combine()`](#attrcombinespecs--merge-multiple-attrspecs-onto-one-element). `attr.combine` merges every `data-action` descriptor into a single attribute automatically:

```ts
import { attr } from '@tito10047/stimulus-test-utils'

attr.combine(
  attr.action('hello', 'greet', 'click'),
  attr.action('hello', 'reset', 'dblclick'),
)
// => 'data-action="click->hello#greet dblclick->hello#reset"'
```

### `attr.combine(...specs)` — merge multiple `AttrSpec`s onto one element

When a single DOM node needs **more than one** helper — two controllers, a controller + a target, multiple actions — wrap them with `attr.combine()`. It merges the underlying structured data (not strings!) and emits a single, well‑formed set of HTML attributes.

```ts
import { attr } from '@tito10047/stimulus-test-utils'

// Two controllers on one element — data-controller tokens are merged:
`<div ${attr.combine(
  attr.controller('hello', { greeting: 'Hi' }),
  attr.controller('tooltip', { text: 'Hey' }),
)}>`
// => <div data-controller="hello tooltip"
//         data-hello-greeting-value="Hi"
//         data-tooltip-text-value="Hey">

// Multiple actions on one button — data-action descriptors are merged:
`<button ${attr.combine(
  attr.action('hello', 'greet', 'click'),
  attr.action('hello', 'reset', 'dblclick'),
)}>Greet</button>`
// => <button data-action="click->hello#greet dblclick->hello#reset">

// Mixed: controller + target + action on the same node:
`<div ${attr.combine(
  attr.controller('modal'),
  attr.target('parent', 'slot'),
  attr.action('modal', 'open', 'click'),
)}>`
// => <div data-controller="modal"
//         data-parent-target="slot"
//         data-action="click->modal#open">
```

Signature:

```ts
function combine(...specs: AttrSpec[]): AttrSpec
```

Key semantics:

- **Returns an `AttrSpec`**, so `attr.combine(a, attr.combine(b, c))` is valid and flattens.
- **`data-controller`** tokens from every `attr.controller` spec are concatenated (space‑separated, de‑duplicated).
- **`data-action`** descriptors from every `attr.action` spec are concatenated into a single attribute.
- **Values / classes / outlets / targets** carry their identifier prefix, so they never collide across controllers.
- **Duplicate identifiers throw at call time.** Passing the same identifier twice — e.g. `attr.combine(attr.controller('hello'), attr.controller('hello', { foo: 1 }))` — throws `Error: combine(): duplicate Stimulus controller identifier "hello". Declare each controller once and pass all its values/classes/outlets in a single stimulusController() call.` This prevents accidentally "merging" values from two conflicting declarations and matches how Stimulus itself treats duplicate identifiers on one element.

Ordering is preserved: the first spec's tokens appear first in `data-controller` / `data-action`, which can matter for Stimulus action dispatch order.

### Why not just use plain `data-*`?

You absolutely can — nothing in `render()` requires the helpers. They exist because:

- **Typos surface at import time**, not as a silently failing test.
- **Refactoring the identifier** (`hello` → `greeting`) becomes a one‑line change.
- **Value serialization** (objects, booleans) is done for you with the same rules Stimulus itself uses.
- **HTML escaping** is automatic, so you can safely drop `"`, `<`, `&` into values.
- **Composition is a real merge**, not string concatenation — see [`attr.combine()`](#attrcombinespecs--merge-multiple-attrspecs-onto-one-element) above.

---

## Simulating user interactions — `user`

All methods return a `Promise` that resolves **after** Stimulus' `MutationObserver` has flushed, so your assertions see a stable DOM.

```ts
await user.click(element)
await user.dblClick(element)
await user.hover(element)
await user.type(input, 'hello world')   // fires input + change per character
await user.clear(input)
await user.keyboard('{Enter}')           // '{Shift>}A{/Shift}', '{Backspace}', '{ArrowDown}'
await user.tab()                         // Tab key; pass { shift: true } for Shift+Tab
await user.selectOption(selectEl, 'value-b')
await user.submit(formEl)
```

### Low‑level escape hatch — `fireEvent`

```ts
import { fireEvent } from '@tito10047/stimulus-test-utils'

await fireEvent(element, 'custom:event', { detail: { foo: 1 } })
await fireEvent(input, new InputEvent('input', { data: 'x' }))
```

---

## Querying the DOM

The query helpers returned from `render()` are **scoped** to the mount container, so tests don't accidentally match elements from previous fixtures or from Vitest's reporter DOM.

```ts
const { getByRole, queryByText, findByTestId } = await render(MyController, { html })

getByRole('button', { name: /save/i })      // throws if not found
queryByText('Loading…')                      // null if not found
await findByTestId('result')                 // waits up to 1s (polls)
```

Prefer `@testing-library/dom`? Use it alongside — our container is a plain `HTMLElement`:

```ts
import { within } from '@testing-library/dom'
const { element } = await render(MyController, { html })
within(element).getByRole('button')
```

---

## Async assertions — `waitFor`, `nextTick`

```ts
await waitFor(() => {
  expect(controller.outputTarget.textContent).toBe('done')
})

// Custom timing:
await waitFor(callback, { timeout: 2000, interval: 50 })

// Force Stimulus' MutationObserver to flush (rarely needed):
import { nextTick } from '@tito10047/stimulus-test-utils'
await nextTick()
```

---

## Asserting Stimulus state

`controller` is *your* class instance — assert on it directly, with full TypeScript intellisense:

```ts
expect(controller.nameTarget.value).toBe('Ada')
expect(controller.hasOutputTarget).toBe(true)
expect(controller.greetingValue).toBe('Hi')
expect(controller.outputTargets).toHaveLength(2)
```

---

## Testing outlets & nested controllers

```ts
import ModalController from './modal_controller.js'
import DialogController from './dialog_controller.js'

const { controller, user, getByRole } = await render(ModalController, {
  identifier: 'modal',
  controllers: { dialog: DialogController },
  html: `
    <div data-controller="modal" data-modal-dialog-outlet="[data-controller~='dialog']">
      <button data-action="click->modal#open">Open</button>
    </div>
    <div data-controller="dialog" hidden></div>
  `,
})

await user.click(getByRole('button', { name: 'Open' }))
expect(controller.dialogOutlet.element.hidden).toBe(false)
```

---

## Testing async actions (e.g. `fetch`)

```ts
import { vi } from 'vitest'
import SearchController from './search_controller.js'

test('renders results', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
    new Response(JSON.stringify([{ id: 1, name: 'Ada' }]), { status: 200 })
  ))

  const { user, waitFor, getByRole, getAllByRole } = await render(SearchController, {
    html: `
      <div data-controller="search">
        <input data-search-target="query" />
        <button data-action="click->search#submit">Search</button>
        <ul data-search-target="results"></ul>
      </div>
    `,
  })

  await user.type(getByRole('textbox'), 'ada')
  await user.click(getByRole('button', { name: 'Search' }))

  await waitFor(() => {
    expect(getAllByRole('listitem')).toHaveLength(1)
  })
})
```

---

## Re‑rendering a fixture

```ts
const { rerender, controller } = await render(CounterController, {
  html: `<div data-controller="counter" data-counter-count-value="0"></div>`,
})

await rerender({
  html: `<div data-controller="counter" data-counter-count-value="5"></div>`,
})

expect(controller.countValue).toBe(5)
```

---

## Cleanup

```ts
import { cleanup } from '@tito10047/stimulus-test-utils'
import { afterEach } from 'vitest'

afterEach(cleanup)   // or import '@tito10047/stimulus-test-utils/register'
```

`cleanup()`:
- stops every `Application` created by `render()`,
- removes every mounted fixture from the DOM,
- empties the internal registry so the next test starts pristine.

`unmount()` from a single `RenderResult` does the same for just that test.

---

## TypeScript

`render` is fully generic in the controller class, so targets/values are typed for free:

```ts
import { render } from '@tito10047/stimulus-test-utils'
import HelloController from './hello_controller'

const { controller } = await render(HelloController, { html: '…' })
controller.greetingValue  // string
controller.nameTarget     // HTMLInputElement (from your `declare`)
```

---

## Sub-folder controllers & path-style identifiers

Stimulus controllers living under sub-folders (Symfony UX / Asset Mapper convention) use a **double-dash** separator in their identifier:

```
./assets/controllers/MyApp/MyController_controller.js → "myapp--mycontroller"
./assets/controllers/Users/List_controller.js         → "users--list"
```

Every `attr` helper — plus `render(options.identifier)` — **auto-normalizes** any of these inputs:

```ts
attr.controller('MyApp/MyController', { greeting: 'Hi' })
// => data-controller="myapp--mycontroller" data-myapp--mycontroller-greeting-value="Hi"

attr.controller('./assets/controllers/MyApp/Hello_controller.js')
// => data-controller="myapp--hello"

attr.controller('myapp--mycontroller')   // already canonical → untouched
```

Rules:
- `/` becomes `--`.
- Every segment is **lowercased as a whole** — `MyApp` → `myapp` (no kebab-case split).
- Trailing `_controller` / `-controller` on the last segment is stripped.
- Leading `./`, `assets/`, `controllers/` and the file extension are stripped.

Standalone exports if you want the conversion without a helper:

```ts
import { identifierFromPath, normalizeIdentifier } from '@tito10047/stimulus-test-utils'

identifierFromPath('MyApp/MyController_controller.js') // 'myapp--mycontroller'
normalizeIdentifier('hello')                           // 'hello' (untouched)
```

---

## Symfony Asset Mapper / `importmap` users

The package ships **plain ESM + `.d.ts`** with no CommonJS and no bundler‑specific syntax. You can point an `importmap` at `node_modules/@tito10047/stimulus-test-utils/dist/index.js` and it will run untouched in Vitest (Node) *or* in a browser‑based test runner.

---

## Roadmap (non‑binding)

- Turbo‑Frames / Turbo‑Streams companion helpers.
- Playwright / in‑browser runner adapter.
- `@testing-library/user-event` adapter for users who want full keyboard fidelity.
