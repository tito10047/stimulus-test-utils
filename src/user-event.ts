import { nextTick } from './wait-for.js'
import type { UserEvent } from './types.js'

/**
 * Minimal user-event layer. Focused on the event surface Stimulus actions
 * actually listen for: click/dblclick/mouseover-hover, input/change, keydown/up,
 * submit, focus/blur. Every method awaits a tick so Stimulus' MutationObserver
 * and action dispatch settle before returning.
 */

function dispatch(target: EventTarget, event: Event): void {
  target.dispatchEvent(event)
}

function isDisabled(el: Element): boolean {
  return (el as HTMLInputElement).disabled === true
}

function focusIfPossible(el: Element): void {
  const focusable = el as HTMLElement
  if (typeof focusable.focus === 'function') {
    focusable.focus()
  }
}

async function clickImpl(el: Element): Promise<void> {
  if (isDisabled(el)) return
  focusIfPossible(el)
  dispatch(el, new MouseEvent('mousedown', { bubbles: true, cancelable: true }))
  dispatch(el, new MouseEvent('mouseup', { bubbles: true, cancelable: true }))
  dispatch(el, new MouseEvent('click', { bubbles: true, cancelable: true }))
  // Forms: clicking a submit button submits.
  if (el instanceof HTMLButtonElement && el.type === 'submit' && el.form) {
    await submitImpl(el.form)
  }
  await nextTick()
}

async function dblClickImpl(el: Element): Promise<void> {
  if (isDisabled(el)) return
  await clickImpl(el)
  dispatch(el, new MouseEvent('dblclick', { bubbles: true, cancelable: true }))
  await nextTick()
}

async function hoverImpl(el: Element): Promise<void> {
  dispatch(el, new MouseEvent('mouseover', { bubbles: true, cancelable: true }))
  dispatch(el, new MouseEvent('mouseenter', { bubbles: false, cancelable: true }))
  dispatch(el, new MouseEvent('mousemove', { bubbles: true, cancelable: true }))
  await nextTick()
}

function getValueElement(el: Element): HTMLInputElement | HTMLTextAreaElement | null {
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) return el
  return null
}

async function typeImpl(el: Element, text: string): Promise<void> {
  const input = getValueElement(el)
  if (!input) throw new TypeError('user.type(): target must be <input> or <textarea>')
  focusIfPossible(input)
  for (const ch of [...text]) {
    dispatch(input, new KeyboardEvent('keydown', { key: ch, bubbles: true, cancelable: true }))
    input.value = input.value + ch
    dispatch(input, new InputEvent('input', { data: ch, bubbles: true, cancelable: true }))
    dispatch(input, new KeyboardEvent('keyup', { key: ch, bubbles: true, cancelable: true }))
  }
  dispatch(input, new Event('change', { bubbles: true }))
  await nextTick()
}

async function clearImpl(el: Element): Promise<void> {
  const input = getValueElement(el)
  if (!input) throw new TypeError('user.clear(): target must be <input> or <textarea>')
  focusIfPossible(input)
  input.value = ''
  dispatch(input, new InputEvent('input', { bubbles: true, cancelable: true }))
  dispatch(input, new Event('change', { bubbles: true }))
  await nextTick()
}

/** Parse "{Enter}", "{Shift>}A{/Shift}", "abc{Backspace}" into a token list. */
interface KeyToken {
  type: 'key' | 'down' | 'up'
  key: string
}

function parseKeyboard(input: string): KeyToken[] {
  const tokens: KeyToken[] = []
  let i = 0
  while (i < input.length) {
    const ch = input[i]!
    if (ch === '{') {
      const end = input.indexOf('}', i)
      if (end === -1) throw new SyntaxError(`user.keyboard: unclosed "{" in ${JSON.stringify(input)}`)
      let body = input.slice(i + 1, end)
      let type: KeyToken['type'] = 'key'
      if (body.endsWith('>')) {
        body = body.slice(0, -1)
        type = 'down'
      } else if (body.startsWith('/')) {
        body = body.slice(1)
        type = 'up'
      }
      tokens.push({ type, key: body })
      i = end + 1
    } else {
      tokens.push({ type: 'key', key: ch })
      i++
    }
  }
  return tokens
}

async function keyboardImpl(keys: string): Promise<void> {
  const tokens = parseKeyboard(keys)
  const target = (document.activeElement as HTMLElement | null) ?? document.body
  const modifiers = new Set<string>()

  for (const tok of tokens) {
    const key = tok.key
    const init: KeyboardEventInit = {
      key,
      bubbles: true,
      cancelable: true,
      shiftKey: modifiers.has('Shift'),
      ctrlKey: modifiers.has('Control'),
      altKey: modifiers.has('Alt'),
      metaKey: modifiers.has('Meta'),
    }
    if (tok.type === 'down') {
      modifiers.add(key)
      dispatch(target, new KeyboardEvent('keydown', init))
    } else if (tok.type === 'up') {
      modifiers.delete(key)
      dispatch(target, new KeyboardEvent('keyup', init))
    } else {
      dispatch(target, new KeyboardEvent('keydown', init))
      // Printable single-char keys that aren't a named key should also
      // produce an input on editable fields. Keep minimal: just up.
      dispatch(target, new KeyboardEvent('keyup', init))
    }
  }
  await nextTick()
}

async function tabImpl(opts: { shift?: boolean } = {}): Promise<void> {
  const target = (document.activeElement as HTMLElement | null) ?? document.body
  const init: KeyboardEventInit = {
    key: 'Tab',
    bubbles: true,
    cancelable: true,
    shiftKey: !!opts.shift,
  }
  dispatch(target, new KeyboardEvent('keydown', init))
  dispatch(target, new KeyboardEvent('keyup', init))
  await nextTick()
}

async function selectOptionImpl(
  select: HTMLSelectElement,
  value: string | string[],
): Promise<void> {
  const values = Array.isArray(value) ? value : [value]
  if (!select.multiple && values.length > 1) {
    throw new TypeError('user.selectOption(): cannot select multiple values on a single-select <select>')
  }
  let matched = 0
  for (const option of Array.from(select.options)) {
    const should = values.includes(option.value)
    option.selected = should
    if (should) matched++
  }
  if (matched === 0) {
    throw new Error(`user.selectOption(): no <option> matched value(s) ${JSON.stringify(value)}`)
  }
  dispatch(select, new Event('input', { bubbles: true }))
  dispatch(select, new Event('change', { bubbles: true }))
  await nextTick()
}

async function submitImpl(form: HTMLFormElement): Promise<void> {
  dispatch(form, new SubmitEvent('submit', { bubbles: true, cancelable: true }))
  await nextTick()
}

export function createUserEvent(): UserEvent {
  return {
    click: clickImpl,
    dblClick: dblClickImpl,
    hover: hoverImpl,
    type: typeImpl,
    clear: clearImpl,
    keyboard: keyboardImpl,
    tab: tabImpl,
    selectOption: selectOptionImpl,
    submit: submitImpl,
  }
}

export async function fireEvent(
  target: EventTarget,
  eventOrName: Event | string,
  init?: EventInit,
): Promise<void> {
  const event =
    typeof eventOrName === 'string'
      ? new CustomEvent(eventOrName, { bubbles: true, cancelable: true, ...init })
      : eventOrName
  target.dispatchEvent(event)
  await nextTick()
}
