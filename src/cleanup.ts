import type { Application } from '@hotwired/stimulus'

/**
 * Module-level registry of everything `render()` has created so that
 * `cleanup()` (or an individual `unmount()`) can tear it all down between
 * tests, leaving the DOM and Stimulus registry pristine.
 */

export interface MountedFixture {
  application: Application
  /** DOM nodes that `render()` inserted into the container. */
  nodes: Element[]
  /** Was the Stimulus Application created by us (vs. BYO)? */
  ownsApplication: boolean
  /** Mark destroyed so double-unmount is a no-op. */
  destroyed: boolean
}

const registry = new Set<MountedFixture>()

export function registerFixture(fx: MountedFixture): void {
  registry.add(fx)
}

export function destroyFixture(fx: MountedFixture): void {
  if (fx.destroyed) return
  fx.destroyed = true
  for (const node of fx.nodes) {
    if (node.parentNode) node.parentNode.removeChild(node)
  }
  if (fx.ownsApplication) {
    try {
      fx.application.stop()
    } catch {
      // best-effort: ignore teardown errors so cleanup keeps going
    }
  }
  registry.delete(fx)
}

export function cleanup(): void {
  for (const fx of Array.from(registry)) {
    destroyFixture(fx)
  }
  registry.clear()
}

/** Test helper — internal only. */
export function _registrySize(): number {
  return registry.size
}
