# API Reference

This section is generated from the TSDoc comments in [`src/`](https://github.com/tito10047/stimulus-test-utils/tree/main/src) by [TypeDoc](https://typedoc.org) with the [Markdown plugin](https://github.com/tgreyuk/typedoc-plugin-markdown). It is the single source of truth for every type, signature and option.

Run it locally:

```bash
npm run docs:api       # only regenerate the API pages
npm run docs:dev       # run the full docs site (includes API)
```

The generated pages appear alongside this one (`docs/api/*.md`) and are automatically picked up by the sidebar.

## Public surface (at a glance)

Runtime:

- `render(ControllerClass, options)` — mount + register + wait for `connect()`
- `cleanup()` — stop every `Application` and remove every fixture
- `createUserEvent()` / `fireEvent(element, event, init?)` — user-event simulation + low-level escape hatch
- `waitFor(callback, options?)` / `nextTick()` — async assertion helpers
- `stimulusController` / `stimulusTarget` / `stimulusAction` / `combine` — `data-*` attribute helpers
- `inferIdentifier(ControllerClass)` / `identifierFromPath(path)` / `normalizeIdentifier(raw)` — identifier utilities

Types:

- `RenderOptions`, `RenderResult`
- `UserEvent`, `WaitForOptions`, `QueryHelpers`
- `ControllerConstructor`
- `AttrSpec`, `StimulusActionOptions`

For how-tos, see the [Guide](/guide/introduction). For copy-pasteable patterns, see the [Cookbook](/cookbook/).
