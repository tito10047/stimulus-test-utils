# Testing Stimulus in Symfony AssetMapper projects

Symfony [AssetMapper](https://symfony.com/doc/current/frontend/asset_mapper.html) is a zero-build alternative to Webpack Encore / Vite: JavaScript is served directly to the browser through an `importmap.php`, and third-party packages are vendored into `assets/vendor/` instead of being installed into `node_modules/`.

That model is perfect for production — but JavaScript test runners (Vitest, Jest, `node --test`) still read dependencies from `node_modules/`. This page describes two setups that make `@tito10047/stimulus-test-utils` work cleanly in an AssetMapper project.

## TL;DR — does this library work with AssetMapper?

**Yes**, with no hard dependency conflicts.

- `@tito10047/stimulus-test-utils` is a pure, side-effect-free ESM package.
- Its only runtime peer dependency is `@hotwired/stimulus` — the exact package AssetMapper already uses.
- It does **not** require a bundler, a build step, or any AssetMapper-specific tooling.

The only thing AssetMapper does *not* give you out of the box is a populated `node_modules/` directory for the test runner to read. That is a tooling question, not a compatibility question, and it has two good answers below.

## The setup — two options

### Option 1 — Vitest with dev-only `node_modules` (recommended)

This is the setup used by most AssetMapper projects that want to run Stimulus tests. Keep AssetMapper doing its job in production, and add a minimal `package.json` purely for testing.

1. Create a `package.json` in your project root (if you don't already have one):

```json
{
  "type": "module",
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run"
  },
  "devDependencies": {
    "@hotwired/stimulus": "^3.2",
    "@tito10047/stimulus-test-utils": "^0.1",
    "happy-dom": "^15",
    "vitest": "^2"
  }
}
```

2. Install the dev dependencies:

```bash
npm install
```

3. Add `vitest.config.ts` (or `.mjs`) at the project root:

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'happy-dom',
    setupFiles: ['@tito10047/stimulus-test-utils/register'],
    include: ['assets/controllers/**/*.test.{js,ts,mjs}'],
  },
})
```

4. Write a test next to your controller — `assets/controllers/hello_controller.test.js`:

```js
import { render, stimulusController, stimulusTarget, stimulusAction } from '@tito10047/stimulus-test-utils'
import { expect, test } from 'vitest'
import HelloController from './hello_controller.js'

test('greets by name', async () => {
  const { controller, user, element, getByRole } = await render(HelloController, {
    html: `
      <div ${stimulusController('hello', { greeting: 'Hi' })}>
        <input ${stimulusTarget('hello', 'name')} />
        <button ${stimulusAction('hello', 'greet', 'click')}>Greet</button>
        <span ${stimulusTarget('hello', 'output')}></span>
      </div>
    `,
  })

  await user.type(element.querySelector('input'), 'Ada')
  await user.click(getByRole('button', { name: 'Greet' }))

  expect(controller.outputTarget.textContent).toBe('Hi, Ada!')
})
```

5. Run:

```bash
npm test
```

::: tip Why a duplicate `@hotwired/stimulus`?
Your production code loads Stimulus via AssetMapper's `importmap.php`, from `assets/vendor/@hotwired/stimulus/`. The test runner loads Stimulus from `node_modules/@hotwired/stimulus/`. They are the same package, the same version — just resolved differently because Vitest runs in Node, not in the browser. Pin both to the same version in `importmap.php` and `package.json` and you are done.
:::

#### Sub-folder controllers

If you follow the Symfony UX / AssetMapper convention of sub-folder controllers (e.g. `assets/controllers/Users/List_controller.js` → identifier `users--list`), pass the path directly to the helpers and they will normalize it for you:

```js
stimulusController('Users/List_controller.js', { page: 1 })
// => data-controller="users--list" data-users--list-page-value="1"
```

See the [Attribute helpers guide](./attribute-helpers.md#sub-folder-controllers-path-style-identifiers) for the full rules.

### Option 2 — `node --test` with `asset-mapper-test-bundle`

If you want to avoid `node_modules/` for your application dependencies entirely — and rely on the packages AssetMapper has already vendored into `assets/vendor/` — use [`tito10047/asset-mapper-test-bundle`](https://github.com/tito10047/asset-mapper-test-bundle). It reads your `importmap.php` and symlinks every AssetMapper package into `node_modules/` so Node's resolver can find them.

This is the original use case that motivated `stimulus-test-utils`.

1. Install the bundle:

```bash
composer require tito10047/asset-mapper-test-bundle
```

The bundle is auto-discovered by Symfony Flex.

2. Add `@tito10047/stimulus-test-utils` to your `importmap.php`:

```bash
php bin/console importmap:require @tito10047/stimulus-test-utils
```

3. Create `package.json` with the `pretest` hook the bundle expects:

```json
{
  "type": "module",
  "scripts": {
    "test": "node --test tests/js/*.test.mjs",
    "test:watch": "node --watch --test tests/js/*.test.mjs",
    "pretest": "php bin/console asset-mapper-test:setup",
    "setup-js": "php bin/console asset-mapper-test:setup"
  }
}
```

`pretest` runs the bundle's setup command before every `npm test`, re-creating symlinks in `node_modules/` from `importmap.php`. You do **not** run `npm install` — there is no `dependencies` block.

4. Add a DOM polyfill. Node's native test runner has no DOM. `stimulus-test-utils` needs one. You have two choices:

   **a)** Add `happy-dom` to `importmap.php` too (it is published to npm, so AssetMapper can vendor it):

   ```bash
   php bin/console importmap:require happy-dom
   ```

   Then register it at the top of each test file:

   ```js
   // tests/js/setup.mjs
   import { Window } from 'happy-dom'
   const window = new Window()
   globalThis.window = window
   globalThis.document = window.document
   globalThis.HTMLElement = window.HTMLElement
   globalThis.Event = window.Event
   // …plus any other globals your controllers touch
   ```

   ```js
   // tests/js/hello.test.mjs
   import './setup.mjs'
   import { test } from 'node:test'
   import assert from 'node:assert/strict'
   import { render, cleanup } from '@tito10047/stimulus-test-utils'
   import HelloController from '../../assets/controllers/hello_controller.js'

   test('greets by name', async (t) => {
     t.after(cleanup)

     const { controller, user, element, getByRole } = await render(HelloController, {
       html: `<div data-controller="hello" data-hello-greeting-value="Hi">
         <input data-hello-target="name" />
         <button data-action="click->hello#greet">Greet</button>
         <span data-hello-target="output"></span>
       </div>`,
     })

     await user.type(element.querySelector('input'), 'Ada')
     await user.click(getByRole('button', { name: 'Greet' }))

     assert.equal(controller.outputTarget.textContent, 'Hi, Ada!')
   })
   ```

   **b)** If you prefer Vitest's ergonomics (watch mode, snapshot, richer assertions) but still want AssetMapper to own the dependency graph, combine both: use `asset-mapper-test-bundle` for symlinks *and* `vitest` as the runner. In that case `vitest` itself still has to be in `node_modules/` — so you end up with a very small `devDependencies` block in `package.json` just for the runner:

   ```json
   {
     "type": "module",
     "scripts": {
       "pretest": "php bin/console asset-mapper-test:setup",
       "test": "vitest run"
     },
     "devDependencies": {
       "vitest": "^2",
       "happy-dom": "^15"
     }
   }
   ```

   Everything your controllers import (`@hotwired/stimulus`, `@tito10047/stimulus-test-utils`, application code) comes from AssetMapper symlinks; only the test runner itself is a dev dependency. This is a clean middle ground.

## Compatibility notes

- **No hard dependencies on Node-only APIs.** The library uses only standard DOM and Stimulus APIs, so it runs anywhere a DOM exists — happy-dom, jsdom, or a real browser via Playwright.
- **No CommonJS.** `dist/` is pure ESM with `.d.ts`. AssetMapper serves ESM natively; `node --test` requires `"type": "module"` in `package.json` (already covered above).
- **No bundler-specific syntax.** You can point an `importmap` entry at `node_modules/@tito10047/stimulus-test-utils/dist/index.js` (after the symlink) and it will run untouched.
- **Peer dependency only.** `@hotwired/stimulus` is declared as a peer dependency, so there is no version drift between your production runtime and your tests as long as `importmap.php` and `package.json` stay in sync.

## Which option should I pick?

| Your situation | Pick |
|---|---|
| You already use Webpack Encore / Vite and are migrating to AssetMapper — or you are fine with a `node_modules/` during development. | **Option 1** (Vitest + devDeps). Least friction, best DX. |
| You want a single source of truth (`importmap.php`) for every JS package, including test-only ones, and run tests with `node --test`. | **Option 2a** (bundle + `node --test`). |
| You want `importmap.php` to own the dependency graph but still want Vitest's ergonomics. | **Option 2b** (bundle + Vitest runner only). |

All three are fully supported — pick the one that matches your team's philosophy.

## See also

- [`asset-mapper-test-bundle` on GitHub](https://github.com/tito10047/asset-mapper-test-bundle) — the Symfony bundle that symlinks `importmap.php` packages into `node_modules/`.
- [Getting Started](./getting-started.md) — the standard Vitest setup.
- [Attribute helpers](./attribute-helpers.md) — typo-safe `data-*` fixtures, with first-class support for sub-folder controller identifiers (`Users/List_controller.js` → `users--list`).
