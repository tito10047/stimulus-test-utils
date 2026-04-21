import { describe, expect, it } from 'vitest'
import { Application } from '@hotwired/stimulus'
import { render, cleanup } from '../src/index.js'
import { CounterController } from './fixtures/controllers.js'

describe('cleanup', () => {
  it('removes all mounted fixtures and stops owned applications', async () => {
    await render(CounterController, {
      html: `<div data-controller="counter" data-counter-count-value="0"><span data-counter-target="display"></span></div>`,
    })
    await render(CounterController, {
      html: `<div data-controller="counter" data-counter-count-value="1"><span data-counter-target="display"></span></div>`,
    })
    expect(document.querySelectorAll('[data-controller="counter"]')).toHaveLength(2)
    cleanup()
    expect(document.querySelectorAll('[data-controller="counter"]')).toHaveLength(0)
  })

  it('does not stop a BYO application', async () => {
    const app = Application.start()
    const { unmount } = await render(CounterController, {
      application: app,
      html: `<div data-controller="counter" data-counter-count-value="0"><span data-counter-target="display"></span></div>`,
    })
    unmount()
    // BYO app survives unmount — prove it by registering a new controller.
    expect(() => app.register('counter', CounterController)).not.toThrow()
    app.stop()
  })

  it('double cleanup is a no-op', () => {
    expect(() => {
      cleanup()
      cleanup()
    }).not.toThrow()
  })
})
