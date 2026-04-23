# Function: nextTick()

> **nextTick**(): `Promise`\<`void`\>

Defined in: [wait-for.ts:7](https://github.com/tito10047/stimulus-test-utils/blob/9651b413401ab4731158489ae9021bbddc36b5fb/src/wait-for.ts#L7)

Flush microtasks + one macrotask tick so Stimulus' MutationObserver
observers and scheduled callbacks settle before the test continues.

## Returns

`Promise`\<`void`\>
