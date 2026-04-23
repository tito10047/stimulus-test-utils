# Interface: RenderResult\<C\>

Defined in: [types.ts:52](https://github.com/tito10047/stimulus-test-utils/blob/9651b413401ab4731158489ae9021bbddc36b5fb/src/types.ts#L52)

## Extends

- [`QueryHelpers`](QueryHelpers.md)

## Type Parameters

### C

`C` *extends* `Controller` = `Controller`

## Properties

### application

> **application**: `Application`

Defined in: [types.ts:55](https://github.com/tito10047/stimulus-test-utils/blob/9651b413401ab4731158489ae9021bbddc36b5fb/src/types.ts#L55)

***

### controller

> **controller**: `C`

Defined in: [types.ts:53](https://github.com/tito10047/stimulus-test-utils/blob/9651b413401ab4731158489ae9021bbddc36b5fb/src/types.ts#L53)

***

### element

> **element**: `HTMLElement`

Defined in: [types.ts:54](https://github.com/tito10047/stimulus-test-utils/blob/9651b413401ab4731158489ae9021bbddc36b5fb/src/types.ts#L54)

***

### user

> **user**: [`UserEvent`](UserEvent.md)

Defined in: [types.ts:56](https://github.com/tito10047/stimulus-test-utils/blob/9651b413401ab4731158489ae9021bbddc36b5fb/src/types.ts#L56)

***

### waitFor

> **waitFor**: \<`T`\>(`cb`, `opts?`) => `Promise`\<`T`\>

Defined in: [types.ts:57](https://github.com/tito10047/stimulus-test-utils/blob/9651b413401ab4731158489ae9021bbddc36b5fb/src/types.ts#L57)

#### Type Parameters

##### T

`T`

#### Parameters

##### cb

() => `T` \| `Promise`\<`T`\>

##### opts?

[`WaitForOptions`](WaitForOptions.md)

#### Returns

`Promise`\<`T`\>

## Methods

### findByLabelText()

> **findByLabelText**(`text`, `opts?`): `Promise`\<`HTMLElement`\>

Defined in: [types.ts:49](https://github.com/tito10047/stimulus-test-utils/blob/9651b413401ab4731158489ae9021bbddc36b5fb/src/types.ts#L49)

#### Parameters

##### text

`string` \| `RegExp`

##### opts?

[`WaitForOptions`](WaitForOptions.md)

#### Returns

`Promise`\<`HTMLElement`\>

#### Inherited from

[`QueryHelpers`](QueryHelpers.md).[`findByLabelText`](QueryHelpers.md#findbylabeltext)

***

### findByRole()

> **findByRole**(`role`, `opts?`): `Promise`\<`HTMLElement`\>

Defined in: [types.ts:39](https://github.com/tito10047/stimulus-test-utils/blob/9651b413401ab4731158489ae9021bbddc36b5fb/src/types.ts#L39)

#### Parameters

##### role

`string`

##### opts?

`object` & [`WaitForOptions`](WaitForOptions.md)

#### Returns

`Promise`\<`HTMLElement`\>

#### Inherited from

[`QueryHelpers`](QueryHelpers.md).[`findByRole`](QueryHelpers.md#findbyrole)

***

### findByTestId()

> **findByTestId**(`id`, `opts?`): `Promise`\<`HTMLElement`\>

Defined in: [types.ts:34](https://github.com/tito10047/stimulus-test-utils/blob/9651b413401ab4731158489ae9021bbddc36b5fb/src/types.ts#L34)

#### Parameters

##### id

`string`

##### opts?

[`WaitForOptions`](WaitForOptions.md)

#### Returns

`Promise`\<`HTMLElement`\>

#### Inherited from

[`QueryHelpers`](QueryHelpers.md).[`findByTestId`](QueryHelpers.md#findbytestid)

***

### findByText()

> **findByText**(`text`, `opts?`): `Promise`\<`HTMLElement`\>

Defined in: [types.ts:44](https://github.com/tito10047/stimulus-test-utils/blob/9651b413401ab4731158489ae9021bbddc36b5fb/src/types.ts#L44)

#### Parameters

##### text

`string` \| `RegExp`

##### opts?

[`WaitForOptions`](WaitForOptions.md)

#### Returns

`Promise`\<`HTMLElement`\>

#### Inherited from

[`QueryHelpers`](QueryHelpers.md).[`findByText`](QueryHelpers.md#findbytext)

***

### getAllByRole()

> **getAllByRole**(`role`, `opts?`): `HTMLElement`[]

Defined in: [types.ts:40](https://github.com/tito10047/stimulus-test-utils/blob/9651b413401ab4731158489ae9021bbddc36b5fb/src/types.ts#L40)

#### Parameters

##### role

`string`

##### opts?

###### name?

`string` \| `RegExp`

#### Returns

`HTMLElement`[]

#### Inherited from

[`QueryHelpers`](QueryHelpers.md).[`getAllByRole`](QueryHelpers.md#getallbyrole)

***

### getAllByTestId()

> **getAllByTestId**(`id`): `HTMLElement`[]

Defined in: [types.ts:35](https://github.com/tito10047/stimulus-test-utils/blob/9651b413401ab4731158489ae9021bbddc36b5fb/src/types.ts#L35)

#### Parameters

##### id

`string`

#### Returns

`HTMLElement`[]

#### Inherited from

[`QueryHelpers`](QueryHelpers.md).[`getAllByTestId`](QueryHelpers.md#getallbytestid)

***

### getAllByText()

> **getAllByText**(`text`): `HTMLElement`[]

Defined in: [types.ts:45](https://github.com/tito10047/stimulus-test-utils/blob/9651b413401ab4731158489ae9021bbddc36b5fb/src/types.ts#L45)

#### Parameters

##### text

`string` \| `RegExp`

#### Returns

`HTMLElement`[]

#### Inherited from

[`QueryHelpers`](QueryHelpers.md).[`getAllByText`](QueryHelpers.md#getallbytext)

***

### getByLabelText()

> **getByLabelText**(`text`): `HTMLElement`

Defined in: [types.ts:47](https://github.com/tito10047/stimulus-test-utils/blob/9651b413401ab4731158489ae9021bbddc36b5fb/src/types.ts#L47)

#### Parameters

##### text

`string` \| `RegExp`

#### Returns

`HTMLElement`

#### Inherited from

[`QueryHelpers`](QueryHelpers.md).[`getByLabelText`](QueryHelpers.md#getbylabeltext)

***

### getByRole()

> **getByRole**(`role`, `opts?`): `HTMLElement`

Defined in: [types.ts:37](https://github.com/tito10047/stimulus-test-utils/blob/9651b413401ab4731158489ae9021bbddc36b5fb/src/types.ts#L37)

#### Parameters

##### role

`string`

##### opts?

###### name?

`string` \| `RegExp`

#### Returns

`HTMLElement`

#### Inherited from

[`QueryHelpers`](QueryHelpers.md).[`getByRole`](QueryHelpers.md#getbyrole)

***

### getByTestId()

> **getByTestId**(`id`): `HTMLElement`

Defined in: [types.ts:32](https://github.com/tito10047/stimulus-test-utils/blob/9651b413401ab4731158489ae9021bbddc36b5fb/src/types.ts#L32)

#### Parameters

##### id

`string`

#### Returns

`HTMLElement`

#### Inherited from

[`QueryHelpers`](QueryHelpers.md).[`getByTestId`](QueryHelpers.md#getbytestid)

***

### getByText()

> **getByText**(`text`): `HTMLElement`

Defined in: [types.ts:42](https://github.com/tito10047/stimulus-test-utils/blob/9651b413401ab4731158489ae9021bbddc36b5fb/src/types.ts#L42)

#### Parameters

##### text

`string` \| `RegExp`

#### Returns

`HTMLElement`

#### Inherited from

[`QueryHelpers`](QueryHelpers.md).[`getByText`](QueryHelpers.md#getbytext)

***

### queryByLabelText()

> **queryByLabelText**(`text`): `HTMLElement` \| `null`

Defined in: [types.ts:48](https://github.com/tito10047/stimulus-test-utils/blob/9651b413401ab4731158489ae9021bbddc36b5fb/src/types.ts#L48)

#### Parameters

##### text

`string` \| `RegExp`

#### Returns

`HTMLElement` \| `null`

#### Inherited from

[`QueryHelpers`](QueryHelpers.md).[`queryByLabelText`](QueryHelpers.md#querybylabeltext)

***

### queryByRole()

> **queryByRole**(`role`, `opts?`): `HTMLElement` \| `null`

Defined in: [types.ts:38](https://github.com/tito10047/stimulus-test-utils/blob/9651b413401ab4731158489ae9021bbddc36b5fb/src/types.ts#L38)

#### Parameters

##### role

`string`

##### opts?

###### name?

`string` \| `RegExp`

#### Returns

`HTMLElement` \| `null`

#### Inherited from

[`QueryHelpers`](QueryHelpers.md).[`queryByRole`](QueryHelpers.md#querybyrole)

***

### queryByTestId()

> **queryByTestId**(`id`): `HTMLElement` \| `null`

Defined in: [types.ts:33](https://github.com/tito10047/stimulus-test-utils/blob/9651b413401ab4731158489ae9021bbddc36b5fb/src/types.ts#L33)

#### Parameters

##### id

`string`

#### Returns

`HTMLElement` \| `null`

#### Inherited from

[`QueryHelpers`](QueryHelpers.md).[`queryByTestId`](QueryHelpers.md#querybytestid)

***

### queryByText()

> **queryByText**(`text`): `HTMLElement` \| `null`

Defined in: [types.ts:43](https://github.com/tito10047/stimulus-test-utils/blob/9651b413401ab4731158489ae9021bbddc36b5fb/src/types.ts#L43)

#### Parameters

##### text

`string` \| `RegExp`

#### Returns

`HTMLElement` \| `null`

#### Inherited from

[`QueryHelpers`](QueryHelpers.md).[`queryByText`](QueryHelpers.md#querybytext)

***

### rerender()

> **rerender**(`next`): `Promise`\<`void`\>

Defined in: [types.ts:58](https://github.com/tito10047/stimulus-test-utils/blob/9651b413401ab4731158489ae9021bbddc36b5fb/src/types.ts#L58)

#### Parameters

##### next

###### html

`string` \| `HTMLElement`

#### Returns

`Promise`\<`void`\>

***

### unmount()

> **unmount**(): `void`

Defined in: [types.ts:59](https://github.com/tito10047/stimulus-test-utils/blob/9651b413401ab4731158489ae9021bbddc36b5fb/src/types.ts#L59)

#### Returns

`void`
