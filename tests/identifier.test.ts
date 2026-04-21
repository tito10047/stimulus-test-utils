import { describe, expect, it } from 'vitest'
import { identifierFromPath, normalizeIdentifier, inferIdentifier } from '../src/index.js'
import { Controller } from '@hotwired/stimulus'

describe('identifierFromPath', () => {
  it.each([
    ['./assets/controllers/hello_controller.js', 'hello'],
    ['./assets/controllers/MyApp/MyController_controller.js', 'myapp--mycontroller'],
    ['assets/controllers/Users/List_controller.js', 'users--list'],
    ['controllers/users/list_controller.js', 'users--list'],
    ['MyApp/MyController', 'myapp--mycontroller'],
    ['MyApp/MyController_controller', 'myapp--mycontroller'],
    ['hello_controller', 'hello'],
    ['hello-controller', 'hello'],
    ['deeply/nested/path/hello_controller.ts', 'deeply--nested--path--hello'],
    ['foo/bar.tsx', 'foo--bar'],
  ])('%s → %s', (input, expected) => {
    expect(identifierFromPath(input)).toBe(expected)
  })

  it('throws on empty input', () => {
    expect(() => identifierFromPath('')).toThrow()
  })

  it('throws when last segment becomes empty after stripping suffix', () => {
    expect(() => identifierFromPath('foo/_controller')).toThrow(/empty/)
  })

  it('throws on "/" only', () => {
    expect(() => identifierFromPath('/')).toThrow(/cannot derive/)
  })
})

describe('normalizeIdentifier', () => {
  it('leaves plain identifiers untouched', () => {
    expect(normalizeIdentifier('hello')).toBe('hello')
    expect(normalizeIdentifier('myapp--mycontroller')).toBe('myapp--mycontroller')
    expect(normalizeIdentifier('data-picker')).toBe('data-picker')
  })

  it('routes path/camelcase/ext through identifierFromPath', () => {
    expect(normalizeIdentifier('MyApp/MyController')).toBe('myapp--mycontroller')
    expect(normalizeIdentifier('HelloWorld')).toBe('helloworld')
    expect(normalizeIdentifier('hello_controller')).toBe('hello')
    expect(normalizeIdentifier('hello.js')).toBe('hello')
  })

  it('throws on non-string / empty', () => {
    // @ts-expect-error — runtime guard
    expect(() => normalizeIdentifier(null)).toThrow()
    expect(() => normalizeIdentifier('')).toThrow()
  })
})

describe('inferIdentifier (from class)', () => {
  it('strips Controller suffix and lowercases the rest (no kebab split)', () => {
    class HelloController extends Controller {}
    class HelloWorldController extends Controller {}
    class APIController extends Controller {}
    expect(inferIdentifier(HelloController)).toBe('hello')
    expect(inferIdentifier(HelloWorldController)).toBe('helloworld')
    expect(inferIdentifier(APIController)).toBe('api')
  })

  it('works on a class without Controller suffix', () => {
    class Hello extends Controller {}
    expect(inferIdentifier(Hello)).toBe('hello')
  })

  it('throws on empty / unnamed class', () => {
    const Anon = (() => class extends Controller {})()
    Object.defineProperty(Anon, 'name', { value: '' })
    expect(() => inferIdentifier(Anon)).toThrow(/anonymous/)
  })

  it('throws when stripping Controller empties the name', () => {
    class Controller2 extends Controller {}
    Object.defineProperty(Controller2, 'name', { value: 'Controller' })
    expect(() => inferIdentifier(Controller2)).toThrow(/empty identifier/)
  })
})
