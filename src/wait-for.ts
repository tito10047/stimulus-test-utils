import type { WaitForOptions } from './types.js'

/**
 * Flush microtasks + one macrotask tick so Stimulus' MutationObserver
 * observers and scheduled callbacks settle before the test continues.
 */
export async function nextTick(): Promise<void> {
  // Flush microtasks.
  await Promise.resolve()
  // Let MutationObserver / setTimeout(0) fire.
  await new Promise<void>((resolve) => setTimeout(resolve, 0))
  // Flush any microtasks queued by those callbacks.
  await Promise.resolve()
}

const DEFAULT_TIMEOUT = 1000
const DEFAULT_INTERVAL = 20

export async function waitFor<T>(
  callback: () => T | Promise<T>,
  options: WaitForOptions = {},
): Promise<T> {
  const timeout = options.timeout ?? DEFAULT_TIMEOUT
  const interval = options.interval ?? DEFAULT_INTERVAL
  const deadline = Date.now() + timeout

  let lastError: unknown
  // Initial attempt right away.
  while (true) {
    try {
      const result = await callback()
      return result
    } catch (err) {
      lastError = err
      if (Date.now() >= deadline) break
      await new Promise<void>((resolve) => setTimeout(resolve, interval))
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new Error(`waitFor: timed out after ${timeout}ms`)
}
