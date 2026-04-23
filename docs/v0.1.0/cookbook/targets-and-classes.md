# Testing targets & classes

## Required vs optional targets

Stimulus generates `hasXTarget` for every declared target. Use it to assert presence without throwing:

```ts
const { controller } = await render(HelloController, {
  html: `
    <div data-controller="hello">
      <span data-hello-target="output"></span>
    </div>
  `,
})

expect(controller.hasOutputTarget).toBe(true)
expect(controller.hasNameTarget).toBe(false)
```

Accessing `controller.nameTarget` when none is present throws at runtime — by design. Guard with `hasNameTarget` or rely on declared optionality.

## Multiple targets

`xTargets` (plural) returns every matching element:

```ts
const { controller } = await render(TabsController, {
  html: `
    <div data-controller="tabs">
      <section data-tabs-target="panel">One</section>
      <section data-tabs-target="panel">Two</section>
    </div>
  `,
})

expect(controller.panelTargets).toHaveLength(2)
expect(controller.panelTargets[0].textContent).toBe('One')
```

## Class bookkeeping

Stimulus exposes declared classes via `this.xClass`. A controller with:

```js
static classes = ['open']
```

…reads the class name from `data-<id>-open-class`:

```ts
await render(ToggleController, {
  html: `<div ${attr.controller('toggle', {}, { open: 'is-open' })}></div>`,
})
```

Assert class toggling by inspecting the DOM, not the controller internals:

```ts
const { controller, user, element, getByRole } = await render(ToggleController, {
  html: `
    <div ${attr.combine(attr.controller('toggle', {}, { open: 'is-open' }))}>
      <button ${attr.combine(
        attr.target('toggle', 'trigger'),
        attr.action('toggle', 'toggle', 'click'),
      )}>Menu</button>
      <div ${attr.target('toggle', 'content')} hidden>Hidden</div>
    </div>
  `,
})

const trigger = getByRole('button', { name: 'Menu' })
await user.click(trigger)
expect(trigger.classList.contains('is-open')).toBe(true)
```
