# Introduction

`@tito10047/stimulus-test-utils` is a testing harness for [Stimulus](https://stimulus.hotwired.dev) controllers. It gives you the same ergonomic surface as [Testing Library](https://testing-library.com/) (`getByRole`, `findByText`, `user.click`, …) scoped to a freshly mounted controller instance.

## The problem

A realistic Stimulus unit test without a harness looks like this:

```ts
import { Application } from '@hotwired/stimulus'
import HelloController from './hello_controller.js'

beforeEach(() => {
  document.body.innerHTML = `
    <div data-controller="hello">
      <input data-hello-target="name" />
      <button data-action="click->hello#greet">Greet</button>
      <span data-hello-target="output"></span>
    </div>`
  const app = Application.start()
  app.register('hello', HelloController)
})

afterEach(() => {
  document.body.innerHTML = ''
})

test('greets', async () => {
  // Stimulus connects asynchronously via MutationObserver.
  // If we assert now, targets are not yet wired.
  await new Promise(r => setTimeout(r, 0))

  const input = document.querySelector('input')!
  const button = document.querySelector('button')!

  input.value = 'Ada'
  input.dispatchEvent(new Event('input', { bubbles: true }))
  button.click()

  await new Promise(r => setTimeout(r, 0))
  expect(document.querySelector('span')!.textContent).toBe('Hello, Ada!')
})
```

Five problems, all in one test:

1. The `Application` lifecycle is manual and leaks between tests.
2. `connect()` fires asynchronously. You either `await` a macrotask or you race.
3. `input.value = …` does not fire the events Stimulus listens for.
4. Cleanup is DIY.
5. There is no structured way to query the controller's subtree — you query the whole document.

## The solution

```ts
import { render } from '@tito10047/stimulus-test-utils'
import HelloController from './hello_controller.js'

test('greets', async () => {
  const { controller, user, element, getByRole } = await render(HelloController, {
    html: `
      <div data-controller="hello">
        <input data-hello-target="name" />
        <button data-action="click->hello#greet">Greet</button>
        <span data-hello-target="output"></span>
      </div>`,
  })

  await user.type(element.querySelector('input')!, 'Ada')
  await user.click(getByRole('button', { name: 'Greet' }))

  expect(controller.outputTarget.textContent).toBe('Hello, Ada!')
})
```

What `render()` does for you:

- starts a fresh `Application`,
- registers the controller under the inferred identifier (`HelloController` → `"hello"`),
- mounts the fixture and waits for `connect()` to fire,
- returns `user` (real user-event simulation), query helpers, and the live controller instance,
- is paired with `cleanup()` that stops the `Application` and removes the fixture after every test.

## Design principles

- **Test behaviour, not internals.** The API mirrors Testing Library: you select by role, label, text — like your users do.
- **No magic globals.** Every call returns a fresh `RenderResult`. Nothing leaks unless you leak it.
- **Peer dependencies only.** `@hotwired/stimulus` is a peer. The harness never pins the version your app ships.
- **Zero custom DSL.** Fixtures are plain HTML. The optional `stimulus*` attribute helpers produce the same `data-*` attributes you would write by hand — they exist to prevent typos, not to replace HTML.

## What this library is not

- It is not a browser. Tests run in [happy-dom](https://github.com/capricorn86/happy-dom) (or JSDOM, if you prefer). For real-browser tests use Playwright/Cypress.
- It is not a Stimulus replacement. The real `Application` runs; the real `MutationObserver` fires; the real `connect()` lifecycle executes. The harness only wires things up.
- It is not opinionated about your test runner, beyond shipping a convenience `/register` module for Vitest. `cleanup()` works anywhere `afterEach` exists.

Next: [Getting Started](./getting-started.md).
