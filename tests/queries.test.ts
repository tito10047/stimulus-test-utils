import { describe, expect, it } from 'vitest'
import { createQueries } from '../src/queries.js'

function setup(html: string): HTMLElement {
  const root = document.createElement('div')
  root.innerHTML = html.trim()
  document.body.appendChild(root)
  return root
}

describe('queries — TestId', () => {
  const root = () =>
    setup(`<button data-testid="save">S</button><span data-testid="save">S2</span>`)

  it('getByTestId throws when multiple match', () => {
    const q = createQueries(root())
    expect(() => q.getByTestId('save')).toThrow(/found 2/)
  })

  it('getAllByTestId returns all matches', () => {
    const q = createQueries(root())
    expect(q.getAllByTestId('save')).toHaveLength(2)
  })

  it('queryByTestId returns null when none', () => {
    const q = createQueries(setup(`<div></div>`))
    expect(q.queryByTestId('nope')).toBeNull()
  })

  it('getByTestId throws when none', () => {
    const q = createQueries(setup(`<div></div>`))
    expect(() => q.getByTestId('nope')).toThrow(/no element found/)
  })

  it('getAllByTestId throws when none', () => {
    const q = createQueries(setup(`<div></div>`))
    expect(() => q.getAllByTestId('nope')).toThrow(/no element found/)
  })

  it('findByTestId resolves once the element appears', async () => {
    const r = setup('<div></div>')
    const q = createQueries(r)
    setTimeout(() => {
      const e = document.createElement('span')
      e.setAttribute('data-testid', 'late')
      r.appendChild(e)
    }, 30)
    const el = await q.findByTestId('late', { timeout: 500, interval: 10 })
    expect(el).toBeDefined()
  })
})

describe('queries — Role', () => {
  it('matches implicit role for button', () => {
    const q = createQueries(setup(`<button>Save</button>`))
    expect(q.getByRole('button').textContent).toBe('Save')
  })

  it('matches role by accessible name (textContent)', () => {
    const q = createQueries(setup(`<button>Save</button><button>Delete</button>`))
    expect(q.getByRole('button', { name: 'Delete' }).textContent).toBe('Delete')
  })

  it('matches role by regex name', () => {
    const q = createQueries(setup(`<button>Save me</button>`))
    expect(q.getByRole('button', { name: /save/i })).toBeTruthy()
  })

  it('matches ARIA role override', () => {
    const q = createQueries(setup(`<div role="button">X</div>`))
    expect(q.getByRole('button')).toBeTruthy()
  })

  it('matches input role by type', () => {
    const q = createQueries(
      setup(`<input type="checkbox" /> <input type="range" /> <input type="text" />`),
    )
    expect(q.getByRole('checkbox')).toBeTruthy()
    expect(q.getByRole('slider')).toBeTruthy()
    expect(q.getByRole('textbox')).toBeTruthy()
  })

  it('does not match <a> without href', () => {
    const q = createQueries(setup(`<a>no link</a>`))
    expect(q.queryByRole('link')).toBeNull()
  })

  it('matches <a href>', () => {
    const q = createQueries(setup(`<a href="/x">link</a>`))
    expect(q.getByRole('link').textContent).toBe('link')
  })

  it('queryByRole returns null on miss', () => {
    const q = createQueries(setup(`<div></div>`))
    expect(q.queryByRole('button')).toBeNull()
  })

  it('getAllByRole throws on miss', () => {
    const q = createQueries(setup(`<div></div>`))
    expect(() => q.getAllByRole('button')).toThrow()
  })

  it('findByRole waits for element', async () => {
    const r = setup('<div></div>')
    const q = createQueries(r)
    setTimeout(() => r.insertAdjacentHTML('beforeend', '<button>Hi</button>'), 20)
    const btn = await q.findByRole('button', { timeout: 500, interval: 10 })
    expect(btn.textContent).toBe('Hi')
  })

  it('matches accessible name via aria-label', () => {
    const q = createQueries(setup(`<button aria-label="close">x</button>`))
    expect(q.getByRole('button', { name: 'close' })).toBeTruthy()
  })

  it('matches accessible name via aria-labelledby', () => {
    // label must live in document for getElementById lookup
    document.body.insertAdjacentHTML('beforeend', '<span id="lbl-1">Saveme</span>')
    const q = createQueries(setup(`<button aria-labelledby="lbl-1">x</button>`))
    expect(q.getByRole('button', { name: 'Saveme' })).toBeTruthy()
  })
})

describe('queries — Text', () => {
  it('matches own text only', () => {
    const q = createQueries(setup(`<div>Hello <span>inside</span></div>`))
    expect(q.getByText('inside').tagName).toBe('SPAN')
  })

  it('queryByText returns null on miss', () => {
    const q = createQueries(setup(`<div>x</div>`))
    expect(q.queryByText('nope')).toBeNull()
  })

  it('getAllByText throws on miss', () => {
    const q = createQueries(setup(`<div>x</div>`))
    expect(() => q.getAllByText('nope')).toThrow()
  })

  it('findByText polls', async () => {
    const r = setup('<div></div>')
    const q = createQueries(r)
    setTimeout(() => r.insertAdjacentHTML('beforeend', '<span>later</span>'), 20)
    const el = await q.findByText('later', { timeout: 500, interval: 10 })
    expect(el).toBeTruthy()
  })

  it('matches regex', () => {
    const q = createQueries(setup(`<p>hello world</p>`))
    expect(q.getByText(/world/)).toBeTruthy()
  })
})

describe('queries — LabelText', () => {
  it('finds input via <label for>', () => {
    const q = createQueries(
      setup(`<label for="n">Name</label><input id="n" />`),
    )
    expect(q.getByLabelText('Name').tagName).toBe('INPUT')
  })

  it('finds nested input inside label', () => {
    const q = createQueries(setup(`<label>Age <input /></label>`))
    expect(q.getByLabelText(/age/i).tagName).toBe('INPUT')
  })

  it('queryByLabelText returns null', () => {
    const q = createQueries(setup(`<input />`))
    expect(q.queryByLabelText('missing')).toBeNull()
  })

  it('findByLabelText polls', async () => {
    const r = setup('<div></div>')
    const q = createQueries(r)
    setTimeout(
      () =>
        r.insertAdjacentHTML(
          'beforeend',
          '<label for="lateL">Late</label><input id="lateL" />',
        ),
      20,
    )
    const el = await q.findByLabelText('Late', { timeout: 500, interval: 10 })
    expect(el).toBeTruthy()
  })
})
