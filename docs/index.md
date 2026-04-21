---
layout: home

hero:
  name: "stimulus-test-utils"
  text: "Testing-Library for Stimulus."
  tagline: "Mount a controller, simulate user interactions, assert the DOM — in three lines. No Application boilerplate, no MutationObserver timing, no cleanup ceremony."
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: API Reference
      link: /api/
    - theme: alt
      text: View on GitHub
      link: https://github.com/tito10047/stimulus-test-utils

features:
  - title: Zero config
    details: "A single <code>render()</code> call starts the Application, registers the controller, mounts the fixture, and waits for <code>connect()</code>. That is the entire setup."
  - title: Testing-Library flavour
    details: "<code>getByRole</code>, <code>findByText</code>, <code>user.click</code>, <code>user.type</code> — the API you already know, scoped to the mounted fixture."
  - title: Peer-dependency only
    details: "Stimulus is a peer dependency. You bring the version your app uses; the harness never pins it."
  - title: TypeScript first
    details: "<code>render&lt;HelloController&gt;()</code> returns a fully-typed controller instance. Targets, values, outlets — all inferred from your class."
  - title: Real user events
    details: "Built on user-event semantics: <code>type</code> fires input + change per character, <code>keyboard</code> speaks the full key grammar, every action awaits Stimulus' MutationObserver."
  - title: Refactor-safe fixtures
    details: "Optional <code>stimulusController()</code> / <code>stimulusTarget()</code> / <code>stimulusAction()</code> helpers generate <code>data-*</code> attributes without typos."
---

## A complete test, start to finish

```ts
import { render, stimulusController, stimulusTarget, stimulusAction } from '@tito10047/stimulus-test-utils'
import { expect, test } from 'vitest'
import HelloController from './hello_controller.js'

test('greets by name', async () => {
  const { controller, user, element, getByRole } = await render(HelloController, {
    html: `
      <div ${stimulusController('hello', { greeting: 'Hi' })}>
        <input ${stimulusTarget('hello', 'name')} />
        <button ${stimulusAction('hello', 'greet', 'click')}>Greet</button>
        <span ${stimulusTarget('hello', 'output')}></span>
      </div>
    `,
  })

  await user.type(element.querySelector('input')!, 'Ada')
  await user.click(getByRole('button', { name: 'Greet' }))

  expect(controller.outputTarget.textContent).toBe('Hi, Ada!')
})
```

That is every line you need: no `Application.start()`, no `document.body.innerHTML = …`, no manual `await nextTick()`.

Ready to install it? Continue with [Getting Started](/guide/getting-started).
