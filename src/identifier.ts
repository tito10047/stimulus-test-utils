/**
 * Stimulus identifier utilities.
 *
 * Stimulus convention for controllers living in sub-folders:
 *   ./assets/controllers/MyApp/MyController_controller.js → "myapp--mycontroller"
 *   ./assets/controllers/Users/List_controller.js         → "users--list"
 *   ./assets/controllers/hello_controller.js              → "hello"
 *
 * Rules:
 *   - Directory separators "/" become "--".
 *   - Each path segment is lowercased (CamelCase is NOT split into kebab-case
 *     — "MyApp" becomes "myapp", not "my-app"). This mirrors the Symfony UX
 *     / Asset Mapper / @hotwired/stimulus-webpack-helpers behaviour.
 *   - Any trailing "_controller" / "-controller" / "Controller" suffix is
 *     stripped from the last segment.
 *   - The leading "./", "assets/controllers/", "controllers/" prefix is
 *     stripped so you can paste the full path as-is.
 *   - File extension (".js" / ".ts" / ".mjs" / ".tsx") is stripped.
 */

const PATH_PREFIX = /^\.?\/?(?:assets\/)?(?:controllers\/)?/i
const FILE_EXT = /\.[jt]sx?$/i
const CONTROLLER_SUFFIX = /[_-][Cc]ontroller$/

export function identifierFromPath(filePath: string): string {
  if (!filePath) throw new TypeError('identifierFromPath(): path must be a non-empty string')

  const withoutPrefix = filePath.replace(PATH_PREFIX, '')
  const withoutExt = withoutPrefix.replace(FILE_EXT, '')
  const segments = withoutExt.split('/').filter(Boolean)
  if (segments.length === 0) {
    throw new Error(`identifierFromPath(): cannot derive identifier from "${filePath}"`)
  }

  // Strip "_controller" / "Controller" / "-controller" from the last segment only.
  const last = segments[segments.length - 1]!
  const stripped = last.replace(CONTROLLER_SUFFIX, '')
  if (!stripped) {
    throw new Error(`identifierFromPath(): last segment of "${filePath}" is empty after stripping "_controller"`)
  }
  segments[segments.length - 1] = stripped

  const lowered = segments.map((seg) => seg.toLowerCase())
  if (lowered.some((s) => !s)) {
    throw new Error(`identifierFromPath(): empty segment in "${filePath}"`)
  }

  return lowered.join('--')
}

/**
 * Normalize whatever identifier-ish string the user handed us into the
 * canonical Stimulus identifier:
 *
 *   "hello"                        → "hello"            (plain, untouched)
 *   "myapp--mycontroller"          → "myapp--mycontroller"  (already canonical)
 *   "MyApp/MyController"           → "myapp--mycontroller"
 *   "MyApp/MyController_controller.js" → "myapp--mycontroller"
 *   "users/list_controller"        → "users--list"
 *
 * Rules:
 *   - If the string contains "/" or an uppercase letter or ends with a file
 *     extension, we route it through `identifierFromPath`.
 *   - A trailing `_controller` on a plain (no‑slash) string is also stripped
 *     so `stimulusController("hello_controller")` DWIMs into `hello`.
 *   - Otherwise we return it as-is (so already-valid identifiers like
 *     "hello", "myapp--mycontroller", "data-picker" round‑trip unchanged).
 */
export function normalizeIdentifier(raw: string): string {
  if (!raw || typeof raw !== 'string') {
    throw new TypeError('Stimulus identifier must be a non-empty string')
  }
  const looksLikePath =
    raw.includes('/') ||
    /[A-Z]/.test(raw) ||
    /\.[jt]sx?$/i.test(raw) ||
    /_controller$/i.test(raw)
  if (!looksLikePath) return raw
  return identifierFromPath(raw)
}
