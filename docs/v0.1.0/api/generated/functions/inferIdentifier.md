# Function: inferIdentifier()

> **inferIdentifier**(`ctor`): `string`

Defined in: [render.ts:20](https://github.com/tito10047/stimulus-test-utils/blob/c64b8f8a71571053963624044ff39793c9b8f3dd/src/render.ts#L20)

Infer a Stimulus identifier from a controller class name.
  HelloController       → "hello"
  HelloWorldController  → "helloworld"
  APIController         → "api"
  Anonymous / minified  → throws (caller must pass options.identifier)

The rule mirrors Symfony UX / Asset Mapper behaviour: the class name is
lowercased as a whole (CamelCase is NOT split with dashes). If you want a
hyphenated identifier, pass `options.identifier` explicitly.

## Parameters

### ctor

[`ControllerConstructor`](../type-aliases/ControllerConstructor.md)

## Returns

`string`
