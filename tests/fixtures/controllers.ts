/**
 * Realistic Stimulus controllers used by the integration test suite.
 * Each one mirrors something you'd actually ship in an app.
 */
import { Controller } from '@hotwired/stimulus'

/** Classic "hello" controller from the Stimulus handbook. */
export class HelloController extends Controller {
  static targets = ['name', 'output']
  static values = { greeting: { type: String, default: 'Hello' } }

  declare readonly nameTarget: HTMLInputElement
  declare readonly outputTarget: HTMLElement
  declare readonly greetingValue: string

  greet(): void {
    this.outputTarget.textContent = `${this.greetingValue}, ${this.nameTarget.value}!`
  }
}

/** Counter with numeric value + inc/dec/reset actions. */
export class CounterController extends Controller {
  static targets = ['display']
  static values = { count: Number, step: { type: Number, default: 1 } }

  declare readonly displayTarget: HTMLElement
  declare countValue: number
  declare readonly stepValue: number

  connect(): void {
    this.render()
  }

  countValueChanged(): void {
    this.render()
  }

  increment(): void {
    this.countValue += this.stepValue
  }

  decrement(): void {
    this.countValue -= this.stepValue
  }

  reset(): void {
    this.countValue = 0
  }

  private render(): void {
    this.displayTarget.textContent = String(this.countValue)
  }
}

/** Form validator: dispatches "valid" / "invalid" event via Stimulus. */
export class FormValidatorController extends Controller {
  static targets = ['input', 'error']
  static values = { pattern: String, message: { type: String, default: 'Invalid' } }

  declare readonly inputTarget: HTMLInputElement
  declare readonly errorTarget: HTMLElement
  declare readonly patternValue: string
  declare readonly messageValue: string

  validate(): void {
    const re = new RegExp(this.patternValue)
    if (re.test(this.inputTarget.value)) {
      this.errorTarget.textContent = ''
      this.dispatch('valid', { detail: { value: this.inputTarget.value } })
    } else {
      this.errorTarget.textContent = this.messageValue
      this.dispatch('invalid', { detail: { value: this.inputTarget.value } })
    }
  }
}

/** Toggle controller: flips hidden on a target and a CSS class. */
export class ToggleController extends Controller {
  static targets = ['content', 'trigger']
  static classes = ['open']

  declare readonly contentTarget: HTMLElement
  declare readonly triggerTarget: HTMLElement
  declare readonly openClass: string

  toggle(): void {
    const isHidden = this.contentTarget.hasAttribute('hidden')
    if (isHidden) {
      this.contentTarget.removeAttribute('hidden')
      this.triggerTarget.classList.add(this.openClass)
      this.triggerTarget.setAttribute('aria-expanded', 'true')
    } else {
      this.contentTarget.setAttribute('hidden', '')
      this.triggerTarget.classList.remove(this.openClass)
      this.triggerTarget.setAttribute('aria-expanded', 'false')
    }
  }
}

/** Async search — calls fetch, renders results. */
interface SearchResult {
  id: number
  name: string
}

export class SearchController extends Controller {
  static targets = ['query', 'results', 'status']
  static values = { url: String }

  declare readonly queryTarget: HTMLInputElement
  declare readonly resultsTarget: HTMLElement
  declare readonly statusTarget: HTMLElement
  declare readonly urlValue: string

  async submit(event: Event): Promise<void> {
    event.preventDefault()
    this.statusTarget.textContent = 'Loading…'
    try {
      const response = await fetch(`${this.urlValue}?q=${encodeURIComponent(this.queryTarget.value)}`)
      const data = (await response.json()) as SearchResult[]
      this.resultsTarget.innerHTML = data
        .map((r) => `<li data-testid="result-${r.id}">${r.name}</li>`)
        .join('')
      this.statusTarget.textContent = `${data.length} result(s)`
    } catch (err) {
      this.statusTarget.textContent = `Error: ${(err as Error).message}`
    }
  }
}

/** Modal + Dialog pair showcasing Stimulus outlets. */
export class DialogController extends Controller {
  show(): void {
    this.element.removeAttribute('hidden')
  }
  hide(): void {
    this.element.setAttribute('hidden', '')
  }
  get isOpen(): boolean {
    return !this.element.hasAttribute('hidden')
  }
}

export class ModalController extends Controller {
  static override outlets = ['dialog']

  declare readonly dialogOutlet: DialogController
  declare readonly hasDialogOutlet: boolean

  open(): void {
    if (this.hasDialogOutlet) this.dialogOutlet.show()
  }
  close(): void {
    if (this.hasDialogOutlet) this.dialogOutlet.hide()
  }
}

/** Tabs — shows how a single controller manages children via data-index. */
export class TabsController extends Controller {
  static targets = ['tab', 'panel']
  static values = { activeIndex: { type: Number, default: 0 } }
  static classes = ['active']

  declare readonly tabTargets: HTMLElement[]
  declare readonly panelTargets: HTMLElement[]
  declare activeIndexValue: number
  declare readonly activeClass: string

  override connect(): void {
    this.render()
  }

  activeIndexValueChanged(): void {
    this.render()
  }

  select(event: Event): void {
    const tab = event.currentTarget as HTMLElement
    const index = this.tabTargets.indexOf(tab)
    if (index >= 0) this.activeIndexValue = index
  }

  private render(): void {
    this.tabTargets.forEach((t, i) => {
      t.classList.toggle(this.activeClass, i === this.activeIndexValue)
      t.setAttribute('aria-selected', String(i === this.activeIndexValue))
    })
    this.panelTargets.forEach((p, i) => {
      if (i === this.activeIndexValue) p.removeAttribute('hidden')
      else p.setAttribute('hidden', '')
    })
  }
}

/** Keyboard-driven controller — handles Enter/Escape. */
export class KeyboardController extends Controller {
  static override targets = ['status']
  declare readonly statusTarget: HTMLElement

  onEnter(): void {
    this.statusTarget.textContent = 'submitted'
  }
  onEscape(): void {
    this.statusTarget.textContent = 'cancelled'
  }
}
