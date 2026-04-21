# Cleanup & isolation

Every `render()` call creates a fresh Stimulus `Application` and mounts a new fixture. Without cleanup, leftover DOM and running controllers leak into the next test — queries match phantom elements, event handlers double-fire, and failures become timing-dependent.

This page covers the two things every test suite must get right: **when to clean up** and **how to keep tests isolated**.

## The three lifecycle rules

1. Every fixture must be removed from the DOM after the test that mounted it.
2. Every `Application` must be stopped after the test that started it.
3. The library's internal registry must be cleared between tests.

`cleanup()` does all three in one call.

## Automatic cleanup — the recommended setup

Set up the `/register` side-effect module once in your Vitest config:

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

This registers `afterEach(cleanup)` globally. Every test starts pristine, regardless of whether it `await`ed `render()` or returned early.

## Manual cleanup

Prefer explicit wiring? Skip `setupFiles` and do it yourself:

```ts
// tests/setup.ts
import { afterEach } from 'vitest'
import { cleanup } from '@tito10047/stimulus-test-utils'
afterEach(cleanup)
```

…then point Vitest at the setup file:

```ts
test: { setupFiles: ['./tests/setup.ts'] }
```

For ad-hoc cleanup inside a single test (for example to render twice), call it directly:

```ts
import { cleanup, render } from '@tito10047/stimulus-test-utils'

const first = await render(MyController, { html: htmlA })
// ... assertions
cleanup()
const second = await render(MyController, { html: htmlB })
```

## Per-test unmount

`RenderResult.unmount()` tears down **just that render**, while leaving any other fixtures mounted:

```ts
const { unmount } = await render(MyController, { html })
// ... test work
unmount()
```

Use this when a test explicitly asserts behaviour on disconnect, or when you mount something you do not want seen by later assertions in the same test.

## Isolation guarantees

After `cleanup()` (or a fresh test with the `/register` hook):

- `document.body` contains no leftover fixtures mounted by `render()`.
- No `Application` started by the harness is still running.
- No `MutationObserver` from a disconnected controller is still listening.
- Any `application` you passed via `options.application` is also stopped — bringing your own `Application` does not opt you out of cleanup.

## What cleanup does *not* do

It cannot clean up things you did outside the harness:

- **`vi.stubGlobal`** — call `vi.unstubAllGlobals()` yourself (or use Vitest's `restoreMocks: true`).
- **Event listeners added to `document` or `window`** by your controller — they are removed as part of `disconnect()`, so as long as your controller cleans up after itself, you are fine.
- **Timers** — `vi.useFakeTimers()` requires `vi.useRealTimers()`.
- **Spies on built-ins** (e.g. `vi.spyOn(window, 'location')`) — restore them in an `afterEach`.

## Running tests in parallel

Vitest runs tests in parallel across workers but serially within a file. Because `cleanup()` resets everything within a file, parallelism is safe out of the box — no per-file opt-out required.

If you hit weird cross-file leaks, check that:

- You are **not** sharing a module-scoped `Application` instance across files (use the default, let `render()` create one).
- You are **not** poking `globalThis` / `document` in module-level `beforeAll` hooks.

## Common pitfalls

- **Forgetting `setupFiles`.** Without cleanup, the second test in the file sees the first test's DOM and controller.
- **Adding `cleanup()` in `afterAll` instead of `afterEach`.** `afterAll` runs once per file, which is too late — the damage is already done.
- **Calling `cleanup()` inside the test body after an early `return`.** Let `afterEach` handle it; manual calls risk double-cleanup (which is safe, but noisy).

Next: [TypeScript](./typescript.md).
