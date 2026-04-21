/** Convert camelCase / snake_case / PascalCase to kebab-case. */
export function toKebabCase(input: string): string {
  return input
    .replace(/_/g, '-')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .toLowerCase()
}

/**
 * HTML-escape a value for safe placement inside a double-quoted attribute.
 * We intentionally only escape `&` and `"` — `<` / `>` / `'` are valid
 * inside double-quoted attribute values per the HTML spec, and escaping
 * them would mangle Stimulus' own syntax (e.g. `click->hello#greet`).
 */
export function escapeAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;')
}
