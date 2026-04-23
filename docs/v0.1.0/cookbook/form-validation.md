# Form validation

Form-validator controllers typically listen to `input`, update an error target, and `dispatch` a custom event when state changes. All three are straightforward to assert.

## Happy + sad paths

```ts
import { vi } from 'vitest'

test('invalid input shows error and dispatches "invalid"', async () => {
  const invalid = vi.fn()

  const { user, element, getByLabelText } = await render(FormValidatorController, {
    identifier: 'form-validator',
    html: `
      <div ${attr.controller('form-validator', {
        pattern: '^\\d{3}$',
        message: 'Must be 3 digits',
      })}>
        <label for="code">Code</label>
        <input id="code" ${attr.combine(
          attr.target('form-validator', 'input'),
          attr.action('form-validator', 'validate', 'input'),
        )} />
        <p ${attr.target('form-validator', 'error')}></p>
      </div>
    `,
  })

  element.addEventListener('form-validator:invalid', invalid as EventListener)

  await user.type(getByLabelText('Code'), 'ab')
  expect(element.querySelector('p')!.textContent).toBe('Must be 3 digits')
  expect(invalid).toHaveBeenCalled()
})

test('valid input clears error and dispatches "valid"', async () => {
  const valid = vi.fn()

  const { user, element, getByLabelText } = await render(FormValidatorController, {
    identifier: 'form-validator',
    html: `
      <div ${attr.controller('form-validator', { pattern: '^\\d{3}$' })}>
        <label for="code">Code</label>
        <input id="code" ${attr.combine(
          attr.target('form-validator', 'input'),
          attr.action('form-validator', 'validate', 'input'),
        )} />
        <p ${attr.target('form-validator', 'error')}>preset error</p>
      </div>
    `,
  })

  element.addEventListener('form-validator:valid', valid as EventListener)

  await user.type(getByLabelText('Code'), '123')
  expect(element.querySelector('p')!.textContent).toBe('')
  expect(valid).toHaveBeenCalled()
})
```

## Submitting a form

`user.submit(formEl)` fires `submit` the way a button press does, including the implicit form validation. Use it for end-to-end assertions:

```ts
await user.submit(element.querySelector('form')!)
expect(submitSpy).toHaveBeenCalled()
```

To prevent the default navigation in jsdom-style environments, the controller should call `event.preventDefault()` — exactly as it does in production.

## `noValidate`

Native `<form>` elements validate on submit unless you set `noValidate`. For custom validators, always add `novalidate` to avoid the browser's own bubble:

```html
<form data-controller="form-validator" novalidate>…</form>
```

Otherwise your `click` or `submit` interactions may be cancelled before the controller ever runs.
