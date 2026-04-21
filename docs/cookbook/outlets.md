# Testing outlets

Outlets let one controller reference another via a CSS selector. Testing them is a matter of registering both controllers, mounting both DOM nodes, and asserting through the outlet interface.

```ts
import { render, stimulusController, stimulusAction, combine } from '@tito10047/stimulus-test-utils'
import ModalController from '../src/modal_controller.js'
import DialogController from '../src/dialog_controller.js'

const { controller, user, element, getByRole } = await render(ModalController, {
  controllers: { dialog: DialogController },
  html: `
    <div>
      <div ${combine(stimulusController('modal', {}, {}, { dialog: "[data-controller~='dialog']" }))}>
        <button ${stimulusAction('modal', 'open', 'click')}>Open</button>
        <button ${stimulusAction('modal', 'close', 'click')}>Close</button>
      </div>
      <section ${stimulusController('dialog')} hidden>Dialog body</section>
    </div>
  `,
})

const dialogEl = element.parentElement!.querySelector('section')!
expect(dialogEl.hasAttribute('hidden')).toBe(true)

await user.click(getByRole('button', { name: 'Open' }))
expect(dialogEl.hasAttribute('hidden')).toBe(false)
expect(controller.dialogOutlet.isOpen).toBe(true)

await user.click(getByRole('button', { name: 'Close' }))
expect(dialogEl.hasAttribute('hidden')).toBe(true)
```

## Multiple outlets of the same type

Declare `static outlets = ['item']` on the controller and use `itemOutlets` in tests:

```ts
expect(controller.itemOutlets).toHaveLength(3)
controller.itemOutlets.forEach(o => expect(o.isSelected).toBe(false))
```

## Asserting connect / disconnect callbacks

Stimulus fires `fooOutletConnected(outlet, element)` and `fooOutletDisconnected(...)`. Spy on them via the controller instance:

```ts
const connected = vi.spyOn(controller, 'dialogOutletConnected')
// ... do something that matches the selector
expect(connected).toHaveBeenCalled()
```

See also the guide page on [Multiple controllers & outlets](/guide/multiple-controllers).
