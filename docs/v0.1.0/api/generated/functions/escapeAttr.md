# Function: escapeAttr()

> **escapeAttr**(`value`): `string`

Defined in: [utils.ts:16](https://github.com/tito10047/stimulus-test-utils/blob/9651b413401ab4731158489ae9021bbddc36b5fb/src/utils.ts#L16)

HTML-escape a value for safe placement inside a double-quoted attribute.
We intentionally only escape `&` and `"` — `<` / `>` / `'` are valid
inside double-quoted attribute values per the HTML spec, and escaping
them would mangle Stimulus' own syntax (e.g. `click->hello#greet`).

## Parameters

### value

`string`

## Returns

`string`
