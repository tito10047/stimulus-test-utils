import { afterEach } from 'vitest'
import { cleanup } from '../src/index.js'

afterEach(() => {
  cleanup()
  document.body.innerHTML = ''
})
