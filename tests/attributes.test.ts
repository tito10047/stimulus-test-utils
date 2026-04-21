import { describe, expect, it } from 'vitest'
import {
  stimulusController,
  stimulusTarget,
  stimulusAction,
  combine,
  toKebabCase,
  escapeAttr,
} from '../src/index.js'

describe('toKebabCase', () => {
  it.each([
    ['greeting', 'greeting'],
    ['greetingMessage', 'greeting-message'],
    ['greeting_message', 'greeting-message'],
    ['GreetingMessage', 'greeting-message'],
    ['HTMLParser', 'html-parser'],
    ['already-kebab', 'already-kebab'],
    ['X', 'x'],
  ])('%s → %s', (input, expected) => {
    expect(toKebabCase(input)).toBe(expected)
  })
})

describe('escapeAttr', () => {
  it('escapes all HTML attribute unsafe characters', () => {
    expect(escapeAttr(`"Hello" & <world>'s`)).toBe(
      "&quot;Hello&quot; &amp; <world>'s",
    )
  })

  it('leaves plain text untouched', () => {
    expect(escapeAttr('hello world 123')).toBe('hello world 123')
  })
})

describe('stimulusController', () => {
  it('emits just data-controller when given only an identifier', () => {
    expect(`${stimulusController('hello')}`).toBe('data-controller="hello"')
  })

  it('emits values with kebab-cased keys', () => {
    const out = `${stimulusController('hello', { greetingMessage: 'Hi', count: 3, active: true })}`
    expect(out).toContain('data-controller="hello"')
    expect(out).toContain('data-hello-greeting-message-value="Hi"')
    expect(out).toContain('data-hello-count-value="3"')
    expect(out).toContain('data-hello-active-value="true"')
  })

  it('JSON-encodes object and array values', () => {
    const out = `${stimulusController('hello', { user: { name: 'Ada' } })}`
    expect(out).toContain('data-hello-user-value="{&quot;name&quot;:&quot;Ada&quot;}"')
  })

  it('emits classes and outlets', () => {
    const out = `${stimulusController('modal', {}, { open: 'is-open' }, { dialog: "[data-controller~='d']" })}`
    expect(out).toContain('data-modal-open-class="is-open"')
    expect(out).toContain(`data-modal-dialog-outlet="[data-controller~='d']"`)
  })

  it('escapes embedded quotes / tags safely', () => {
    const out = `${stimulusController('hello', { title: '"<bad>"' })}`
    expect(out).toContain('data-hello-title-value="&quot;<bad>&quot;"')
  })

  it('serializes null as the literal "null"', () => {
    const out = `${stimulusController('hello', { ref: null })}`
    expect(out).toContain('data-hello-ref-value="null"')
  })

  it('throws on empty identifier', () => {
    expect(() => stimulusController('')).toThrow(/non-empty string/)
    // @ts-expect-error — runtime guard
    expect(() => stimulusController(null)).toThrow()
  })

  it('normalizes path-like identifier "MyApp/MyController" → "myapp--mycontroller"', () => {
    const out = `${stimulusController('MyApp/MyController', { greeting: 'Hi' })}`
    expect(out).toContain('data-controller="myapp--mycontroller"')
    expect(out).toContain('data-myapp--mycontroller-greeting-value="Hi"')
  })
})

describe('stimulusTarget', () => {
  it('emits a single target', () => {
    expect(`${stimulusTarget('hello', 'name')}`).toBe('data-hello-target="name"')
  })

  it('emits multiple targets space-separated', () => {
    expect(`${stimulusTarget('hello', 'name', 'output')}`).toBe('data-hello-target="name output"')
  })

  it('de-duplicates repeated names', () => {
    expect(`${stimulusTarget('hello', 'name', 'name')}`).toBe('data-hello-target="name"')
  })

  it('normalizes path-like identifier', () => {
    expect(`${stimulusTarget('MyApp/MyController', 'slot')}`).toBe(
      'data-myapp--mycontroller-target="slot"',
    )
  })

  it('throws on missing identifier / names', () => {
    expect(() => stimulusTarget('')).toThrow()
    expect(() => stimulusTarget('hello')).toThrow(/at least one target name/)
  })
})

describe('stimulusAction', () => {
  it('event-less descriptor', () => {
    expect(`${stimulusAction('hello', 'greet')}`).toBe('data-action="hello#greet"')
  })

  it('event+method descriptor', () => {
    expect(`${stimulusAction('hello', 'greet', 'click')}`).toBe(
      'data-action="click->hello#greet"',
    )
  })

  it('appends options in canonical order', () => {
    expect(
      `${stimulusAction('hello', 'submit', 'submit', { stop: true, prevent: true })}`,
    ).toBe('data-action="submit->hello#submit:prevent:stop"')
  })

  it('keydown.enter notation', () => {
    expect(`${stimulusAction('hello', 'onKey', 'keydown.enter')}`).toBe(
      'data-action="keydown.enter->hello#onKey"',
    )
  })

  it('normalizes path-like identifier', () => {
    expect(`${stimulusAction('MyApp/MyController', 'greet', 'click')}`).toBe(
      'data-action="click->myapp--mycontroller#greet"',
    )
  })

  it('throws on missing args', () => {
    expect(() => stimulusAction('', 'x')).toThrow()
    expect(() => stimulusAction('hello', '')).toThrow()
  })
})

describe('AttrSpec behaviour', () => {
  it('typeof is object (documented)', () => {
    expect(typeof stimulusController('hello')).toBe('object')
  })

  it('String() coerces via toString', () => {
    expect(String(stimulusController('hello'))).toBe('data-controller="hello"')
  })

  it('JSON.stringify uses toJSON', () => {
    const json = JSON.stringify(stimulusController('hello'))
    expect(json).toBe('"data-controller=\\"hello\\""')
  })

  it('+ string concatenation works via toPrimitive', () => {
    const s: string = 'X ' + stimulusController('hello')
    expect(s).toBe('X data-controller="hello"')
  })
})

describe('combine()', () => {
  it('merges two controllers onto one element', () => {
    const out = `${combine(
      stimulusController('hello', { greeting: 'Hi' }),
      stimulusController('tooltip', { text: 'Hey' }),
    )}`
    expect(out).toContain('data-controller="hello tooltip"')
    expect(out).toContain('data-hello-greeting-value="Hi"')
    expect(out).toContain('data-tooltip-text-value="Hey"')
  })

  it('merges multiple actions into a single data-action', () => {
    const out = `${combine(
      stimulusAction('hello', 'greet', 'click'),
      stimulusAction('hello', 'reset', 'dblclick'),
    )}`
    expect(out).toBe('data-action="click->hello#greet dblclick->hello#reset"')
  })

  it('mixed controller + target + action', () => {
    const out = `${combine(
      stimulusController('modal'),
      stimulusTarget('parent', 'slot'),
      stimulusAction('modal', 'open', 'click'),
    )}`
    expect(out).toContain('data-controller="modal"')
    expect(out).toContain('data-parent-target="slot"')
    expect(out).toContain('data-action="click->modal#open"')
  })

  it('is recursive: combine(a, combine(b, c))', () => {
    const inner = combine(stimulusController('b'), stimulusController('c'))
    const outer = combine(stimulusController('a'), inner)
    expect(`${outer}`).toContain('data-controller="a b c"')
  })

  it('throws on duplicate controller identifier', () => {
    expect(() =>
      combine(stimulusController('hello'), stimulusController('hello', { foo: 1 })),
    ).toThrow(/duplicate Stimulus controller identifier "hello"/)
  })

  it('throws on non-AttrSpec argument', () => {
    // @ts-expect-error — runtime guard
    expect(() => combine('data-controller="x"')).toThrow(/AttrSpec/)
  })

  it('empty combine() is valid and renders nothing', () => {
    expect(`${combine()}`).toBe('')
  })

  it('de-duplicates target names across specs on same identifier', () => {
    const out = `${combine(stimulusTarget('x', 'a'), stimulusTarget('x', 'a', 'b'))}`
    expect(out).toBe('data-x-target="a b"')
  })
})
