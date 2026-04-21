import { describe, expect, it } from 'vitest'
import { waitFor, nextTick } from '../src/index.js'

describe('nextTick', () => {
  it('resolves after a microtask and macrotask', async () => {
    let flag = false
    setTimeout(() => {
      flag = true
    }, 0)
    await nextTick()
    expect(flag).toBe(true)
  })
})

describe('waitFor', () => {
  it('returns the callback result when it succeeds immediately', async () => {
    const result = await waitFor(() => 42)
    expect(result).toBe(42)
  })

  it('polls until the callback stops throwing', async () => {
    let attempts = 0
    const result = await waitFor(() => {
      attempts++
      if (attempts < 3) throw new Error('nope')
      return 'ok'
    }, { interval: 5, timeout: 500 })
    expect(result).toBe('ok')
    expect(attempts).toBe(3)
  })

  it('re-throws the last error on timeout', async () => {
    await expect(
      waitFor(
        () => {
          throw new Error('persistent failure')
        },
        { timeout: 50, interval: 10 },
      ),
    ).rejects.toThrow(/persistent failure/)
  })

  it('supports async callbacks', async () => {
    const result = await waitFor(async () => 'async-ok')
    expect(result).toBe('async-ok')
  })

  it('throws a generic timeout error when callback rejects with a non-Error', async () => {
    await expect(
      waitFor(
        () => {
          // eslint-disable-next-line @typescript-eslint/no-throw-literal
          throw 'string error'
        },
        { timeout: 30, interval: 5 },
      ),
    ).rejects.toThrow(/timed out|string error/)
  })
})
