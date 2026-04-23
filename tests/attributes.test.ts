import { describe, expect, it } from 'vitest'
import {
  attr,
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

describe('attr.controller', () => {
  it('emits just data-controller when given only an identifier', () => {
    expect(`${attr.controller('hello')}`).toBe('data-controller="hello"')
  })

  it('emits values with kebab-cased keys', () => {
    const out = `${attr.controller('hello', { greetingMessage: 'Hi', count: 3, active: true })}`
    expect(out).toContain('data-controller="hello"')
    expect(out).toContain('data-hello-greeting-message-value="Hi"')
    expect(out).toContain('data-hello-count-value="3"')
    expect(out).toContain('data-hello-active-value="true"')
  })

  it('JSON-encodes object and array values', () => {
    const out = `${attr.controller('hello', { user: { name: 'Ada' } })}`
    expect(out).toContain('data-hello-user-value="{&quot;name&quot;:&quot;Ada&quot;}"')
  })

  it('emits classes and outlets', () => {
    const out = `${attr.controller('modal', {}, { open: 'is-open' }, { dialog: "[data-controller~='d']" })}`
    expect(out).toContain('data-modal-open-class="is-open"')
    expect(out).toContain(`data-modal-dialog-outlet="[data-controller~='d']"`)
  })

  it('escapes embedded quotes / tags safely', () => {
    const out = `${attr.controller('hello', { title: '"<bad>"' })}`
    expect(out).toContain('data-hello-title-value="&quot;<bad>&quot;"')
  })

  it('serializes null as the literal "null"', () => {
    const out = `${attr.controller('hello', { ref: null })}`
    expect(out).toContain('data-hello-ref-value="null"')
  })

  it('throws on empty identifier', () => {
    expect(() => attr.controller('')).toThrow(/non-empty string/)
    // @ts-expect-error — runtime guard
    expect(() => attr.controller(null)).toThrow()
  })

  it('normalizes path-like identifier "MyApp/MyController" → "myapp--mycontroller"', () => {
    const out = `${attr.controller('MyApp/MyController', { greeting: 'Hi' })}`
    expect(out).toContain('data-controller="myapp--mycontroller"')
    expect(out).toContain('data-myapp--mycontroller-greeting-value="Hi"')
  })
})

describe('attr.target', () => {
  it('emits a single target', () => {
    expect(`${attr.target('hello', 'name')}`).toBe('data-hello-target="name"')
  })

  it('emits multiple targets space-separated', () => {
    expect(`${attr.target('hello', 'name', 'output')}`).toBe('data-hello-target="name output"')
  })

  it('de-duplicates repeated names', () => {
    expect(`${attr.target('hello', 'name', 'name')}`).toBe('data-hello-target="name"')
  })

  it('normalizes path-like identifier', () => {
    expect(`${attr.target('MyApp/MyController', 'slot')}`).toBe(
      'data-myapp--mycontroller-target="slot"',
    )
  })

  it('throws on missing identifier / names', () => {
    expect(() => attr.target('')).toThrow()
    expect(() => attr.target('hello')).toThrow(/at least one target name/)
  })
})

describe('attr.action', () => {
  it('event-less descriptor', () => {
    expect(`${attr.action('hello', 'greet')}`).toBe('data-action="hello#greet"')
  })

  it('event+method descriptor', () => {
    expect(`${attr.action('hello', 'greet', 'click')}`).toBe(
      'data-action="click->hello#greet"',
    )
  })

  it('appends options in canonical order', () => {
    expect(
      `${attr.action('hello', 'submit', 'submit', { stop: true, prevent: true })}`,
    ).toBe('data-action="submit->hello#submit:prevent:stop"')
  })

  it('keydown.enter notation', () => {
    expect(`${attr.action('hello', 'onKey', 'keydown.enter')}`).toBe(
      'data-action="keydown.enter->hello#onKey"',
    )
  })

  it('normalizes path-like identifier', () => {
    expect(`${attr.action('MyApp/MyController', 'greet', 'click')}`).toBe(
      'data-action="click->myapp--mycontroller#greet"',
    )
  })

  it('throws on missing args', () => {
    expect(() => attr.action('', 'x')).toThrow()
    expect(() => attr.action('hello', '')).toThrow()
  })
})

describe('AttrSpec behaviour', () => {
  it('typeof is object (documented)', () => {
    expect(typeof attr.controller('hello')).toBe('object')
  })

  it('String() coerces via toString', () => {
    expect(String(attr.controller('hello'))).toBe('data-controller="hello"')
  })

  it('JSON.stringify uses toJSON', () => {
    const json = JSON.stringify(attr.controller('hello'))
    expect(json).toBe('"data-controller=\\"hello\\""')
  })

  it('+ string concatenation works via toPrimitive', () => {
    const s: string = 'X ' + attr.controller('hello')
    expect(s).toBe('X data-controller="hello"')
  })
})

describe('attr.combine', () => {
  it('merges two controllers onto one element', () => {
    const out = `${attr.combine(
      attr.controller('hello', { greeting: 'Hi' }),
      attr.controller('tooltip', { text: 'Hey' }),
    )}`
    expect(out).toContain('data-controller="hello tooltip"')
    expect(out).toContain('data-hello-greeting-value="Hi"')
    expect(out).toContain('data-tooltip-text-value="Hey"')
  })

  it('merges multiple actions into a single data-action', () => {
    const out = `${attr.combine(
      attr.action('hello', 'greet', 'click'),
      attr.action('hello', 'reset', 'dblclick'),
    )}`
    expect(out).toBe('data-action="click->hello#greet dblclick->hello#reset"')
  })

  it('mixed controller + target + action', () => {
    const out = `${attr.combine(
      attr.controller('modal'),
      attr.target('parent', 'slot'),
      attr.action('modal', 'open', 'click'),
    )}`
    expect(out).toContain('data-controller="modal"')
    expect(out).toContain('data-parent-target="slot"')
    expect(out).toContain('data-action="click->modal#open"')
  })

  it('is recursive: attr.combine(a, attr.combine(b, c))', () => {
    const inner = attr.combine(attr.controller('b'), attr.controller('c'))
    const outer = attr.combine(attr.controller('a'), inner)
    expect(`${outer}`).toContain('data-controller="a b c"')
  })

  it('throws on duplicate controller identifier', () => {
    expect(() =>
      attr.combine(attr.controller('hello'), attr.controller('hello', { foo: 1 })),
    ).toThrow(/duplicate Stimulus controller identifier "hello"/)
  })

  it('throws on non-AttrSpec argument', () => {
    // @ts-expect-error — runtime guard
    expect(() => attr.combine('data-controller="x"')).toThrow(/AttrSpec/)
  })

  it('empty attr.combine() is valid and renders nothing', () => {
    expect(`${attr.combine()}`).toBe('')
  })

  it('de-duplicates target names across specs on same identifier', () => {
    const out = `${attr.combine(attr.target('x', 'a'), attr.target('x', 'a', 'b'))}`
    expect(out).toBe('data-x-target="a b"')
  })
})
