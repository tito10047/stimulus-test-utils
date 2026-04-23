# Function: normalizeIdentifier()

> **normalizeIdentifier**(`raw`): `string`

Defined in: [identifier.ts:69](https://github.com/tito10047/stimulus-test-utils/blob/9651b413401ab4731158489ae9021bbddc36b5fb/src/identifier.ts#L69)

Normalize whatever identifier-ish string the user handed us into the
canonical Stimulus identifier:

  "hello"                        → "hello"            (plain, untouched)
  "myapp--mycontroller"          → "myapp--mycontroller"  (already canonical)
  "MyApp/MyController"           → "myapp--mycontroller"
  "MyApp/MyController_controller.js" → "myapp--mycontroller"
  "users/list_controller"        → "users--list"

Rules:
  - If the string contains "/" or an uppercase letter or ends with a file
    extension, we route it through `identifierFromPath`.
  - A trailing `_controller` on a plain (no‑slash) string is also stripped
    so `stimulusController("hello_controller")` DWIMs into `hello`.
  - Otherwise we return it as-is (so already-valid identifiers like
    "hello", "myapp--mycontroller", "data-picker" round‑trip unchanged).

## Parameters

### raw

`string`

## Returns

`string`
