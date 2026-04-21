# Rendering controllers

`render()` is the single entry point of the library. Everything else — queries, user events, cleanup — hangs off the object it returns.

## Signature

```ts
function render<T extends Controller>(
  ControllerClass: ControllerConstructor<T>,
  options: RenderOptions,
): Promise<RenderResult<T>>
```

It is always **async**. The returned promise resolves **after** Stimulus' `MutationObserver` has fired and `connect()` has run, so the controller and its targets are ready for assertions on the very next line.

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `html` | `string \| HTMLElement` | **required** | Fixture to mount. Strings are parsed as HTML and appended to `container`; an `HTMLElement` is used as-is. |
| `identifier` | `string` | inferred | Stimulus identifier, e.g. `"hello-world"` for `HelloWorldController`. Required for anonymous or minified classes. |
| `controllers` | `Record<string, ControllerConstructor>` | `{}` | Extra controllers to register for outlets, nested controllers, and helpers. |
| `application` | `Application` | new instance | Bring your own preconfigured `Application` (custom `schema`, `errorHandler`, debug mode…). |
| `container` | `HTMLElement` | `document.body` | DOM node the fixture is attached to. |

### `html`

Pass a template literal with your fixture. Whitespace is preserved — use it to keep fixtures readable.

```ts
await render(HelloController, {
  html: `
    <div data-controller="hello">
      <span data-hello-target="output"></span>
    </div>
  `,
})
```

If you already have an element (for example from a server-rendered HTML snapshot), pass it directly:

```ts
const tmpl = document.createElement('template')
tmpl.innerHTML = '<div data-controller="hello"></div>'
await render(HelloController, { html: tmpl.content.firstElementChild as HTMLElement })
```

### `identifier`

By default, the identifier is derived from the class name:

| Class name | Inferred identifier |
|---|---|
| `HelloController` | `hello` |
| `FormValidatorController` | `form-validator` |
| `MyApp--UserController` | `my-app--user` |

Pass `identifier` explicitly when:

- the class is anonymous or exported as default without a name,
- your bundler mangles class names in production tests,
- your controller lives in a sub-folder and you want the Symfony UX identifier (`myapp--hello`).

```ts
await render(FormValidatorController, {
  identifier: 'form-validator',
  html: '<div data-controller="form-validator"></div>',
})
```

### `controllers`

When the controller under test declares `static outlets` or relies on other controllers being present in the DOM, register them here:

```ts
await render(ModalController, {
  controllers: { dialog: DialogController },
  html: `
    <div data-controller="modal" data-modal-dialog-outlet="[data-controller~='dialog']"></div>
    <section data-controller="dialog" hidden></section>
  `,
})
```

The keys are the identifiers under which the extra controllers are registered. See [Multiple controllers & outlets](./multiple-controllers.md) for patterns.

### `application`

Use this when you need custom Stimulus configuration — for example a custom `errorHandler` to surface controller exceptions:

```ts
import { Application } from '@hotwired/stimulus'

const application = Application.start()
application.handleError = (error) => { throw error }

await render(MyController, { application, html: '…' })
```

`render()` will start the provided application if it is not already started, register the controller on it, and hand it back in the `RenderResult`.

### `container`

By default the fixture is appended to `document.body`. Pass `container` to mount it elsewhere — useful when you want to test controllers inside a Shadow DOM host, inside an `<iframe>`'s document, or inside another fixture:

```ts
const host = document.createElement('div')
document.body.appendChild(host)

await render(MyController, { container: host, html: '<div data-controller="my"></div>' })
```

## Return value — `RenderResult`

```ts
interface RenderResult<T extends Controller> {
  controller: T
  element: HTMLElement
  application: Application
  user: UserEvent
  waitFor: (cb: () => void | Promise<void>, opts?: WaitForOptions) => Promise<void>
  rerender: (options: Pick<RenderOptions, 'html'>) => Promise<void>
  unmount: () => void
  // Query helpers scoped to `element`:
  getByRole: …; queryByRole: …; findByRole: …; getAllByRole: …
  getByText: …; queryByText: …; findByText: …; getAllByText: …
  getByLabelText: …; queryByLabelText: …; findByLabelText: …
  getByTestId: …; queryByTestId: …; findByTestId: …; getAllByTestId: …
}
```

### `controller`

The live, post-`connect()` instance of your controller class. Assert on it directly:

```ts
expect(controller.greetingValue).toBe('Hi')
expect(controller.hasNameTarget).toBe(true)
expect(controller.outputTargets).toHaveLength(2)
```

### `element`

The DOM node that matched `[data-controller~="<identifier>"]`. It is also the scope of every query helper returned.

### `application`

The running `Application`. Useful for advanced scenarios: dynamically registering more controllers mid-test, inspecting `application.controllers`, or tearing down manually.

### `rerender({ html })`

Replaces the fixture with a new one. The previous controller is disconnected and a new instance is connected — the returned `controller` from the original `render()` call is **stale** after rerendering. If you need the fresh instance, use `application.getControllerForElementAndIdentifier(element, identifier)` or call `render()` again.

```ts
const { rerender } = await render(CounterController, { html: '<div data-controller="counter"></div>' })
await rerender({ html: '<div data-controller="counter" data-counter-count-value="5"></div>' })
```

### `unmount()`

Stops the `Application` and removes the fixture. Call this for an eagerly-isolated test; otherwise rely on the global `cleanup()` hook.

## Common pitfalls

- **Forgetting `await`.** `render()` is async. Using `.then`-less code without `await` will leave targets `undefined`.
- **Hand-rolling `Application.start()`.** You don't need it. `render()` does it.
- **Asserting before `connect()`.** The promise resolves after `connect()`. You never need `nextTick()` right after `await render(...)`.

Continue with [Queries](./queries.md) to learn how to pick elements the way a user would.
