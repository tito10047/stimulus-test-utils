# Keyboard & accessibility

Well-behaved Stimulus controllers update ARIA state — `aria-expanded`, `aria-selected`, `aria-controls` — as they change the DOM. Assert on those attributes, not on class names or inline styles.

## Keyboard actions

`keydown.enter` and `keydown.esc` are Stimulus shorthands for event filters. Drive them with `user.keyboard`:

```ts
import { render, stimulusController, stimulusTarget, stimulusAction, combine } from '@tito10047/stimulus-test-utils'
import KeyboardController from '../src/keyboard_controller.js'

test('Enter submits, Escape cancels', async () => {
  const { element, user } = await render(KeyboardController, {
    html: `
      <div ${combine(
        stimulusController('keyboard'),
        stimulusAction('keyboard', 'onEnter', 'keydown.enter'),
        stimulusAction('keyboard', 'onEscape', 'keydown.esc'),
      )} tabindex="0">
        <span ${stimulusTarget('keyboard', 'status')}>idle</span>
      </div>
    `,
  })

  element.focus()
  await user.keyboard('{Enter}')
  expect(element.querySelector('[data-keyboard-target="status"]')!.textContent).toBe('submitted')

  await user.keyboard('{Escape}')
  expect(element.querySelector('[data-keyboard-target="status"]')!.textContent).toBe('cancelled')
})
```

Note the `tabindex="0"` and explicit `element.focus()` — keyboard events dispatch on `document.activeElement`. Without focus, the event goes to `document.body`.

## `aria-expanded` on toggles

```ts
const { user, getByRole } = await render(ToggleController, { html })

const trigger = getByRole('button', { name: 'Menu' })
expect(trigger.getAttribute('aria-expanded')).toBe('false')

await user.click(trigger)
expect(trigger.getAttribute('aria-expanded')).toBe('true')
```

## Tabs with `role="tablist"` / `role="tab"`

`getByRole` makes tab components particularly clean:

```ts
const { user, getByRole, element } = await render(TabsController, {
  html: `
    <div ${combine(stimulusController('tabs', { activeIndex: 0 }, { active: 'is-active' }))}>
      <div role="tablist">
        <button role="tab" ${combine(
          stimulusTarget('tabs', 'tab'),
          stimulusAction('tabs', 'select', 'click'),
        )}>One</button>
        <button role="tab" ${combine(
          stimulusTarget('tabs', 'tab'),
          stimulusAction('tabs', 'select', 'click'),
        )}>Two</button>
      </div>
      <section ${stimulusTarget('tabs', 'panel')}>First</section>
      <section ${stimulusTarget('tabs', 'panel')}>Second</section>
    </div>
  `,
})

await user.click(getByRole('tab', { name: 'Two' }))
expect(getByRole('tab', { name: 'Two' }).getAttribute('aria-selected')).toBe('true')
```

## Focus management

When a controller moves focus (focus traps, opening dialogs), assert via `document.activeElement`:

```ts
await user.click(getByRole('button', { name: 'Open' }))
expect(document.activeElement).toBe(getByRole('dialog'))
```

For Tab/Shift+Tab navigation, `user.tab()` moves focus along the natural tab order:

```ts
await user.tab()
expect(document.activeElement).toBe(getByRole('textbox', { name: 'First name' }))
await user.tab()
expect(document.activeElement).toBe(getByRole('textbox', { name: 'Last name' }))
await user.tab({ shift: true })
expect(document.activeElement).toBe(getByRole('textbox', { name: 'First name' }))
```

## a11y-friendly queries

Prefer roles and labels over classes and test-ids. If your fixture cannot be selected by `getByRole` / `getByLabelText`, that's often a hint that the real app has an accessibility issue to fix.
