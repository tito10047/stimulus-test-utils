import { waitFor } from './wait-for.js'
import type { QueryHelpers, WaitForOptions } from './types.js'

/**
 * Scoped, Testing-Library-flavoured query helpers. The container is the
 * fixture root returned by `render()`; every helper searches inside it
 * (including itself for text/role match on root).
 */

function textMatches(actual: string, expected: string | RegExp): boolean {
  const normalized = actual.replace(/\s+/g, ' ').trim()
  if (typeof expected === 'string') return normalized === expected
  return expected.test(normalized)
}

/* ------------------------------- TestId ------------------------------- */

function allByTestId(root: ParentNode, id: string): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(`[data-testid="${CSS.escape(id)}"]`))
}

/* -------------------------------- Role -------------------------------- */

const IMPLICIT_ROLES: Record<string, string> = {
  BUTTON: 'button',
  A: 'link', // only when [href] — handled below
  INPUT: 'textbox', // overridden by type
  TEXTAREA: 'textbox',
  SELECT: 'combobox',
  FORM: 'form',
  NAV: 'navigation',
  MAIN: 'main',
  HEADER: 'banner',
  FOOTER: 'contentinfo',
  H1: 'heading',
  H2: 'heading',
  H3: 'heading',
  H4: 'heading',
  H5: 'heading',
  H6: 'heading',
  UL: 'list',
  OL: 'list',
  LI: 'listitem',
  TABLE: 'table',
  IMG: 'img',
  DIALOG: 'dialog',
}

const INPUT_TYPE_ROLES: Record<string, string> = {
  button: 'button',
  submit: 'button',
  reset: 'button',
  checkbox: 'checkbox',
  radio: 'radio',
  range: 'slider',
  search: 'searchbox',
  email: 'textbox',
  tel: 'textbox',
  url: 'textbox',
  text: 'textbox',
  number: 'spinbutton',
  password: 'textbox',
}

function implicitRole(el: Element): string | null {
  const explicit = el.getAttribute('role')
  if (explicit) return explicit
  const tag = el.tagName
  if (tag === 'A') {
    return (el as HTMLAnchorElement).hasAttribute('href') ? 'link' : null
  }
  if (tag === 'INPUT') {
    const type = (el as HTMLInputElement).type || 'text'
    return INPUT_TYPE_ROLES[type] ?? 'textbox'
  }
  return IMPLICIT_ROLES[tag] ?? null
}

function accessibleName(el: Element): string {
  const aria = el.getAttribute('aria-label')
  if (aria) return aria.trim()
  const labelledBy = el.getAttribute('aria-labelledby')
  if (labelledBy) {
    const refs = labelledBy
      .split(/\s+/)
      .map((id) => document.getElementById(id))
      .filter((n): n is HTMLElement => !!n)
    if (refs.length > 0) return refs.map((r) => (r.textContent || '').trim()).join(' ').trim()
  }
  if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) {
    const id = el.id
    if (id) {
      const lbl = el.ownerDocument.querySelector<HTMLLabelElement>(`label[for="${CSS.escape(id)}"]`)
      if (lbl) return (lbl.textContent || '').trim()
    }
    const wrapping = el.closest('label')
    if (wrapping) return (wrapping.textContent || '').trim()
    if (el instanceof HTMLInputElement && el.type === 'submit') return el.value || ''
  }
  return (el.textContent || '').replace(/\s+/g, ' ').trim()
}

function allByRole(
  root: ParentNode,
  role: string,
  opts: { name?: string | RegExp } = {},
): HTMLElement[] {
  const candidates = Array.from(root.querySelectorAll<HTMLElement>('*'))
  return candidates.filter((el) => {
    if (implicitRole(el) !== role) return false
    if (opts.name !== undefined) {
      const name = accessibleName(el)
      return textMatches(name, opts.name)
    }
    return true
  })
}

/* -------------------------------- Text -------------------------------- */

function allByText(root: ParentNode, text: string | RegExp): HTMLElement[] {
  const result: HTMLElement[] = []
  const els = root.querySelectorAll<HTMLElement>('*')
  for (const el of els) {
    // Only leaf-ish text nodes — skip if a descendant already matches.
    const ownText = Array.from(el.childNodes)
      .filter((n) => n.nodeType === 3)
      .map((n) => n.textContent || '')
      .join('')
    if (textMatches(ownText, text)) result.push(el)
  }
  return result
}

/* ------------------------------ LabelText ----------------------------- */

function allByLabelText(root: ParentNode, text: string | RegExp): HTMLElement[] {
  const labels = Array.from(root.querySelectorAll<HTMLLabelElement>('label'))
  const result: HTMLElement[] = []
  for (const lbl of labels) {
    if (!textMatches(lbl.textContent || '', text)) continue
    const forId = lbl.getAttribute('for')
    if (forId) {
      const target = root.querySelector<HTMLElement>(`#${CSS.escape(forId)}`)
      if (target) result.push(target)
    } else {
      const nested = lbl.querySelector<HTMLElement>('input, textarea, select')
      if (nested) result.push(nested)
    }
  }
  return result
}

/* ------------------------------- Factory ------------------------------ */

function singleOrThrow<T>(arr: T[], label: string): T {
  if (arr.length === 0) throw new Error(`${label}: no element found`)
  if (arr.length > 1) throw new Error(`${label}: expected one element, found ${arr.length}`)
  return arr[0]!
}

export function createQueries(root: HTMLElement): QueryHelpers {
  return {
    getByTestId: (id) => singleOrThrow(allByTestId(root, id), `getByTestId("${id}")`),
    queryByTestId: (id) => allByTestId(root, id)[0] ?? null,
    getAllByTestId: (id) => {
      const all = allByTestId(root, id)
      if (all.length === 0) throw new Error(`getAllByTestId("${id}"): no element found`)
      return all
    },
    findByTestId: (id, opts?: WaitForOptions) =>
      waitFor(() => singleOrThrow(allByTestId(root, id), `findByTestId("${id}")`), opts),

    getByRole: (role, opts) =>
      singleOrThrow(allByRole(root, role, opts), `getByRole("${role}")`),
    queryByRole: (role, opts) => allByRole(root, role, opts)[0] ?? null,
    getAllByRole: (role, opts) => {
      const all = allByRole(root, role, opts)
      if (all.length === 0) throw new Error(`getAllByRole("${role}"): no element found`)
      return all
    },
    findByRole: (role, opts) =>
      waitFor(() => singleOrThrow(allByRole(root, role, opts), `findByRole("${role}")`), opts),

    getByText: (t) => singleOrThrow(allByText(root, t), `getByText(${String(t)})`),
    queryByText: (t) => allByText(root, t)[0] ?? null,
    getAllByText: (t) => {
      const all = allByText(root, t)
      if (all.length === 0) throw new Error(`getAllByText(${String(t)}): no element found`)
      return all
    },
    findByText: (t, opts) => waitFor(() => singleOrThrow(allByText(root, t), `findByText(${String(t)})`), opts),

    getByLabelText: (t) => singleOrThrow(allByLabelText(root, t), `getByLabelText(${String(t)})`),
    queryByLabelText: (t) => allByLabelText(root, t)[0] ?? null,
    findByLabelText: (t, opts) =>
      waitFor(() => singleOrThrow(allByLabelText(root, t), `findByLabelText(${String(t)})`), opts),
  }
}
