/**
 * HTML attribute helpers producing AttrSpec objects that serialize
 * transparently inside template literals via Symbol.toPrimitive.
 *
 * Design notes:
 * - Every helper returns an AttrSpec — a structured description of the
 *   attributes it contributes. `combine()` merges specs by reading the
 *   structured data, not by parsing strings.
 * - `toString()` is the single point of serialization (HTML‑escaping,
 *   kebab‑case conversion, JSON encoding of complex values).
 */

import { normalizeIdentifier } from './identifier.js'
import { toKebabCase, escapeAttr } from './utils.js'
export { toKebabCase, escapeAttr } from './utils.js'

export interface AttrSpec {
  toString(): string
  toJSON(): string
  [Symbol.toPrimitive](hint: string): string
}

/** Internal structured representation. Not exported. */
interface AttrData {
  /** Ordered unique controller identifiers (data-controller tokens). */
  controllers: string[]
  /** Raw `data-action` descriptors in declaration order. */
  actions: string[]
  /** Values keyed by "<identifier>-<kebab-key>". */
  values: Map<string, unknown>
  /** Classes keyed by "<identifier>-<kebab-key>". */
  classes: Map<string, string>
  /** Outlets keyed by "<identifier>-<kebab-key>". */
  outlets: Map<string, string>
  /** Targets keyed by identifier → ordered unique target names. */
  targets: Map<string, string[]>
}

const SPEC_DATA = Symbol('stimulus-test-utils:attrData')

function createSpec(data: AttrData): AttrSpec {
  const spec = {
    [SPEC_DATA]: data,
    toString(): string {
      return serialize(data)
    },
    toJSON(): string {
      return serialize(data)
    },
    [Symbol.toPrimitive](_hint: string): string {
      return serialize(data)
    },
  }
  return spec as unknown as AttrSpec
}

function getData(spec: AttrSpec): AttrData | undefined {
  return (spec as unknown as { [SPEC_DATA]?: AttrData })[SPEC_DATA]
}

function emptyData(): AttrData {
  return {
    controllers: [],
    actions: [],
    values: new Map(),
    classes: new Map(),
    outlets: new Map(),
    targets: new Map(),
  }
}


function serializeValue(raw: unknown): string {
  if (raw === null) return 'null'
  switch (typeof raw) {
    case 'string':
      return raw
    case 'number':
    case 'boolean':
      return String(raw)
    default:
      return JSON.stringify(raw)
  }
}

function serialize(data: AttrData): string {
  const parts: string[] = []

  if (data.controllers.length > 0) {
    parts.push(`data-controller="${escapeAttr(data.controllers.join(' '))}"`)
  }

  for (const [identifier, names] of data.targets) {
    parts.push(`data-${identifier}-target="${escapeAttr(names.join(' '))}"`)
  }

  for (const [key, raw] of data.values) {
    parts.push(`data-${key}-value="${escapeAttr(serializeValue(raw))}"`)
  }
  for (const [key, raw] of data.classes) {
    parts.push(`data-${key}-class="${escapeAttr(raw)}"`)
  }
  for (const [key, raw] of data.outlets) {
    parts.push(`data-${key}-outlet="${escapeAttr(raw)}"`)
  }

  if (data.actions.length > 0) {
    parts.push(`data-action="${escapeAttr(data.actions.join(' '))}"`)
  }

  return parts.join(' ')
}

export function stimulusController(
  identifier: string,
  values?: Record<string, unknown>,
  classes?: Record<string, string>,
  outlets?: Record<string, string>,
): AttrSpec {
  if (!identifier || typeof identifier !== 'string') {
    throw new TypeError(`stimulusController(): identifier must be a non-empty string, got ${String(identifier)}`)
  }
  identifier = normalizeIdentifier(identifier)
  const data = emptyData()
  data.controllers.push(identifier)
  if (values) {
    for (const [k, v] of Object.entries(values)) {
      data.values.set(`${identifier}-${toKebabCase(k)}`, v)
    }
  }
  if (classes) {
    for (const [k, v] of Object.entries(classes)) {
      data.classes.set(`${identifier}-${toKebabCase(k)}`, v)
    }
  }
  if (outlets) {
    for (const [k, v] of Object.entries(outlets)) {
      data.outlets.set(`${identifier}-${toKebabCase(k)}`, v)
    }
  }
  return createSpec(data)
}

export function stimulusTarget(identifier: string, ...targetNames: string[]): AttrSpec {
  if (!identifier) throw new TypeError('stimulusTarget(): identifier is required')
  if (targetNames.length === 0) throw new TypeError('stimulusTarget(): at least one target name is required')
  identifier = normalizeIdentifier(identifier)
  const data = emptyData()
  const unique: string[] = []
  for (const n of targetNames) {
    if (!unique.includes(n)) unique.push(n)
  }
  data.targets.set(identifier, unique)
  return createSpec(data)
}

export interface StimulusActionOptions {
  prevent?: boolean
  stop?: boolean
  once?: boolean
  passive?: boolean
  capture?: boolean
  self?: boolean
}

const ACTION_OPTION_ORDER: (keyof StimulusActionOptions)[] = [
  'prevent',
  'stop',
  'once',
  'passive',
  'capture',
  'self',
]

export function stimulusAction(
  identifier: string,
  method: string,
  event?: string,
  options?: StimulusActionOptions,
): AttrSpec {
  if (!identifier) throw new TypeError('stimulusAction(): identifier is required')
  if (!method) throw new TypeError('stimulusAction(): method is required')
  identifier = normalizeIdentifier(identifier)

  const base = event ? `${event}->${identifier}#${method}` : `${identifier}#${method}`
  let descriptor = base
  if (options) {
    for (const key of ACTION_OPTION_ORDER) {
      if (options[key]) descriptor += `:${key}`
    }
  }
  const data = emptyData()
  data.actions.push(descriptor)
  return createSpec(data)
}

/**
 * Merge multiple AttrSpecs onto a single element.
 * Throws on duplicate controller identifier.
 */
export function combine(...specs: AttrSpec[]): AttrSpec {
  const merged = emptyData()

  for (const spec of specs) {
    const d = getData(spec)
    if (!d) {
      throw new TypeError('combine(): all arguments must be AttrSpec values returned from stimulus* helpers')
    }

    for (const id of d.controllers) {
      if (merged.controllers.includes(id)) {
        throw new Error(
          `combine(): duplicate Stimulus controller identifier "${id}". ` +
            `Declare each controller once and pass all its values/classes/outlets in a single stimulusController() call.`,
        )
      }
      merged.controllers.push(id)
    }

    for (const [id, names] of d.targets) {
      const existing = merged.targets.get(id) ?? []
      for (const n of names) if (!existing.includes(n)) existing.push(n)
      merged.targets.set(id, existing)
    }

    for (const [k, v] of d.values) merged.values.set(k, v)
    for (const [k, v] of d.classes) merged.classes.set(k, v)
    for (const [k, v] of d.outlets) merged.outlets.set(k, v)
    for (const a of d.actions) merged.actions.push(a)
  }

  return createSpec(merged)
}

/**
 * Grouped attribute helpers.
 */
export const attr = {
  controller: stimulusController,
  target: stimulusTarget,
  action: stimulusAction,
  combine,
}
