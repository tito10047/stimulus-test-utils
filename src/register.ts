/**
 * Side-effect entry: auto-wires `afterEach(cleanup)` in Vitest.
 * Enable via `setupFiles: ['@tito10047/stimulus-test-utils/register']`.
 *
 * If no test runner global `afterEach` is found, this file is a no-op — users
 * can still call `cleanup()` manually from their own setup.
 */
import { cleanup } from './cleanup.js'

type HookFn = (cb: () => void | Promise<void>) => void

const g = globalThis as unknown as { afterEach?: HookFn }
if (typeof g.afterEach === 'function') {
  g.afterEach(() => {
    cleanup()
  })
}
