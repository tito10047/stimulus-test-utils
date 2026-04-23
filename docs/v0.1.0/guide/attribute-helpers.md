# Attribute helpers

Stimulus fixtures live and die by their `data-*` attributes. A typo in `data-hello-greetig-value` doesn't produce an error — it produces an *undefined* value at runtime and a confusing assertion failure three lines later. The attribute helpers produce those attributes for you, structured and escaped.

All helpers are **optional**. You can write plain `data-*` attributes and `render()` will work the same. Use the helpers when you want refactor-safety.

## Overview

```ts
import { attr } from '@tito10047/stimulus-test-utils'
```

| Helper | Produces |
|---|---|
| `attr.controller(id, values?, classes?, outlets?)` | `data-controller` + every `data-<id>-*-value`, `-*-class`, `-*-outlet` |
| `attr.target(id, ...names)` | `data-<id>-target="name1 name2 …"` |
| `attr.action(id, method, event?, options?)` | `data-action="event->id#method[:modifiers]"` |
| `attr.combine(...specs)` | Merges multiple specs onto one element |

Every helper returns an `AttrSpec` (not a raw string). `AttrSpec` serializes itself inside template literals — you never call `.toString()` manually:

```ts
`<div ${attr.controller('hello')}>`
// => '<div data-controller="hello">'
```

The only observable difference from a string: `typeof spec === 'object'`. If you need to pass the result to something that expects a `string`, use `String(spec)` or `` `${spec}` ``.

## `attr.controller`

```ts
function controller(
  identifier: string,
  values?: Record<string, string | number | boolean | object | null>,
  classes?: Record<string, string>,
  outlets?: Record<string, string>,
): AttrSpec
```

### Just the controller

```ts
attr.controller('hello')
// => data-controller="hello"
```

### Values

```ts
attr.controller('hello', { greeting: 'Hi', count: 3, active: true })
// => data-controller="hello"
//    data-hello-greeting-value="Hi"
//    data-hello-count-value="3"
//    data-hello-active-value="true"
```

Value rules:

- Keys are converted from `camelCase` / `snake_case` to `kebab-case` (`greetingMessage` → `greeting-message`).
- Non-string values are `JSON.stringify`-ed, matching Stimulus' own value coercion.
- HTML-sensitive characters in strings are escaped, so `'"'`, `<`, `>`, `&` are safe.

```ts
attr.controller('hello', { user: { name: 'Ada' } })
// => data-hello-user-value="{&quot;name&quot;:&quot;Ada&quot;}"
```

### Classes

```ts
attr.controller('modal', {}, { open: 'is-open', closed: 'is-closed' })
// => data-controller="modal"
//    data-modal-open-class="is-open"
//    data-modal-closed-class="is-closed"
```

### Outlets

```ts
attr.controller('modal', {}, {}, { dialog: "[data-controller~='dialog']" })
// => data-controller="modal"
//    data-modal-dialog-outlet="[data-controller~=&#39;dialog&#39;]"
```

One call = one controller. To put two controllers on one element, use `attr.combine()` (see below) — do **not** pass an array.

## `attr.target`

```ts
attr.target('hello', 'name')
// => data-hello-target="name"

attr.target('hello', 'name', 'output')
// => data-hello-target="name output"
```

Signature:

```ts
function attr.target(identifier: string, ...targetNames: string[]): AttrSpec
```

## `attr.action`

```ts
attr.action('hello', 'greet')
// => data-action="hello#greet"        (event inferred by Stimulus from element type)

attr.action('hello', 'greet', 'click')
// => data-action="click->hello#greet"

attr.action('hello', 'onKey', 'keydown.enter')
// => data-action="keydown.enter->hello#onKey"

attr.action('hello', 'submit', 'submit', { prevent: true, stop: true })
// => data-action="submit->hello#submit:prevent:stop"
```

Signature:

```ts
function attr.action(
  identifier: string,
  method: string,
  event?: string,
  options?: {
    prevent?: boolean
    stop?: boolean
    once?: boolean
    passive?: boolean
    capture?: boolean
    self?: boolean
  },
): AttrSpec
```

Each call produces exactly **one** `data-action` descriptor. To attach multiple actions to one element, wrap them with `attr.combine()`:

```ts
attr.combine(
  attr.action('hello', 'greet', 'click'),
  attr.action('hello', 'reset', 'dblclick'),
)
// => data-action="click->hello#greet dblclick->hello#reset"
```

## `attr.combine`

```ts
function attr.combine(...specs: AttrSpec[]): AttrSpec
```

Merges multiple specs onto one element by **reading structured data**, not by concatenating strings. It correctly:

- joins `data-controller` tokens (space-separated, de-duplicated),
- joins `data-action` descriptors into a single attribute,
- keeps value/class/outlet attributes namespaced by identifier so they never collide,
- flattens nested `attr.combine(a, attr.combine(b, c))`.

### Two controllers on one element

```ts
`<div ${attr.combine(
  attr.controller('hello', { greeting: 'Hi' }),
  attr.controller('tooltip', { text: 'Hey' }),
)}>`
// => <div data-controller="hello tooltip"
//         data-hello-greeting-value="Hi"
//         data-tooltip-text-value="Hey">
```

### Controller + target + action

```ts
`<div ${attr.combine(
  attr.controller('modal'),
  attr.target('parent', 'slot'),
  attr.action('modal', 'open', 'click'),
)}>`
// => <div data-controller="modal"
//         data-parent-target="slot"
//         data-action="click->modal#open">
```

### Duplicate identifiers throw

Passing the same identifier to two `attr.controller()` calls inside `attr.combine()` throws immediately:

```
Error: attr.combine(): duplicate Stimulus controller identifier "hello".
Declare each controller once and pass all its values/classes/outlets in a single attr.controller() call.
```

This mirrors how Stimulus itself treats duplicate identifiers on a single element — always the result of an accidental merge.

## Sub-folder controllers

Controllers living under sub-folders (Symfony UX / Asset Mapper convention) use a double-dash separator in their identifier. Every helper auto-normalizes common inputs:

```ts
attr.controller('MyApp/MyController', { greeting: 'Hi' })
// => data-controller="myapp--mycontroller"
//    data-myapp--mycontroller-greeting-value="Hi"

attr.controller('./assets/controllers/MyApp/Hello_controller.js')
// => data-controller="myapp--hello"

attr.controller('myapp--mycontroller')   // already canonical — untouched
```

The same normalization applies to `attr.target`, `attr.action`, and `render({ identifier })`.

## When to skip the helpers

- **Porting existing HTML fixtures.** Paste them in as-is; no need to re-author.
- **Very short inline fixtures.** `<div data-controller="x">` is shorter than `<div ${attr.controller('x')}>`.
- **Teaching examples.** Raw `data-*` matches Stimulus documentation 1:1 and is easier to follow for beginners.

Everywhere else — especially multi-controller fixtures or tests that depend on value serialization — helpers pay off fast.

Next: [Multiple controllers & outlets](./multiple-controllers.md).
