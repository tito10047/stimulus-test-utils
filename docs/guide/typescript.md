# TypeScript

`@tito10047/stimulus-test-utils` is written in TypeScript and ships `.d.ts` files alongside its ESM build. Every public function is strongly typed; `render()` is generic in your controller class.

## Zero-config usage

No type annotations needed — `render()` infers the controller type from the constructor you pass:

```ts
import { render } from '@tito10047/stimulus-test-utils'
import HelloController from './hello_controller'

const { controller } = await render(HelloController, { html: '…' })

controller.greetingValue  // string
controller.nameTarget     // HTMLInputElement
controller.outputTargets  // HTMLElement[]
```

The inference works as long as the controller declares its targets and values properly. The standard pattern is:

```ts
import { Controller } from '@hotwired/stimulus'

export default class HelloController extends Controller {
  static targets = ['name', 'output']
  static values = { greeting: String }

  declare readonly nameTarget: HTMLInputElement
  declare readonly outputTarget: HTMLElement
  declare readonly hasOutputTarget: boolean
  declare greetingValue: string

  greet() { /* … */ }
}
```

## Public types

All types are exported from the root entry:

```ts
import type {
  RenderOptions,
  RenderResult,
  UserEvent,
  WaitForOptions,
  QueryHelpers,
  ControllerConstructor,
  AttrSpec,
  StimulusActionOptions,
} from '@tito10047/stimulus-test-utils'
```

### `RenderOptions`

```ts
interface RenderOptions {
  html: string | HTMLElement
  identifier?: string
  controllers?: Record<string, ControllerConstructor>
  application?: Application
  container?: HTMLElement
}
```

### `RenderResult<T>`

Generic in your controller class:

```ts
interface RenderResult<T extends Controller> {
  controller: T
  element: HTMLElement
  application: Application
  user: UserEvent
  waitFor: (cb: () => void | Promise<void>, opts?: WaitForOptions) => Promise<void>
  rerender: (options: Pick<RenderOptions, 'html'>) => Promise<void>
  unmount: () => void
  // plus QueryHelpers — see below
}
```

### `QueryHelpers`

The full set of scoped query functions returned in `RenderResult`:

```ts
interface QueryHelpers {
  getByRole:       (role: string, options?: ByRoleOptions) => HTMLElement
  queryByRole:     (role: string, options?: ByRoleOptions) => HTMLElement | null
  findByRole:      (role: string, options?: ByRoleOptions) => Promise<HTMLElement>
  getAllByRole:    (role: string, options?: ByRoleOptions) => HTMLElement[]
  // … getByText, queryByText, findByText, getAllByText
  // … getByLabelText, queryByLabelText, findByLabelText
  // … getByTestId, queryByTestId, findByTestId, getAllByTestId
}
```

### `ControllerConstructor`

The expected shape for `options.controllers` values:

```ts
type ControllerConstructor<T extends Controller = Controller> = {
  new (...args: never[]): T
}
```

## Typed fixtures with helpers

The helpers are fully typed too. `stimulusController` widens its `values` parameter to accept anything `JSON.stringify`-able, and `stimulusAction` type-checks its `options`:

```ts
import { stimulusController, stimulusAction } from '@tito10047/stimulus-test-utils'

stimulusController('hello', {
  greeting: 'Hi',       // string
  count: 3,             // number
  active: true,         // boolean
  user: { name: 'Ada' } // object — JSON.stringify-ed
})

stimulusAction('hello', 'submit', 'submit', {
  prevent: true,
  // @ts-expect-error: typo surfaces at compile time
  prevenr: true,
})
```

## Extending `RenderResult` with generics

Passing a typed controller parametrizes the whole result, including the controller instance:

```ts
import type { RenderResult } from '@tito10047/stimulus-test-utils'
import HelloController from './hello_controller'

async function renderHello(): Promise<RenderResult<HelloController>> {
  return render(HelloController, { html: /* … */ })
}
```

You can wrap this pattern in factory helpers for controllers you render in many tests.

## `tsconfig` recommendations

Nothing special is required, but these settings make tests safer:

```jsonc
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,    // catches e.g. array[0] possibly undefined
    "exactOptionalPropertyTypes": true,  // RenderOptions are pickier
    "moduleResolution": "Bundler",
    "types": ["vitest/globals"]          // if you use globals: true in vitest config
  }
}
```

## Importing from the `/register` entry

The side-effect module has no typed exports — you `import` it purely for its side effect:

```ts
import '@tito10047/stimulus-test-utils/register'
```

TypeScript users can safely list it in `vitest.config.ts`'s `setupFiles`; no declaration is needed.

Next: [Troubleshooting](./troubleshooting.md).
