# Interface: QueryHelpers

Defined in: [types.ts:31](https://github.com/tito10047/stimulus-test-utils/blob/c64b8f8a71571053963624044ff39793c9b8f3dd/src/types.ts#L31)

## Extended by

- [`RenderResult`](RenderResult.md)

## Methods

### findByLabelText()

> **findByLabelText**(`text`, `opts?`): `Promise`\<`HTMLElement`\>

Defined in: [types.ts:49](https://github.com/tito10047/stimulus-test-utils/blob/c64b8f8a71571053963624044ff39793c9b8f3dd/src/types.ts#L49)

#### Parameters

##### text

`string` \| `RegExp`

##### opts?

[`WaitForOptions`](WaitForOptions.md)

#### Returns

`Promise`\<`HTMLElement`\>

***

### findByRole()

> **findByRole**(`role`, `opts?`): `Promise`\<`HTMLElement`\>

Defined in: [types.ts:39](https://github.com/tito10047/stimulus-test-utils/blob/c64b8f8a71571053963624044ff39793c9b8f3dd/src/types.ts#L39)

#### Parameters

##### role

`string`

##### opts?

`object` & [`WaitForOptions`](WaitForOptions.md)

#### Returns

`Promise`\<`HTMLElement`\>

***

### findByTestId()

> **findByTestId**(`id`, `opts?`): `Promise`\<`HTMLElement`\>

Defined in: [types.ts:34](https://github.com/tito10047/stimulus-test-utils/blob/c64b8f8a71571053963624044ff39793c9b8f3dd/src/types.ts#L34)

#### Parameters

##### id

`string`

##### opts?

[`WaitForOptions`](WaitForOptions.md)

#### Returns

`Promise`\<`HTMLElement`\>

***

### findByText()

> **findByText**(`text`, `opts?`): `Promise`\<`HTMLElement`\>

Defined in: [types.ts:44](https://github.com/tito10047/stimulus-test-utils/blob/c64b8f8a71571053963624044ff39793c9b8f3dd/src/types.ts#L44)

#### Parameters

##### text

`string` \| `RegExp`

##### opts?

[`WaitForOptions`](WaitForOptions.md)

#### Returns

`Promise`\<`HTMLElement`\>

***

### getAllByRole()

> **getAllByRole**(`role`, `opts?`): `HTMLElement`[]

Defined in: [types.ts:40](https://github.com/tito10047/stimulus-test-utils/blob/c64b8f8a71571053963624044ff39793c9b8f3dd/src/types.ts#L40)

#### Parameters

##### role

`string`

##### opts?

###### name?

`string` \| `RegExp`

#### Returns

`HTMLElement`[]

***

### getAllByTestId()

> **getAllByTestId**(`id`): `HTMLElement`[]

Defined in: [types.ts:35](https://github.com/tito10047/stimulus-test-utils/blob/c64b8f8a71571053963624044ff39793c9b8f3dd/src/types.ts#L35)

#### Parameters

##### id

`string`

#### Returns

`HTMLElement`[]

***

### getAllByText()

> **getAllByText**(`text`): `HTMLElement`[]

Defined in: [types.ts:45](https://github.com/tito10047/stimulus-test-utils/blob/c64b8f8a71571053963624044ff39793c9b8f3dd/src/types.ts#L45)

#### Parameters

##### text

`string` \| `RegExp`

#### Returns

`HTMLElement`[]

***

### getByLabelText()

> **getByLabelText**(`text`): `HTMLElement`

Defined in: [types.ts:47](https://github.com/tito10047/stimulus-test-utils/blob/c64b8f8a71571053963624044ff39793c9b8f3dd/src/types.ts#L47)

#### Parameters

##### text

`string` \| `RegExp`

#### Returns

`HTMLElement`

***

### getByRole()

> **getByRole**(`role`, `opts?`): `HTMLElement`

Defined in: [types.ts:37](https://github.com/tito10047/stimulus-test-utils/blob/c64b8f8a71571053963624044ff39793c9b8f3dd/src/types.ts#L37)

#### Parameters

##### role

`string`

##### opts?

###### name?

`string` \| `RegExp`

#### Returns

`HTMLElement`

***

### getByTestId()

> **getByTestId**(`id`): `HTMLElement`

Defined in: [types.ts:32](https://github.com/tito10047/stimulus-test-utils/blob/c64b8f8a71571053963624044ff39793c9b8f3dd/src/types.ts#L32)

#### Parameters

##### id

`string`

#### Returns

`HTMLElement`

***

### getByText()

> **getByText**(`text`): `HTMLElement`

Defined in: [types.ts:42](https://github.com/tito10047/stimulus-test-utils/blob/c64b8f8a71571053963624044ff39793c9b8f3dd/src/types.ts#L42)

#### Parameters

##### text

`string` \| `RegExp`

#### Returns

`HTMLElement`

***

### queryByLabelText()

> **queryByLabelText**(`text`): `HTMLElement` \| `null`

Defined in: [types.ts:48](https://github.com/tito10047/stimulus-test-utils/blob/c64b8f8a71571053963624044ff39793c9b8f3dd/src/types.ts#L48)

#### Parameters

##### text

`string` \| `RegExp`

#### Returns

`HTMLElement` \| `null`

***

### queryByRole()

> **queryByRole**(`role`, `opts?`): `HTMLElement` \| `null`

Defined in: [types.ts:38](https://github.com/tito10047/stimulus-test-utils/blob/c64b8f8a71571053963624044ff39793c9b8f3dd/src/types.ts#L38)

#### Parameters

##### role

`string`

##### opts?

###### name?

`string` \| `RegExp`

#### Returns

`HTMLElement` \| `null`

***

### queryByTestId()

> **queryByTestId**(`id`): `HTMLElement` \| `null`

Defined in: [types.ts:33](https://github.com/tito10047/stimulus-test-utils/blob/c64b8f8a71571053963624044ff39793c9b8f3dd/src/types.ts#L33)

#### Parameters

##### id

`string`

#### Returns

`HTMLElement` \| `null`

***

### queryByText()

> **queryByText**(`text`): `HTMLElement` \| `null`

Defined in: [types.ts:43](https://github.com/tito10047/stimulus-test-utils/blob/c64b8f8a71571053963624044ff39793c9b8f3dd/src/types.ts#L43)

#### Parameters

##### text

`string` \| `RegExp`

#### Returns

`HTMLElement` \| `null`
