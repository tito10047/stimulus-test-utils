# Async assertions

Stimulus itself is asynchronous in two places: `MutationObserver` flushes microtasks before connecting/disconnecting controllers, and many real controllers perform async work (`fetch`, `setTimeout`, `requestAnimationFrame`). This page shows how to assert against those outcomes without flaky tests.

## `waitFor(callback, options?)`

Polls `callback` until it does not throw or times out. On timeout, it re-throws the last assertion error — so you get the Vitest-friendly diff, not a generic "timeout".

```ts
await waitFor(() => {
  expect(controller.statusTarget.textContent).toBe('done')
})
```

### Options

| Option | Default | Description |
|---|---|---|
| `timeout` | `1000` (ms) | Give up after this many milliseconds. |
| `interval` | `50` (ms) | Delay between polls. |

```ts
await waitFor(() => expect(list.children).toHaveLength(3), { timeout: 2000, interval: 25 })
```

### Rules

- The callback must **throw** on failure (use `expect(...)`, not boolean returns).
- Side effects inside the callback run on every poll — keep it pure.
- Prefer `findBy*` over `waitFor(() => getBy*)` when you are only checking for element presence.

## `findBy*` — `waitFor` for queries

Every `getBy*` has a matching `findBy*` that returns a `Promise`. It is `waitFor` specialized for "the element will appear":

```ts
await user.click(getByRole('button', { name: 'Search' }))
const row = await findByTestId('result-1')
```

`findBy*` uses the same default 1 s timeout as `waitFor`. For a custom timeout, attr.combine it with `waitFor` or `Promise.race`.

## `nextTick()`

Sometimes you need to step past exactly **one** `MutationObserver` microtask — for example after manually mutating the DOM outside of `user.*`. That's what `nextTick()` is for:

```ts
import { nextTick } from '@tito10047/stimulus-test-utils'

element.appendChild(newChild)   // triggers Stimulus' MutationObserver
await nextTick()                // lets it run; controller sees newChild

expect(controller.hasChildTarget).toBe(true)
```

You rarely need this — `user.*` and `fireEvent` already await it. Reach for `nextTick()` only when you bypass both.

## Testing `fetch`

Mock globally, let your controller run, then assert via `waitFor` or `findBy*`:

```ts
import { vi } from 'vitest'

vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
  new Response(JSON.stringify([{ id: 1, name: 'Ada' }]), { status: 200 })
))

const { user, findByTestId, getByRole } = await render(SearchController, { html })

await user.type(getByRole('textbox'), 'ad')
await user.click(getByRole('button', { name: 'Search' }))

expect(await findByTestId('result-1')).toBeTruthy()

vi.unstubAllGlobals()
```

See also the [Mocking fetch](/cookbook/fetch) cookbook entry.

## Testing `setTimeout` / `setInterval`

Use `vi.useFakeTimers()` and advance them manually:

```ts
import { vi } from 'vitest'

vi.useFakeTimers()
try {
  const { controller, user, getByRole } = await render(DebounceController, { html })
  await user.type(getByRole('textbox'), 'q')
  vi.advanceTimersByTime(250)
  expect(controller.dispatchedCount).toBe(1)
} finally {
  vi.useRealTimers()
}
```

See the [Fake timers](/cookbook/timers) recipe for more.

## Common pitfalls

- **Returning from `waitFor` instead of throwing.** `return false` is not a failure; `expect(...).toBe(...)` is.
- **Using `await waitFor(() => controller.someSetter())`.** `waitFor` is for *asserting*, not for *doing*. Perform the action first, then wait for its observable effect.
- **Long timeouts masking real failures.** If a test needs `timeout: 5000`, the controller is probably doing something the test should mock (network, real timers).

Next: [Attribute helpers](./attribute-helpers.md) for building fixtures without typos.
