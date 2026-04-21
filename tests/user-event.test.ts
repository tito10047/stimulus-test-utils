import { describe, expect, it, vi } from 'vitest'
import { createUserEvent, fireEvent } from '../src/index.js'

const user = createUserEvent()

function setup(html: string): HTMLElement {
  const container = document.createElement('div')
  container.innerHTML = html
  document.body.appendChild(container)
  return container
}

describe('user.click', () => {
  it('dispatches mousedown / mouseup / click in order', async () => {
    const el = setup(`<button>X</button>`).querySelector('button')!
    const events: string[] = []
    ;['mousedown', 'mouseup', 'click'].forEach((name) => {
      el.addEventListener(name, () => events.push(name))
    })
    await user.click(el)
    expect(events).toEqual(['mousedown', 'mouseup', 'click'])
  })

  it('is a no-op on disabled elements', async () => {
    const el = setup(`<button disabled>X</button>`).querySelector('button')!
    const spy = vi.fn()
    el.addEventListener('click', spy)
    await user.click(el)
    expect(spy).not.toHaveBeenCalled()
  })

  it('submits owning form for submit buttons', async () => {
    const container = setup(`<form><button type="submit">Go</button></form>`)
    const submitSpy = vi.fn()
    container.querySelector('form')!.addEventListener('submit', (e) => {
      e.preventDefault()
      submitSpy()
    })
    await user.click(container.querySelector('button')!)
    expect(submitSpy).toHaveBeenCalled()
  })
})

describe('user.dblClick / hover', () => {
  it('dblClick dispatches click + dblclick', async () => {
    const el = setup(`<div>X</div>`).querySelector('div')!
    const events: string[] = []
    el.addEventListener('click', () => events.push('click'))
    el.addEventListener('dblclick', () => events.push('dblclick'))
    await user.dblClick(el)
    expect(events).toEqual(['click', 'dblclick'])
  })

  it('hover dispatches mouseover/enter/move', async () => {
    const el = setup(`<div>X</div>`).querySelector('div')!
    const events: string[] = []
    el.addEventListener('mouseover', () => events.push('mouseover'))
    el.addEventListener('mousemove', () => events.push('mousemove'))
    await user.hover(el)
    expect(events).toContain('mouseover')
    expect(events).toContain('mousemove')
  })
})

describe('user.type / clear', () => {
  it('types each character and fires input+change', async () => {
    const input = setup(`<input />`).querySelector('input')!
    const inputs: string[] = []
    input.addEventListener('input', () => inputs.push(input.value))
    const changeSpy = vi.fn()
    input.addEventListener('change', changeSpy)

    await user.type(input, 'hi')
    expect(inputs).toEqual(['h', 'hi'])
    expect(input.value).toBe('hi')
    expect(changeSpy).toHaveBeenCalledOnce()
  })

  it('supports textarea', async () => {
    const ta = setup(`<textarea></textarea>`).querySelector('textarea')!
    await user.type(ta, 'ok')
    expect(ta.value).toBe('ok')
  })

  it('clear() empties the input and fires events', async () => {
    const input = setup(`<input value="abc" />`).querySelector('input')!
    await user.clear(input)
    expect(input.value).toBe('')
  })

  it('throws on non-input target', async () => {
    const div = setup(`<div></div>`).querySelector('div')!
    await expect(user.type(div, 'x')).rejects.toThrow(/must be <input>/)
    await expect(user.clear(div)).rejects.toThrow(/must be <input>/)
  })
})

describe('user.keyboard', () => {
  it('dispatches a single named key', async () => {
    const input = setup(`<input />`).querySelector('input')!
    input.focus()
    const keys: string[] = []
    input.addEventListener('keydown', (e) => keys.push(`down:${e.key}`))
    input.addEventListener('keyup', (e) => keys.push(`up:${e.key}`))
    await user.keyboard('{Enter}')
    expect(keys).toEqual(['down:Enter', 'up:Enter'])
  })

  it('handles shift hold/release', async () => {
    const input = setup(`<input />`).querySelector('input')!
    input.focus()
    const captured: Array<{ key: string; shift: boolean }> = []
    input.addEventListener('keydown', (e) => captured.push({ key: e.key, shift: e.shiftKey }))
    await user.keyboard('{Shift>}A{/Shift}')
    expect(captured).toEqual([
      { key: 'Shift', shift: false },
      { key: 'A', shift: true },
    ])
  })

  it('throws on unclosed brace', async () => {
    await expect(user.keyboard('{Enter')).rejects.toThrow(/unclosed/)
  })
})

describe('user.tab', () => {
  it('dispatches Tab keydown/keyup', async () => {
    const keys: string[] = []
    document.body.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') keys.push(`down:${e.shiftKey}`)
    })
    await user.tab()
    await user.tab({ shift: true })
    expect(keys).toEqual(['down:false', 'down:true'])
  })
})

describe('user.selectOption', () => {
  it('selects a single option on a single-select', async () => {
    const sel = setup(
      `<select><option value="a">A</option><option value="b">B</option></select>`,
    ).querySelector('select')!
    const changeSpy = vi.fn()
    sel.addEventListener('change', changeSpy)
    await user.selectOption(sel, 'b')
    expect(sel.value).toBe('b')
    expect(changeSpy).toHaveBeenCalledOnce()
  })

  it('selects multiple options on multi-select', async () => {
    const sel = setup(
      `<select multiple><option value="a">A</option><option value="b">B</option><option value="c">C</option></select>`,
    ).querySelector('select')!
    await user.selectOption(sel, ['a', 'c'])
    const selected = Array.from(sel.selectedOptions).map((o) => o.value)
    expect(selected).toEqual(['a', 'c'])
  })

  it('throws on single-select with array', async () => {
    const sel = setup(
      `<select><option value="a">A</option></select>`,
    ).querySelector('select')!
    await expect(user.selectOption(sel, ['a', 'b'])).rejects.toThrow(/cannot select multiple/)
  })

  it('throws when no option matches', async () => {
    const sel = setup(
      `<select><option value="a">A</option></select>`,
    ).querySelector('select')!
    await expect(user.selectOption(sel, 'missing')).rejects.toThrow(/no <option> matched/)
  })
})

describe('user.submit', () => {
  it('dispatches a cancelable submit event', async () => {
    const form = setup(`<form></form>`).querySelector('form')!
    const spy = vi.fn((e: Event) => e.preventDefault())
    form.addEventListener('submit', spy as EventListener)
    await user.submit(form)
    expect(spy).toHaveBeenCalledOnce()
  })
})

describe('fireEvent', () => {
  it('dispatches a custom event by name', async () => {
    const el = setup(`<div></div>`).querySelector('div')!
    const spy = vi.fn()
    el.addEventListener('custom:x', spy as EventListener)
    await fireEvent(el, 'custom:x', { detail: { n: 1 } } as EventInit)
    expect(spy).toHaveBeenCalled()
    const event = spy.mock.calls[0]![0] as CustomEvent
    expect(event.detail).toEqual({ n: 1 })
  })

  it('dispatches a pre-built Event instance', async () => {
    const input = setup(`<input />`).querySelector('input')!
    const spy = vi.fn()
    input.addEventListener('input', spy)
    await fireEvent(input, new Event('input', { bubbles: true }))
    expect(spy).toHaveBeenCalled()
  })
})
