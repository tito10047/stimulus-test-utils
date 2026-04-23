import { describe, expect, it } from 'vitest'
import { render, attr } from '../src/index.js'
import { HelloController, CounterController } from './fixtures/controllers.js'

describe('render() — smoke', () => {
  it('mounts, connects, and returns controller + element', async () => {
    const { controller, element, application } = await render(HelloController, {
      html: `
        <div data-controller="hello">
          <input data-hello-target="name" />
          <span data-hello-target="output"></span>
        </div>
      `,
    })

    expect(element.getAttribute('data-controller')).toBe('hello')
    expect(controller).toBeInstanceOf(HelloController)
    expect(application).toBeDefined()
  })

  it('executes actions end-to-end (60-second example)', async () => {
    const { element, controller, user, getByRole } = await render(HelloController, {
      html: `
        <div ${attr.controller('hello', { greeting: 'Hi' })}>
          <input ${attr.target('hello', 'name')} />
          <button ${attr.action('hello', 'greet', 'click')}>Greet</button>
          <span ${attr.target('hello', 'output')}></span>
        </div>
      `,
    })

    const input = element.querySelector('input')!
    await user.type(input, 'Ada')
    await user.click(getByRole('button', { name: 'Greet' }))

    expect(controller.outputTarget.textContent).toBe('Hi, Ada!')
  })

  it('infers the identifier from the class name', async () => {
    const { element } = await render(CounterController, {
      html: `<div data-controller="counter" data-counter-count-value="0"><span data-counter-target="display"></span></div>`,
    })
    expect(element.matches('[data-controller~="counter"]')).toBe(true)
  })

  it('accepts a path-like options.identifier and normalizes it', async () => {
    // "MyApp/HelloController" is a bare class-name-in-folder, not a file name
    // with "_controller" suffix — so we keep "hellocontroller" intact.
    const { element } = await render(HelloController, {
      identifier: 'MyApp/HelloController',
      html: `
        <div data-controller="myapp--hellocontroller">
          <input data-myapp--hellocontroller-target="name" />
          <span data-myapp--hellocontroller-target="output"></span>
        </div>
      `,
    })
    expect(element.getAttribute('data-controller')).toBe('myapp--hellocontroller')
  })

  it('accepts a file-name-style options.identifier and strips "_controller"', async () => {
    const { element } = await render(HelloController, {
      identifier: './assets/controllers/MyApp/Hello_controller.js',
      html: `
        <div data-controller="myapp--hello">
          <input data-myapp--hello-target="name" />
          <span data-myapp--hello-target="output"></span>
        </div>
      `,
    })
    expect(element.getAttribute('data-controller')).toBe('myapp--hello')
  })

  it('throws when options.html is missing', async () => {
    // @ts-expect-error — intentional
    await expect(render(HelloController, {})).rejects.toThrow(/html is required/)
  })

  it('throws when no matching controller root is found', async () => {
    await expect(
      render(HelloController, { html: `<div>no controller here</div>` }),
    ).rejects.toThrow(/no element with data-controller/)
  })

  it('unmount() removes DOM and stops the application', async () => {
    const { element, unmount } = await render(HelloController, {
      html: `
        <div data-controller="hello">
          <input data-hello-target="name" />
          <span data-hello-target="output"></span>
        </div>
      `,
    })
    expect(document.body.contains(element)).toBe(true)
    unmount()
    expect(document.body.contains(element)).toBe(false)
    // Double-unmount is a no-op:
    expect(() => unmount()).not.toThrow()
  })

  it('rerender() replaces the fixture HTML', async () => {
    const result = await render(CounterController, {
      html: `<div data-controller="counter" data-counter-count-value="1"><span data-counter-target="display"></span></div>`,
    })
    expect(result.controller.countValue).toBe(1)

    await result.rerender({
      html: `<div data-controller="counter" data-counter-count-value="9"><span data-counter-target="display"></span></div>`,
    })
    expect(result.controller.countValue).toBe(9)
    expect(result.element.textContent).toContain('9')
  })

  it('rerender() throws if new fixture lacks controller', async () => {
    const result = await render(CounterController, {
      html: `<div data-controller="counter" data-counter-count-value="0"><span data-counter-target="display"></span></div>`,
    })
    await expect(result.rerender({ html: '<div>nothing</div>' })).rejects.toThrow(/rerender/)
  })
})
