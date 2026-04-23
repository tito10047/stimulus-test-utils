# Interface: UserEvent

Defined in: [types.ts:19](https://github.com/tito10047/stimulus-test-utils/blob/9651b413401ab4731158489ae9021bbddc36b5fb/src/types.ts#L19)

## Methods

### clear()

> **clear**(`el`): `Promise`\<`void`\>

Defined in: [types.ts:24](https://github.com/tito10047/stimulus-test-utils/blob/9651b413401ab4731158489ae9021bbddc36b5fb/src/types.ts#L24)

#### Parameters

##### el

`Element`

#### Returns

`Promise`\<`void`\>

***

### click()

> **click**(`el`): `Promise`\<`void`\>

Defined in: [types.ts:20](https://github.com/tito10047/stimulus-test-utils/blob/9651b413401ab4731158489ae9021bbddc36b5fb/src/types.ts#L20)

#### Parameters

##### el

`Element`

#### Returns

`Promise`\<`void`\>

***

### dblClick()

> **dblClick**(`el`): `Promise`\<`void`\>

Defined in: [types.ts:21](https://github.com/tito10047/stimulus-test-utils/blob/9651b413401ab4731158489ae9021bbddc36b5fb/src/types.ts#L21)

#### Parameters

##### el

`Element`

#### Returns

`Promise`\<`void`\>

***

### hover()

> **hover**(`el`): `Promise`\<`void`\>

Defined in: [types.ts:22](https://github.com/tito10047/stimulus-test-utils/blob/9651b413401ab4731158489ae9021bbddc36b5fb/src/types.ts#L22)

#### Parameters

##### el

`Element`

#### Returns

`Promise`\<`void`\>

***

### keyboard()

> **keyboard**(`keys`): `Promise`\<`void`\>

Defined in: [types.ts:25](https://github.com/tito10047/stimulus-test-utils/blob/9651b413401ab4731158489ae9021bbddc36b5fb/src/types.ts#L25)

#### Parameters

##### keys

`string`

#### Returns

`Promise`\<`void`\>

***

### selectOption()

> **selectOption**(`select`, `value`): `Promise`\<`void`\>

Defined in: [types.ts:27](https://github.com/tito10047/stimulus-test-utils/blob/9651b413401ab4731158489ae9021bbddc36b5fb/src/types.ts#L27)

#### Parameters

##### select

`HTMLSelectElement`

##### value

`string` \| `string`[]

#### Returns

`Promise`\<`void`\>

***

### submit()

> **submit**(`form`): `Promise`\<`void`\>

Defined in: [types.ts:28](https://github.com/tito10047/stimulus-test-utils/blob/9651b413401ab4731158489ae9021bbddc36b5fb/src/types.ts#L28)

#### Parameters

##### form

`HTMLFormElement`

#### Returns

`Promise`\<`void`\>

***

### tab()

> **tab**(`opts?`): `Promise`\<`void`\>

Defined in: [types.ts:26](https://github.com/tito10047/stimulus-test-utils/blob/9651b413401ab4731158489ae9021bbddc36b5fb/src/types.ts#L26)

#### Parameters

##### opts?

###### shift?

`boolean`

#### Returns

`Promise`\<`void`\>

***

### type()

> **type**(`el`, `text`): `Promise`\<`void`\>

Defined in: [types.ts:23](https://github.com/tito10047/stimulus-test-utils/blob/9651b413401ab4731158489ae9021bbddc36b5fb/src/types.ts#L23)

#### Parameters

##### el

`Element`

##### text

`string`

#### Returns

`Promise`\<`void`\>
