# User events

The `user` object returned from `render()` simulates interactions the way a real browser dispatches them — multiple events per action, in the correct order, with the correct targets and key modifiers.

## Why not `element.click()` or `fireEvent`?

Native DOM methods and low-level `fireEvent` fire a **single** event. Real users don't. Typing a character fires `keydown`, `keypress`, `input`, and `keyup`. Clicking a button fires `pointerdown`, `mousedown`, `focus`, `pointerup`, `mouseup`, `click`. Stimulus controllers routinely listen for `input` and `change`, not just `click` — and they rely on focus being correct.

The `user` API fires the full event sequence, awaits Stimulus' `MutationObserver`, and only then resolves — so your next assertion sees a stable DOM.

```ts
// Native DOM — fragile:
input.value = 'Ada'
input.dispatchEvent(new Event('input'))   // missing keydown/keyup, no change on blur

// user-event — realistic:
await user.type(input, 'Ada')
```

## Available methods

All methods return `Promise<void>` and must be `await`ed.

| Method | Fires |
|---|---|
| `user.click(el)` | `pointerdown`, `mousedown`, `focus`, `pointerup`, `mouseup`, `click` |
| `user.dblClick(el)` | Two `click`s plus `dblclick` |
| `user.hover(el)` | `pointerover`, `pointerenter`, `mouseover`, `mouseenter` |
| `user.unhover(el)` | `pointerout`, `pointerleave`, `mouseout`, `mouseleave` |
| `user.type(el, text)` | For every character: `keydown`, `keypress`, `input`, `keyup` |
| `user.clear(el)` | Selects all + `delete` key sequence; empties the field |
| `user.keyboard(seq)` | Full key grammar — see below |
| `user.tab({ shift? })` | Moves focus forward/backward, fires the required `keydown`/`focus` events |
| `user.selectOption(sel, value)` | Selects an `<option>` by value, label, or element; fires `change` |
| `user.submit(formEl)` | Fires `submit` the way a button press would |

## Typing text

```ts
await user.type(input, 'Hello world')
```

Each character fires a full keyboard sequence, so handlers listening on `input` or `keydown` all run.

To press non-printable keys inline, interleave them with the text:

```ts
await user.type(input, 'abc{Backspace}d')   // "abd"
await user.type(input, 'line one{Enter}line two')
```

For long or complex sequences, prefer `user.keyboard`:

```ts
await user.keyboard('{Control>}a{/Control}')     // Ctrl+A (select all)
await user.keyboard('{Shift>}{ArrowLeft}{/Shift}') // extend selection
await user.keyboard('{Enter}')
await user.keyboard('{Escape}')
```

The grammar follows [user-event v14](https://testing-library.com/docs/user-event/keyboard):

- `{Key}` — press and release
- `{Key>}` — press down, keep pressed
- `{/Key}` — release
- Literal characters are typed as if pressed individually

## Clicks and focus

`user.click(el)` moves focus to the clicked element (if focusable) **before** the `click` event, matching real browser behaviour. This matters for controllers that listen on `focus` to initialize state, or that use `document.activeElement` in their handlers.

```ts
await user.click(getByRole('button', { name: 'Open' }))
// Focus is now on the button; any blur handler on the previous focused element has run.
```

## Selecting options

```ts
await user.selectOption(selectEl, 'value-b')                 // by value
await user.selectOption(selectEl, getByRole('option', { name: 'Option B' }))  // by element
```

## Keyboard-driven UI

For a controller that listens for `keydown.enter` and `keydown.esc`:

```ts
const { element, user } = await render(KeyboardController, {
  html: `
    <div data-controller="keyboard"
         data-action="keydown.enter->keyboard#onEnter keydown.esc->keyboard#onEscape"
         tabindex="0">
      <span data-keyboard-target="status">idle</span>
    </div>
  `,
})

element.focus()
await user.keyboard('{Enter}')
expect(element.querySelector('[data-keyboard-target="status"]')!.textContent).toBe('submitted')

await user.keyboard('{Escape}')
expect(element.querySelector('[data-keyboard-target="status"]')!.textContent).toBe('cancelled')
```

Note the explicit `element.focus()` — keyboard events always dispatch on `document.activeElement`. If nothing is focused, the events go to `document.body`, which almost certainly isn't what your controller listens on.

## Low-level escape hatch — `fireEvent`

When you need to dispatch a custom event (CustomEvent with `detail`, `InputEvent` with `inputType`, DataTransfer-carrying drag events…), drop to `fireEvent`:

```ts
import { fireEvent } from '@tito10047/stimulus-test-utils'

await fireEvent(element, 'custom:ping', { detail: { n: 7 } })
await fireEvent(input, new InputEvent('input', { data: 'x' }))
```

`fireEvent` still awaits the post-dispatch `MutationObserver` tick, so your next assertion is safe.

Use `fireEvent` only when `user.*` cannot express the interaction. Everything you can do with clicks, typing, and keyboards should go through `user`.

## Common pitfalls

- **Forgetting `await`.** Every `user.*` method is async. Synchronous assertions directly after a bare call will race the `MutationObserver`.
- **Clicking hidden or disabled elements.** `user.click` will throw — just like a real browser would refuse the interaction. Make the element visible/enabled first, or assert that clicking is impossible.
- **Typing without focus.** Not needed — `user.type` focuses the element automatically. (Only `user.keyboard` requires focus, because it is target-less.)

Next: [Async assertions](./async.md) for controllers that don't respond synchronously.
