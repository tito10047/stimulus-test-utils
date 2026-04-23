# API Reference

The full API documentation has been moved to a separate section.

[**Go to Full API Reference →**](/api/generated/README)

## Public surface (at a glance)

Runtime:

- `render(ControllerClass, options)` — mount + register + wait for `connect()`
- `cleanup()` — stop every `Application` and remove every fixture
- `createUserEvent()` / `fireEvent(element, event, init?)` — user-event simulation + low-level escape hatch
- `waitFor(callback, options?)` / `nextTick()` — async assertion helpers
- `attr.controller` / `attr.target` / `attr.action` / `attr.combine` — `data-*` attribute helpers
- `inferIdentifier(ControllerClass)` / `identifierFromPath(path)` / `normalizeIdentifier(raw)` — identifier utilities

Types:

- `RenderOptions`, `RenderResult`
- `UserEvent`, `WaitForOptions`, `QueryHelpers`
- `ControllerConstructor`
- `AttrSpec`, `StimulusActionOptions`

For how-tos, see the [Guide](/guide/introduction). For copy-pasteable patterns, see the [Cookbook](/cookbook/).
