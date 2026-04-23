# Variable: attr

> `const` **attr**: `object`

Defined in: [attributes.ts:238](https://github.com/tito10047/stimulus-test-utils/blob/c64b8f8a71571053963624044ff39793c9b8f3dd/src/attributes.ts#L238)

Grouped attribute helpers.

## Type Declaration

### action

> **action**: (`identifier`, `method`, `event?`, `options?`) => [`AttrSpec`](../interfaces/AttrSpec.md) = `stimulusAction`

#### Parameters

##### identifier

`string`

##### method

`string`

##### event?

`string`

##### options?

[`StimulusActionOptions`](../interfaces/StimulusActionOptions.md)

#### Returns

[`AttrSpec`](../interfaces/AttrSpec.md)

### combine

> **combine**: (...`specs`) => [`AttrSpec`](../interfaces/AttrSpec.md)

Merge multiple AttrSpecs onto a single element.
Throws on duplicate controller identifier.

#### Parameters

##### specs

...[`AttrSpec`](../interfaces/AttrSpec.md)[]

#### Returns

[`AttrSpec`](../interfaces/AttrSpec.md)

### controller

> **controller**: (`identifier`, `values?`, `classes?`, `outlets?`) => [`AttrSpec`](../interfaces/AttrSpec.md) = `stimulusController`

#### Parameters

##### identifier

`string`

##### values?

`Record`\<`string`, `unknown`\>

##### classes?

`Record`\<`string`, `string`\>

##### outlets?

`Record`\<`string`, `string`\>

#### Returns

[`AttrSpec`](../interfaces/AttrSpec.md)

### target

> **target**: (`identifier`, ...`targetNames`) => [`AttrSpec`](../interfaces/AttrSpec.md) = `stimulusTarget`

#### Parameters

##### identifier

`string`

##### targetNames

...`string`[]

#### Returns

[`AttrSpec`](../interfaces/AttrSpec.md)
