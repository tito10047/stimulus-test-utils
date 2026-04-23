# Multiple controllers & outlets

Real-world controllers rarely live in isolation. They register targets, listen to events from siblings via the `Window` event bus, or reach across the DOM with **outlets**. This page covers all three patterns.

## Registering additional controllers

Pass them in `options.controllers`. The keys are the identifiers under which the additional controllers will be registered on the shared `Application`:

```ts
import { render } from '@tito10047/stimulus-test-utils'
import ModalController from '../src/modal_controller.js'
import DialogController from '../src/dialog_controller.js'

const { controller, user, element, getByRole } = await render(ModalController, {
  controllers: { dialog: DialogController },
  html: `
    <div>
      <div data-controller="modal" data-modal-dialog-outlet="[data-controller~='dialog']">
        <button data-action="click->modal#open">Open</button>
        <button data-action="click->modal#close">Close</button>
      </div>
      <section data-controller="dialog" hidden>Dialog body</section>
    </div>
  `,
})
```

All controllers live on the same `Application`, so outlets, event buses, and cross-controller dispatches work as in production.

## Outlets

Outlets connect two controllers that live on **different** DOM elements, via a CSS selector:

```html
<div data-controller="modal"
     data-modal-dialog-outlet="[data-controller~='dialog']">
</div>
<section data-controller="dialog" hidden></section>
```

Inside `ModalController`:

```ts
static outlets = ['dialog']
declare readonly dialogOutlet: DialogController   // type provided by Stimulus

open() { this.dialogOutlet.show() }
close() { this.dialogOutlet.hide() }
```

Test it end-to-end:

```ts
await user.click(getByRole('button', { name: 'Open' }))
expect(controller.dialogOutlet.isOpen).toBe(true)

await user.click(getByRole('button', { name: 'Close' }))
const dialogEl = element.parentElement!.querySelector('section')!
expect(dialogEl.hidden).toBe(true)
```

Because the dialog sits *outside* `element`, you reach for it via the parent wrapper. A cleaner alternative: give the dialog a `data-testid` and use `element.parentElement` as a `within` root:

```ts
import { within } from '@testing-library/dom'
const dialog = within(element.parentElement!).getByTestId('dialog')
```

### Using the attribute helpers

```ts
import { attr.controller, attr.combine } from '@tito10047/stimulus-test-utils'

await render(ModalController, {
  controllers: { dialog: DialogController },
  html: `
    <div>
      <div ${attr.controller('modal', {}, {}, { dialog: "[data-controller~='dialog']" })}>
        <button ${attr.action('modal', 'open', 'click')}>Open</button>
      </div>
      <section ${attr.controller('dialog')} hidden>Dialog body</section>
    </div>
  `,
})
```

## Two controllers on one element

When a single element has multiple controllers (e.g. `toggle` + `analytics`), use `attr.combine()` to merge their attributes:

```ts
import { attr.combine, attr.controller } from '@tito10047/stimulus-test-utils'

await render(ToggleController, {
  controllers: { analytics: AnalyticsController },
  html: `
    <button ${attr.combine(
      attr.controller('toggle', {}, { open: 'is-open' }),
      attr.controller('analytics', { eventName: 'toggle-click' }),
    )}>
      Menu
    </button>
  `,
})
```

`attr.combine()` merges `data-controller` tokens into one attribute and keeps per-controller values namespaced by their identifier. See [Attribute helpers](./attribute-helpers.md#attr.combine) for the full rules.

## Nested controllers

Controllers nested inside each other work naturally — nothing special to configure, just register them:

```ts
const { element, user, getByRole } = await render(TabsController, {
  controllers: { panel: PanelController },
  html: `
    <div data-controller="tabs">
      <button role="tab" data-tabs-target="tab" data-action="click->tabs#select">One</button>
      <section data-controller="panel" data-tabs-target="panel">
        <!-- PanelController owns inner behaviour -->
      </section>
    </div>
  `,
})
```

Parent `controller` is still the Tabs instance. To grab the child controller, use the application:

```ts
const panelEl = element.querySelector('[data-controller="panel"]') as HTMLElement
const panelCtrl = application.getControllerForElementAndIdentifier(panelEl, 'panel')
```

## Cross-controller events

Stimulus controllers often communicate via `this.dispatch('name', { detail })`, which fires a `CustomEvent` bubbling up the DOM. Tests can assert these with plain `addEventListener`:

```ts
const invalidSpy = vi.fn()
const { user, element } = await render(FormValidatorController, {
  identifier: 'form-validator',
  html: /* ... */,
})
element.addEventListener('form-validator:invalid', invalidSpy)

await user.type(getByLabelText('Code'), 'ab')
expect(invalidSpy).toHaveBeenCalled()
```

Dispatching a custom event *into* the controller uses the `fireEvent` escape hatch:

```ts
import { fireEvent } from '@tito10047/stimulus-test-utils'
await fireEvent(element, 'custom:ping', { detail: { n: 7 } })
```

Next: [Cleanup & isolation](./cleanup-and-isolation.md).
