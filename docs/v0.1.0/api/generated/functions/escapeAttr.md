# Function: escapeAttr()

> **escapeAttr**(`value`): `string`

Defined in: [utils.ts:16](https://github.com/tito10047/stimulus-test-utils/blob/c64b8f8a71571053963624044ff39793c9b8f3dd/src/utils.ts#L16)

HTML-escape a value for safe placement inside a double-quoted attribute.
We intentionally only escape `&` and `"` — `<` / `>` / `'` are valid
inside double-quoted attribute values per the HTML spec, and escaping
them would mangle Stimulus' own syntax (e.g. `click->hello#greet`).

## Parameters

### value

`string`

## Returns

`string`
