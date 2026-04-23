# Function: nextTick()

> **nextTick**(): `Promise`\<`void`\>

Defined in: [wait-for.ts:7](https://github.com/tito10047/stimulus-test-utils/blob/c64b8f8a71571053963624044ff39793c9b8f3dd/src/wait-for.ts#L7)

Flush microtasks + one macrotask tick so Stimulus' MutationObserver
observers and scheduled callbacks settle before the test continues.

## Returns

`Promise`\<`void`\>
