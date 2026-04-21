# Queries

Queries are how your tests pick elements out of the mounted fixture. The helpers returned from `render()` are scoped to the controller's root element, so a previous test's leftovers (or Vitest's own reporter DOM) can never interfere.

## The three variants

Every query exists in three flavours — and picking the right one is the single biggest readability win in a Testing-Library-style suite.

| Prefix | Returns | Throws when 0 matches | Waits | Use when… |
|---|---|---|---|---|
| `getBy…` | a single element | **yes** — helpful error with DOM snapshot | no | the element must exist **now** |
| `queryBy…` | element or `null` | no | no | you want to assert **absence** |
| `findBy…` | `Promise<element>` | yes (after timeout) | yes — polls up to 1s | the element will appear **eventually** |

Plus the plural forms:

| Prefix | Returns | Throws when 0 matches | Waits |
|---|---|---|---|
| `getAllBy…` | `Element[]` (non-empty) | yes | no |
| `queryAllBy…` | `Element[]` (may be empty) | no | no |
| `findAllBy…` | `Promise<Element[]>` | yes | yes |

## Available selectors

| Selector | Query |
|---|---|
| ARIA role + accessible name | `getByRole('button', { name: 'Save' })` |
| Accessible label | `getByLabelText('Email')` |
| Visible text | `getByText('Loading…')` |
| `data-testid` attribute | `getByTestId('result-row')` |

Prefer them in that order — `getByRole` is the most resilient to markup changes and is the strongest signal that your markup is accessible. Reach for `getByTestId` only when the other three cannot identify the element (purely presentational nodes, third-party widgets…).

## Scope

All query helpers returned from `render()` run inside `element`:

```ts
const { getByRole, element } = await render(MyController, { html })
// Internally equivalent to:
// import { within } from '@testing-library/dom'
// within(element).getByRole(...)
```

This means:

- Multiple fixtures in the same test file cannot match each other.
- The test runner's own reporter DOM is invisible.
- The `document.body` of an earlier, not-yet-cleaned-up test cannot interfere (though with `cleanup()` set up globally, that can't happen anyway).

If you need to go wider, use `@testing-library/dom`'s `within` / `screen` explicitly — nothing about our scoped helpers prevents it.

## Finding elements outside the controller

Outlets and sibling controllers may live outside `element`. Query them via their DOM position:

```ts
const { element } = await render(ModalController, {
  html: `
    <div data-controller="modal"></div>
    <section data-controller="dialog" hidden></section>
  `,
})

const dialog = element.parentElement!.querySelector('section')!
expect(dialog.hidden).toBe(true)
```

For anything more complex, mount the siblings in `html` and query them through a parent wrapper you control.

## Examples

### `getByRole`

```ts
getByRole('button', { name: 'Greet' })        // button whose accessible name is "Greet"
getByRole('button', { name: /greet/i })        // regex match (case-insensitive)
getByRole('textbox', { name: 'query' })        // input labelled "query"
getByRole('tab', { name: 'Two' })              // role="tab", name "Two"
getByRole('listitem', { name: 'Ada' })         // <li aria-label="Ada">
```

### `getByLabelText`

Matches form controls by their `<label for>`, `aria-label`, or `aria-labelledby`:

```ts
getByLabelText('Email')
getByLabelText(/^code$/i)
```

### `getByText` vs `getByRole`

`getByText` finds the node whose **text content** matches. Use it for prose, status messages, and non-interactive copy:

```ts
getByText('Must be 3 digits')   // <p>Must be 3 digits</p>
```

For interactive elements prefer the role — it encodes what the element *does*, not what it *says*.

### `getByTestId`

```html
<li data-testid="result-row">…</li>
```

```ts
getByTestId('result-row')
```

### `findBy*` for async

```ts
await user.click(getByRole('button', { name: 'Search' }))
const row = await findByTestId('result-1')     // polled up to 1s
```

Need a custom timeout? Fall back to `waitFor` (see [Async assertions](./async.md)):

```ts
await waitFor(() => {
  expect(getAllByRole('listitem')).toHaveLength(2)
}, { timeout: 2000 })
```

## Common pitfalls

- **Using `queryBy*` when you mean `getBy*`.** `queryBy*` swallows "not found" into `null`, which then surfaces as a confusing `Cannot read properties of null` later.
- **Using `getBy*` to assert absence.** Use `queryBy*`: `expect(queryByRole('alert')).toBeNull()`.
- **Awaiting `getBy*`.** It is synchronous. If you need to wait, use `findBy*` or `waitFor`.
- **Depending on testid for everything.** It bypasses the accessibility tree. Prefer roles and labels — your a11y reviewer will thank you.

Next: [User events](./user-events.md) for simulating real interactions.
