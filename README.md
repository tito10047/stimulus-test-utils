# @tito10047/stimulus-test-utils

[![Test](https://github.com/tito10047/stimulus-test-utils/actions/workflows/test.yml/badge.svg)](https://github.com/tito10047/stimulus-test-utils/actions/workflows/test.yml)
[![npm version](https://img.shields.io/npm/v/@tito10047/stimulus-test-utils.svg)](https://www.npmjs.com/package/@tito10047/stimulus-test-utils)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

Zero‑config, Testing‑Library‑flavoured test harness for [Stimulus](https://stimulus.hotwired.dev) controllers.

Write your tests in plain JavaScript or TypeScript, mount a controller with a single call, simulate user interactions, and assert against the DOM / controller state — without ever touching happy‑dom/JSDOM, the Stimulus `Application`, or `MutationObserver` timing by hand.

## What it's for

Testing Stimulus controllers usually means:

- setting `document.body.innerHTML`,
- creating and starting an `Application`,
- registering the controller,
- waiting for `connect()` via `MutationObserver` or `await nextTick()`,
- cleaning up after every test.

This library hides all of that behind a single `render()` call and exposes a familiar [Testing Library](https://testing-library.com/)-style API (`getByRole`, `findByText`, `user.click`, …).

## Installation

```bash
npm install -D @tito10047/stimulus-test-utils @hotwired/stimulus vitest happy-dom
```

`@hotwired/stimulus` is a **peer dependency** — you bring the version your app uses.

`vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'happy-dom',
    setupFiles: ['@tito10047/stimulus-test-utils/register'],
  },
})
```

The `/register` module wires up `afterEach(cleanup)` automatically. If you prefer to clean up manually, omit `setupFiles` and call `cleanup()` yourself.

## Quick example

Controller:

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

Test:

```js
import {
  render,
  stimulusController,
  stimulusTarget,
  stimulusAction,
} from '@tito10047/stimulus-test-utils'
import { expect, test } from 'vitest'
import HelloController from './hello_controller.js'

test('greets by name', async () => {
  const { element, controller, user, getByRole } = await render(HelloController, {
    html: `
      <div ${stimulusController('hello', { greeting: 'Hi' })}>
        <input ${stimulusTarget('hello', 'name')} />
        <button ${stimulusAction('hello', 'greet', 'click')}>Greet</button>
        <span ${stimulusTarget('hello', 'output')}></span>
      </div>
    `,
  })

  await user.type(element.querySelector('input'), 'Ada')
  await user.click(getByRole('button', { name: 'Greet' }))

  expect(controller.outputTarget.textContent).toBe('Hi, Ada!')
})
```

No `Application.start()`, no `document.body.innerHTML = …`, no manual `await nextTick()`.

## What you get

- **`render(ControllerClass, options)`** — mounts the fixture, starts an `Application`, registers the controller and waits for `connect()`.
- **Query helpers** — `getByRole`, `getByText`, `getByTestId`, `findBy*`, `queryBy*`, `getAllBy*` scoped to the mounted root.
- **`user`** — user‑event simulations: `click`, `type`, `keyboard`, `hover`, …
- **`waitFor` / `nextTick`** — async assertions for reactive DOM changes.
- **Attribute helpers** — `stimulusController`, `stimulusTarget`, `stimulusAction`, `combine` produce safe, typo‑free `data-*` attributes.
- **`cleanup()`** — automatically stops the `Application` and removes the fixture (via the `/register` setup, or called manually).

A complete API overview is available in [`public_api.md`](./public_api.md) (and soon on the project's documentation site).

## Supported versions

- Node.js `18.x`, `20.x`, `22.x`
- `@hotwired/stimulus` `^3.2`
- Vitest `^2`

## Contributing

```bash
npm ci
npm test          # vitest in watch mode
npm run typecheck # tsc --noEmit
npm run build     # tsup -> dist/
```

Pull requests are welcome. Before opening a PR, please run `npm run typecheck` and `npx vitest run`.

## License

[MIT](./LICENSE) © tito10047
