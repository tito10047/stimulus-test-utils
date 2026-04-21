# Getting Started

This page walks you from a blank project to a green test in under five minutes.

## Requirements

| Requirement | Version |
|---|---|
| Node.js | `18.x`, `20.x`, or `22.x` |
| `@hotwired/stimulus` | `^3.2` (peer dependency) |
| Test runner | Vitest `^2` (recommended) or any runner with an `afterEach` hook |
| DOM | `happy-dom` (recommended) or `jsdom` |

## 1. Install

```bash
npm install -D @tito10047/stimulus-test-utils @hotwired/stimulus vitest happy-dom
```

> `@hotwired/stimulus` is declared as a **peer dependency**. Install the same version your application ships — the harness will use it directly.

## 2. Configure Vitest

Enable a DOM environment and register the cleanup hook:

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'happy-dom',
    setupFiles: ['@tito10047/stimulus-test-utils/register'],
  },
})
```

The `/register` side-effect module calls `afterEach(cleanup)` for you.

If you prefer explicit wiring, skip `setupFiles` and do it yourself:

```ts
// tests/setup.ts
import { afterEach } from 'vitest'
import { cleanup } from '@tito10047/stimulus-test-utils'
afterEach(cleanup)
```

## 3. Write your first test

`src/hello_controller.js`:

```js
import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  static targets = ['name', 'output']
  static values = { greeting: { type: String, default: 'Hello' } }

  greet() {
    this.outputTarget.textContent = `${this.greetingValue}, ${this.nameTarget.value}!`
  }
}
```

`tests/hello.test.js`:

```js
import { render, stimulusController, stimulusTarget, stimulusAction } from '@tito10047/stimulus-test-utils'
import { expect, test } from 'vitest'
import HelloController from '../src/hello_controller.js'

test('greets by name', async () => {
  const { controller, user, element, getByRole } = await render(HelloController, {
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

## 4. Run it

```bash
npx vitest run
```

You should see a single passing test. If the test **fails** with `greetingValue` being `undefined` or a target not found, jump to [Troubleshooting](./troubleshooting.md).

## What just happened

`render()` performed these steps, in this order:

1. Created a new Stimulus `Application` (a fresh one per test — see [Cleanup & isolation](./cleanup-and-isolation.md)).
2. Registered `HelloController` under the identifier `"hello"`, inferred from the class name.
3. Parsed the `html` fixture and appended it to `document.body`.
4. Awaited the `MutationObserver` tick so Stimulus' `connect()` lifecycle fires.
5. Resolved with the controller instance and a suite of helpers scoped to the mounted element.

## Next steps

- Learn the full `render()` signature in [Rendering controllers](./rendering.md).
- Browse [query helpers](./queries.md) for picking elements the way users perceive them.
- Simulate real input with [user events](./user-events.md).
