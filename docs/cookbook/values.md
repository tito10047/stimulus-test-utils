# Testing values

Stimulus values are the source of truth for a controller's state. The harness makes them trivial to set up, observe, and mutate.

## Default values

Declare a default in the controller:

```js
static values = { count: { type: Number, default: 0 } }
```

Omit the attribute in the fixture and the default applies:

```ts
const { controller } = await render(CounterController, {
  html: `<div data-controller="counter"></div>`,
})

expect(controller.countValue).toBe(0)
```

## Overriding from the fixture

```ts
const { controller } = await render(CounterController, {
  html: `<div ${stimulusController('counter', { count: 42 })}></div>`,
})

expect(controller.countValue).toBe(42)
```

## Object and array values

Non-scalar values are JSON-serialized by the `stimulusController` helper, matching Stimulus' own semantics:

```ts
const { controller } = await render(UserCardController, {
  html: `<div ${stimulusController('user-card', {
    user: { name: 'Ada', age: 36 },
    tags: ['a', 'b'],
  })}></div>`,
})

expect(controller.userValue).toEqual({ name: 'Ada', age: 36 })
expect(controller.tagsValue).toEqual(['a', 'b'])
```

## Asserting programmatic changes

Mutating a value from the controller triggers the usual Stimulus `xxxValueChanged()` callback. Assert on the visible outcome:

```ts
const { controller, getByRole, user } = await render(CounterController, {
  html: `
    <div data-controller="counter" data-counter-count-value="0">
      <span data-counter-target="display"></span>
      <button data-action="click->counter#increment">+</button>
    </div>
  `,
})

await user.click(getByRole('button', { name: '+' }))

expect(controller.countValue).toBe(1)
expect(controller.displayTarget.textContent).toBe('1')
```

## Mutating the value attribute from the test

If you want to verify that the controller reacts to an external attribute change (as Turbo Frames might do):

```ts
controller.element.setAttribute('data-counter-count-value', '99')
await nextTick()   // let MutationObserver run

expect(controller.countValue).toBe(99)
```
