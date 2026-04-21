/**
 * Integration tests: real Stimulus controllers driven by our library.
 * Each scenario exercises a different Stimulus feature — values, targets,
 * classes, outlets, async actions, keyboard events — to prove the harness
 * works on realistic code.
 */
import { describe, expect, it, vi } from 'vitest'
import {
  render,
  stimulusController,
  stimulusTarget,
  stimulusAction,
  combine,
  fireEvent,
} from '../src/index.js'
import {
  CounterController,
  DialogController,
  FormValidatorController,
  HelloController,
  KeyboardController,
  ModalController,
  SearchController,
  TabsController,
  ToggleController,
} from './fixtures/controllers.js'

describe('HelloController', () => {
  it('updates output when the Greet button is clicked', async () => {
    const { controller, user, element, getByRole } = await render(HelloController, {
      html: `
        <div ${stimulusController('hello', { greeting: 'Hi' })}>
          <input ${stimulusTarget('hello', 'name')} />
          <button ${stimulusAction('hello', 'greet', 'click')}>Greet</button>
          <span ${stimulusTarget('hello', 'output')}></span>
        </div>
      `,
    })

    await user.type(element.querySelector('input')!, 'Ada')
    await user.click(getByRole('button', { name: 'Greet' }))
    expect(controller.outputTarget.textContent).toBe('Hi, Ada!')
  })

  it('default greeting is "Hello" when value is omitted', async () => {
    const { controller, user, element, getByRole } = await render(HelloController, {
      html: `
        <div ${stimulusController('hello')}>
          <input ${stimulusTarget('hello', 'name')} />
          <button ${stimulusAction('hello', 'greet', 'click')}>Greet</button>
          <span ${stimulusTarget('hello', 'output')}></span>
        </div>
      `,
    })
    await user.type(element.querySelector('input')!, 'Grace')
    await user.click(getByRole('button', { name: 'Greet' }))
    expect(controller.outputTarget.textContent).toBe('Hello, Grace!')
  })
})

describe('CounterController', () => {
  const fixture = (count = 0, step = 1) => `
    <div ${stimulusController('counter', { count, step })}>
      <span ${stimulusTarget('counter', 'display')}></span>
      <button ${stimulusAction('counter', 'increment', 'click')}>+</button>
      <button ${stimulusAction('counter', 'decrement', 'click')}>-</button>
      <button ${stimulusAction('counter', 'reset', 'click')}>reset</button>
    </div>
  `

  it('increments when + is clicked', async () => {
    const { controller, user, getByRole } = await render(CounterController, { html: fixture(0) })
    await user.click(getByRole('button', { name: '+' }))
    await user.click(getByRole('button', { name: '+' }))
    expect(controller.countValue).toBe(2)
  })

  it('decrements when - is clicked', async () => {
    const { controller, user, getByRole } = await render(CounterController, { html: fixture(5) })
    await user.click(getByRole('button', { name: '-' }))
    expect(controller.countValue).toBe(4)
  })

  it('respects custom step', async () => {
    const { controller, user, getByRole } = await render(CounterController, { html: fixture(0, 10) })
    await user.click(getByRole('button', { name: '+' }))
    expect(controller.countValue).toBe(10)
  })

  it('reset sets count back to 0 and re-renders display', async () => {
    const { controller, user, element, getByRole } = await render(CounterController, {
      html: fixture(42),
    })
    expect(controller.displayTarget.textContent).toBe('42')
    await user.click(getByRole('button', { name: 'reset' }))
    expect(controller.countValue).toBe(0)
    expect(element.querySelector('[data-counter-target="display"]')!.textContent).toBe('0')
  })
})

describe('FormValidatorController', () => {
  it('shows an error when pattern fails and dispatches "invalid"', async () => {
    const invalidSpy = vi.fn()
    const { user, element, getByLabelText } = await render(FormValidatorController, {
      identifier: 'form-validator',
      html: `
        <div ${stimulusController('form-validator', {
          pattern: '^\\d{3}$',
          message: 'Must be 3 digits',
        })}>
          <label for="code">Code</label>
          <input id="code" ${combine(
            stimulusTarget('form-validator', 'input'),
            stimulusAction('form-validator', 'validate', 'input'),
          )} />
          <p ${stimulusTarget('form-validator', 'error')}></p>
        </div>
      `,
    })
    element.addEventListener('form-validator:invalid', invalidSpy as EventListener)

    await user.type(getByLabelText('Code'), 'ab')
    expect(element.querySelector('p')!.textContent).toBe('Must be 3 digits')
    expect(invalidSpy).toHaveBeenCalled()
  })

  it('clears error and dispatches "valid" when pattern matches', async () => {
    const validSpy = vi.fn()
    const { user, element, getByLabelText } = await render(FormValidatorController, {
      identifier: 'form-validator',
      html: `
        <div ${stimulusController('form-validator', { pattern: '^\\d{3}$' })}>
          <label for="code">Code</label>
          <input id="code" ${combine(
            stimulusTarget('form-validator', 'input'),
            stimulusAction('form-validator', 'validate', 'input'),
          )} />
          <p ${stimulusTarget('form-validator', 'error')}>start</p>
        </div>
      `,
    })
    element.addEventListener('form-validator:valid', validSpy as EventListener)

    await user.type(getByLabelText('Code'), '123')
    expect(element.querySelector('p')!.textContent).toBe('')
    expect(validSpy).toHaveBeenCalled()
  })
})

describe('ToggleController', () => {
  it('toggles hidden attribute and CSS class', async () => {
    const { user, getByRole, element } = await render(ToggleController, {
      html: `
        <div ${combine(stimulusController('toggle', {}, { open: 'is-open' }))}>
          <button ${combine(
            stimulusTarget('toggle', 'trigger'),
            stimulusAction('toggle', 'toggle', 'click'),
          )} aria-expanded="false">Menu</button>
          <div ${stimulusTarget('toggle', 'content')} hidden>Hidden content</div>
        </div>
      `,
    })

    const trigger = getByRole('button', { name: 'Menu' })
    const content = element.querySelector('[data-toggle-target="content"]') as HTMLElement

    expect(content.hasAttribute('hidden')).toBe(true)
    await user.click(trigger)
    expect(content.hasAttribute('hidden')).toBe(false)
    expect(trigger.classList.contains('is-open')).toBe(true)
    expect(trigger.getAttribute('aria-expanded')).toBe('true')

    await user.click(trigger)
    expect(content.hasAttribute('hidden')).toBe(true)
    expect(trigger.classList.contains('is-open')).toBe(false)
  })
})

describe('SearchController (async fetch)', () => {
  it('renders results from a mocked fetch', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify([{ id: 1, name: 'Ada' }, { id: 2, name: 'Grace' }]), {
          status: 200,
        }),
      ),
    )

    const { user, waitFor, getByRole, findByTestId } = await render(SearchController, {
      html: `
        <div ${stimulusController('search', { url: '/api/search' })}>
          <input ${stimulusTarget('search', 'query')} aria-label="query" />
          <button ${stimulusAction('search', 'submit', 'click')}>Search</button>
          <p ${stimulusTarget('search', 'status')}></p>
          <ul ${stimulusTarget('search', 'results')}></ul>
        </div>
      `,
    })

    await user.type(getByRole('textbox', { name: 'query' }), 'ad')
    await user.click(getByRole('button', { name: 'Search' }))

    await waitFor(() => {
      expect(getByRole('listitem', { name: 'Ada' })).toBeTruthy()
    })
    expect(await findByTestId('result-2')).toBeTruthy()

    vi.unstubAllGlobals()
  })

  it('surfaces fetch errors into status target', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('boom')))

    const { user, waitFor, element, getByRole } = await render(SearchController, {
      html: `
        <div ${stimulusController('search', { url: '/api/search' })}>
          <input ${stimulusTarget('search', 'query')} aria-label="q" />
          <button ${stimulusAction('search', 'submit', 'click')}>Go</button>
          <p ${stimulusTarget('search', 'status')}></p>
          <ul ${stimulusTarget('search', 'results')}></ul>
        </div>
      `,
    })

    await user.type(getByRole('textbox', { name: 'q' }), 'x')
    await user.click(getByRole('button', { name: 'Go' }))
    await waitFor(() => {
      expect(element.querySelector('[data-search-target="status"]')!.textContent).toContain('Error: boom')
    })

    vi.unstubAllGlobals()
  })
})

describe('Modal + Dialog outlets', () => {
  it('opens and closes the dialog via the outlet', async () => {
    const { controller, user, element, getByRole } = await render(ModalController, {
      controllers: { dialog: DialogController },
      html: `
        <div>
          <div ${combine(
            stimulusController('modal', {}, {}, { dialog: "[data-controller~='dialog']" }),
          )}>
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
  })
})

describe('TabsController', () => {
  it('switches active tab / panel on click', async () => {
    const { element, user, getByRole } = await render(TabsController, {
      html: `
        <div ${combine(stimulusController('tabs', { activeIndex: 0 }, { active: 'is-active' }))}>
          <div role="tablist">
            <button ${combine(stimulusTarget('tabs', 'tab'), stimulusAction('tabs', 'select', 'click'))} role="tab">One</button>
            <button ${combine(stimulusTarget('tabs', 'tab'), stimulusAction('tabs', 'select', 'click'))} role="tab">Two</button>
          </div>
          <section ${stimulusTarget('tabs', 'panel')}>First</section>
          <section ${stimulusTarget('tabs', 'panel')}>Second</section>
        </div>
      `,
    })

    const [tab1, tab2] = Array.from(element.querySelectorAll<HTMLButtonElement>('[role="tab"]'))
    const [panel1, panel2] = Array.from(element.querySelectorAll('section'))

    expect(tab1!.classList.contains('is-active')).toBe(true)
    expect(panel2!.hasAttribute('hidden')).toBe(true)

    await user.click(tab2!)
    expect(tab2!.classList.contains('is-active')).toBe(true)
    expect(tab1!.classList.contains('is-active')).toBe(false)
    expect(panel1!.hasAttribute('hidden')).toBe(true)
    expect(panel2!.hasAttribute('hidden')).toBe(false)

    // Getter check by role selector
    expect(getByRole('tab', { name: 'Two' }).getAttribute('aria-selected')).toBe('true')
  })
})

describe('KeyboardController', () => {
  it('handles Enter and Escape via keydown actions', async () => {
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
})

describe('fireEvent escape hatch', () => {
  it('dispatches custom events that Stimulus can receive', async () => {
    const { Controller: BaseController } = await import('@hotwired/stimulus')
    class PingController extends BaseController {
      static override targets = ['out']
      declare readonly outTarget: HTMLElement
      onPing(event: CustomEvent<{ n: number }>): void {
        this.outTarget.textContent = `ping:${event.detail.n}`
      }
    }

    const { element } = await render(PingController, {
      identifier: 'ping',
      html: `
        <div ${combine(
          stimulusController('ping'),
          stimulusAction('ping', 'onPing', 'custom:ping'),
        )}>
          <span ${stimulusTarget('ping', 'out')}></span>
        </div>
      `,
    })

    await fireEvent(element, 'custom:ping', { detail: { n: 7 } } as EventInit)
    expect(element.querySelector('[data-ping-target="out"]')!.textContent).toBe('ping:7')
  })
})
