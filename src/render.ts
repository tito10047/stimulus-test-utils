import { Application, Controller } from '@hotwired/stimulus'
import type { ControllerConstructor, RenderOptions, RenderResult } from './types.js'
import { createUserEvent } from './user-event.js'
import { createQueries } from './queries.js'
import { nextTick, waitFor } from './wait-for.js'
import { destroyFixture, registerFixture, type MountedFixture } from './cleanup.js'
import { normalizeIdentifier } from './identifier.js'

/**
 * Infer a Stimulus identifier from a controller class name.
 *   HelloController       → "hello"
 *   HelloWorldController  → "helloworld"
 *   APIController         → "api"
 *   Anonymous / minified  → throws (caller must pass options.identifier)
 *
 * The rule mirrors Symfony UX / Asset Mapper behaviour: the class name is
 * lowercased as a whole (CamelCase is NOT split with dashes). If you want a
 * hyphenated identifier, pass `options.identifier` explicitly.
 */
export function inferIdentifier(ctor: ControllerConstructor): string {
  const name = ctor.name
  if (!name || name.length < 2) {
    throw new Error(
      'render(): could not infer Stimulus identifier from an anonymous or single-character class. ' +
        'Pass options.identifier explicitly.',
    )
  }
  const stripped = name.endsWith('Controller') ? name.slice(0, -'Controller'.length) : name
  if (!stripped) {
    throw new Error(
      `render(): class name "${name}" produces an empty identifier. ` +
        'Pass options.identifier explicitly.',
    )
  }
  return stripped.toLowerCase()
}

function parseHtml(html: string): Element[] {
  const template = document.createElement('template')
  template.innerHTML = html.trim()
  return Array.from(template.content.children)
}

function findControllerRoot(container: ParentNode, identifier: string): HTMLElement | null {
  // CSS.escape on the identifier for safety.
  return container.querySelector<HTMLElement>(`[data-controller~="${CSS.escape(identifier)}"]`)
}

async function waitForController<C extends Controller>(
  application: Application,
  element: HTMLElement,
  identifier: string,
  timeout = 1000,
): Promise<C> {
  return waitFor(
    () => {
      const instance = application.getControllerForElementAndIdentifier(element, identifier)
      if (!instance) throw new Error(`render(): controller "${identifier}" did not connect within ${timeout}ms`)
      return instance as unknown as C
    },
    { timeout, interval: 10 },
  )
}

export async function render<C extends Controller>(
  ControllerClass: new (...args: any[]) => C,
  options: RenderOptions,
): Promise<RenderResult<C>> {
  if (!ControllerClass) throw new TypeError('render(): ControllerClass is required')
  if (!options || options.html === undefined || options.html === null) {
    throw new TypeError('render(): options.html is required')
  }

  const identifier = options.identifier
    ? normalizeIdentifier(options.identifier)
    : inferIdentifier(ControllerClass as unknown as ControllerConstructor)
  const container = options.container ?? document.body

  // Insert fixture.
  const insertedNodes: Element[] = []
  if (typeof options.html === 'string') {
    for (const node of parseHtml(options.html)) {
      container.appendChild(node)
      insertedNodes.push(node)
    }
  } else {
    container.appendChild(options.html)
    insertedNodes.push(options.html)
  }

  // Boot or reuse Application.
  const ownsApplication = !options.application
  const application = options.application ?? Application.start()

  application.register(identifier, ControllerClass as unknown as ControllerConstructor)
  if (options.controllers) {
    for (const [id, ctor] of Object.entries(options.controllers)) {
      application.register(id, ctor)
    }
  }

  // Wait for MutationObserver to pick up the fixture + connect() to fire.
  await nextTick()

  const element =
    insertedNodes
      .map((n) => (n instanceof HTMLElement && n.matches(`[data-controller~="${CSS.escape(identifier)}"]`) ? n : null))
      .find((n): n is HTMLElement => !!n) ??
    findControllerRoot(container, identifier)
  if (!element) {
    throw new Error(
      `render(): no element with data-controller~="${identifier}" found in the mounted fixture. ` +
        'Check your HTML or pass options.identifier.',
    )
  }

  const controller = await waitForController<C>(application, element, identifier)

  const fixture: MountedFixture = {
    application,
    nodes: insertedNodes,
    ownsApplication,
    destroyed: false,
  }
  registerFixture(fixture)

  const user = createUserEvent()
  const queries = createQueries(element)

  const result: RenderResult<C> = {
    controller,
    element,
    application,
    user,
    waitFor,
    rerender: async (next) => {
      // Remove current inserted nodes, insert new.
      for (const n of insertedNodes) {
        if (n.parentNode) n.parentNode.removeChild(n)
      }
      insertedNodes.length = 0
      const newNodes =
        typeof next.html === 'string' ? parseHtml(next.html) : [next.html]
      for (const n of newNodes) {
        container.appendChild(n)
        insertedNodes.push(n)
      }
      fixture.nodes = insertedNodes
      await nextTick()
      const newElement = findControllerRoot(container, identifier)
      if (!newElement) {
        throw new Error(`rerender(): new fixture has no [data-controller~="${identifier}"]`)
      }
      const newCtrl = await waitForController<C>(application, newElement, identifier)
      // Mutate in-place so references stay stable.
      ;(result as { controller: C }).controller = newCtrl
      ;(result as { element: HTMLElement }).element = newElement
    },
    unmount: () => destroyFixture(fixture),
    ...queries,
  }

  return result
}
