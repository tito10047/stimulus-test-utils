import type { Application, Controller } from '@hotwired/stimulus'

// Any subclass of Controller — avoids variance issues with generic Element type.
export type ControllerConstructor = new (...args: any[]) => Controller

export interface RenderOptions {
  html: string | HTMLElement
  identifier?: string
  controllers?: Record<string, ControllerConstructor>
  application?: Application
  container?: HTMLElement
}

export interface WaitForOptions {
  timeout?: number
  interval?: number
}

export interface UserEvent {
  click(el: Element): Promise<void>
  dblClick(el: Element): Promise<void>
  hover(el: Element): Promise<void>
  type(el: Element, text: string): Promise<void>
  clear(el: Element): Promise<void>
  keyboard(keys: string): Promise<void>
  tab(opts?: { shift?: boolean }): Promise<void>
  selectOption(select: HTMLSelectElement, value: string | string[]): Promise<void>
  submit(form: HTMLFormElement): Promise<void>
}

export interface QueryHelpers {
  getByTestId(id: string): HTMLElement
  queryByTestId(id: string): HTMLElement | null
  findByTestId(id: string, opts?: WaitForOptions): Promise<HTMLElement>
  getAllByTestId(id: string): HTMLElement[]

  getByRole(role: string, opts?: { name?: string | RegExp }): HTMLElement
  queryByRole(role: string, opts?: { name?: string | RegExp }): HTMLElement | null
  findByRole(role: string, opts?: { name?: string | RegExp } & WaitForOptions): Promise<HTMLElement>
  getAllByRole(role: string, opts?: { name?: string | RegExp }): HTMLElement[]

  getByText(text: string | RegExp): HTMLElement
  queryByText(text: string | RegExp): HTMLElement | null
  findByText(text: string | RegExp, opts?: WaitForOptions): Promise<HTMLElement>
  getAllByText(text: string | RegExp): HTMLElement[]

  getByLabelText(text: string | RegExp): HTMLElement
  queryByLabelText(text: string | RegExp): HTMLElement | null
  findByLabelText(text: string | RegExp, opts?: WaitForOptions): Promise<HTMLElement>
}

export interface RenderResult<C extends Controller = Controller> extends QueryHelpers {
  controller: C
  element: HTMLElement
  application: Application
  user: UserEvent
  waitFor: <T>(cb: () => T | Promise<T>, opts?: WaitForOptions) => Promise<T>
  rerender(next: { html: string | HTMLElement }): Promise<void>
  unmount(): void
}
