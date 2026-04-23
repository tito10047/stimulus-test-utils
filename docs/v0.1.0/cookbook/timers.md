# Fake timers

Use `vi.useFakeTimers()` for controllers that rely on `setTimeout`, `setInterval`, or `requestAnimationFrame`. Fake timers let you advance time deterministically instead of waiting.

## Debounce

```ts
import { vi } from 'vitest'

test('debounces input', async () => {
  vi.useFakeTimers()
  try {
    const { controller, user, getByRole } = await render(DebounceController, {
      html: `
        <div ${attr.controller('debounce', { delay: 300 })}>
          <input ${attr.combine(
            attr.target('debounce', 'input'),
            attr.action('debounce', 'onInput', 'input'),
          )} aria-label="q" />
        </div>
      `,
    })

    await user.type(getByRole('textbox', { name: 'q' }), 'abc')
    expect(controller.submittedCount).toBe(0)

    await vi.advanceTimersByTimeAsync(299)
    expect(controller.submittedCount).toBe(0)

    await vi.advanceTimersByTimeAsync(1)
    expect(controller.submittedCount).toBe(1)
  } finally {
    vi.useRealTimers()
  }
})
```

`advanceTimersByTimeAsync` flushes microtasks between ticks, so promises scheduled inside timers resolve too.

## Interval

```ts
vi.useFakeTimers()
const { controller } = await render(TickerController, {
  html: `<div ${attr.controller('ticker', { intervalMs: 1000 })}></div>`,
})

await vi.advanceTimersByTimeAsync(3000)
expect(controller.tickCount).toBe(3)

vi.useRealTimers()
```

## `requestAnimationFrame`

Vitest's fake timers mock `requestAnimationFrame` too:

```ts
vi.useFakeTimers()
// … cause a rAF schedule
await vi.advanceTimersToNextTimerAsync()
```

## Pitfalls

- **Forgetting `vi.useRealTimers()`.** Subsequent tests will hang on real `setTimeout`s. Always put it in a `finally`.
- **Mixing real and fake timers.** Vitest's `user.*` uses real microtasks; if your controller mixes Promises and timers, prefer `advanceTimersByTimeAsync` over the sync variant.
- **Using real fetch under fake timers.** Most transports include implicit timeouts. Mock `fetch` alongside.
