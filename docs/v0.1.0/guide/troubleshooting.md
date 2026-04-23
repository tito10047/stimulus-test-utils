# Troubleshooting

Concrete symptom → likely cause → fix. If your issue isn't here, open a GitHub issue with a minimal reproduction.

## "Controller is `undefined` or targets aren't wired"

**Symptom**

```
TypeError: Cannot read properties of undefined (reading 'textContent')
```

…right after `await render(…)`.

**Causes & fixes**

1. You forgot `await` on `render()`. It is async — always `await` it.
2. Your test runner uses `jsdom` and your Vitest project hasn't opted in. Set `test.environment: 'happy-dom'` (or `'jsdom'`) in `vitest.config.ts`.
3. The controller class name does not end in `Controller` and the identifier could not be inferred. Pass `options.identifier` explicitly.
4. Your build tool mangles class names. Pass `options.identifier` or preserve names via your bundler config.

## "`data-hello-greeting-value` is ignored / value is `undefined`"

**Symptom**

`controller.greetingValue` is `undefined` even though the fixture contains the attribute.

**Causes & fixes**

1. The `static values` declaration in the controller does not include the key. Values must be declared on the controller class for Stimulus to pick them up.
2. The attribute name has a typo. Use `attr.controller('hello', { greeting: 'Hi' })` to generate the correct name.
3. The identifier in the attribute does not match the controller's identifier. A fixture with `data-controller="hello"` needs `data-hello-…`, not `data-Hello-…` — Stimulus is case-sensitive.

## "`connect()` never fires" / "Stimulus doesn't see the element"

**Causes & fixes**

1. `document.body.innerHTML = …` *after* `render()` wipes the fixture. Don't touch `document.body` manually — use `rerender()` instead.
2. You passed a detached element in `options.html` and a custom `container` that is also detached. Append the container to `document` first.
3. You started your own `Application` and forgot to `register` the controller. Let `render()` do it, or register before calling `render()`.

## "Two tests in a row, the second one sees the first test's DOM"

**Cause** — No cleanup is registered.

**Fix** — Add `setupFiles: ['@tito10047/stimulus-test-utils/register']` to your Vitest config, or wire `afterEach(cleanup)` manually. See [Cleanup & isolation](./cleanup-and-isolation.md).

## "`getByRole(...)` throws `Unable to find an accessible element with the role "…"`"

**Causes & fixes**

1. The markup has no element with that role. `getByRole('button', …)` requires an actual `<button>` or `role="button"` — a `<div>` with `data-action` is not enough.
2. The element is hidden (`hidden`, `display: none`, `aria-hidden="true"`). `getByRole` excludes hidden elements by default. Pass `{ hidden: true }` if you really want it.
3. Your accessible name is off. A button labelled by a nested `<img alt="">` with an empty `alt` has no accessible name. Fix the label in the markup or use `getByTestId`.

## "`findBy*` times out"

**Causes & fixes**

1. The controller performs an async task that never completes (unmocked `fetch`, a `Promise` that never resolves). Mock it.
2. `vi.useFakeTimers()` is active and a timer in your controller never gets advanced. Advance it with `vi.advanceTimersByTime(n)`, or switch to real timers for this test.
3. The element does eventually appear, just after the 1 s default. Increase the timeout via `waitFor(…, { timeout: 2000 })`.

## "`user.click(...)` throws `pointer-events: none`" or "element is not visible"

`user.*` refuses to act on elements a real user couldn't. Make the element visible (remove `hidden`, adjust CSS) or assert on the underlying state rather than the click.

## "Test passes locally, fails in CI"

**Causes & fixes**

1. **Timing.** Increase `waitFor` timeouts; prefer `findBy*` over `setTimeout` for element appearance.
2. **Non-seeded randomness.** If your controller uses `Math.random`/`crypto.getRandomValues` for ids, stub them.
3. **Locale-sensitive assertions.** `toLocaleString()` produces different strings in different environments. Pin the locale or assert on raw numbers.

## "TypeScript complains `Property 'xxxTarget' does not exist on type 'Controller'`"

Your controller doesn't `declare` the target. Add:

```ts
declare readonly xxxTarget: HTMLElement
```

See [TypeScript](./typescript.md) for the full pattern.

## "Error: duplicate Stimulus controller identifier "hello" inside `attr.combine()`"

You passed the same identifier to two `attr.controller()` calls. Collapse them into one call and merge the `values` / `classes` / `outlets` objects:

```ts
// Wrong
attr.combine(
  attr.controller('hello', { a: 1 }),
  attr.controller('hello', { b: 2 }),
)

// Right
attr.controller('hello', { a: 1, b: 2 })
```

## "happy-dom throws `Not implemented: HTMLCanvasElement.getContext`" (or similar)

happy-dom doesn't implement every browser API. Options:

- Mock the API: `vi.stubGlobal('HTMLCanvasElement.prototype.getContext', vi.fn())`.
- Switch that test to `jsdom` (per-file `// @vitest-environment jsdom`).
- Run the test in a real browser via `vitest --browser` or Playwright.

## Still stuck?

Open an issue at [github.com/tito10047/stimulus-test-utils](https://github.com/tito10047/stimulus-test-utils/issues) with:

1. `@tito10047/stimulus-test-utils` version (`npm ls @tito10047/stimulus-test-utils`).
2. `@hotwired/stimulus` version.
3. Vitest version and a snippet of `vitest.config.ts`.
4. A minimal failing test (controller + fixture + assertion).

Minimal reproductions get fixed fastest.
