# Mocking fetch

Controllers that call `fetch` should always be tested against a stubbed global so tests are deterministic and offline-safe.

## Happy path

```ts
import { vi } from 'vitest'
import { render, attr.controller, attr.target, attr.action } from '@tito10047/stimulus-test-utils'
import SearchController from '../src/search_controller.js'

test('renders results from a mocked fetch', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(
    new Response(JSON.stringify([
      { id: 1, name: 'Ada' },
      { id: 2, name: 'Grace' },
    ]), { status: 200 }),
  ))

  const { user, findByTestId, getByRole } = await render(SearchController, {
    html: `
      <div ${attr.controller('search', { url: '/api/search' })}>
        <input ${attr.target('search', 'query')} aria-label="query" />
        <button ${attr.action('search', 'submit', 'click')}>Search</button>
        <ul ${attr.target('search', 'results')}></ul>
      </div>
    `,
  })

  await user.type(getByRole('textbox', { name: 'query' }), 'ad')
  await user.click(getByRole('button', { name: 'Search' }))

  expect(await findByTestId('result-1')).toBeTruthy()

  vi.unstubAllGlobals()
})
```

## Error path

```ts
vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('boom')))

const { user, waitFor, element, getByRole } = await render(SearchController, { html })

await user.click(getByRole('button', { name: 'Go' }))

await waitFor(() => {
  expect(element.querySelector('[data-search-target="status"]')!.textContent).toContain('Error: boom')
})

vi.unstubAllGlobals()
```

## Asserting the request

`vi.fn()` records every call. Assert on URL, method, headers, body:

```ts
const fetchMock = vi.fn().mockResolvedValue(new Response('[]', { status: 200 }))
vi.stubGlobal('fetch', fetchMock)

// ... interact

expect(fetchMock).toHaveBeenCalledTimes(1)
const [url, init] = fetchMock.mock.calls[0]
expect(url).toBe('/api/search?q=ad')
expect(init?.method ?? 'GET').toBe('GET')
```

## Cleanup

Always restore globals, even on failure:

```ts
try {
  vi.stubGlobal('fetch', mock)
  // ... test
} finally {
  vi.unstubAllGlobals()
}
```

Or enable automatic restoration:

```ts
// vitest.config.ts
export default defineConfig({ test: { unstubGlobals: true } })
```
