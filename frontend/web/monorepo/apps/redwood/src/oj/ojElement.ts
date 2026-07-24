import { nothing, type ElementPart, type TemplateResult } from 'lit'
import { html as staticHtml, unsafeStatic } from 'lit/static-html.js'
import { Directive, directive, PartType, type PartInfo } from 'lit/directive.js'

/**
 * A Lit element-position directive that applies { props, attrs, events } to an Oracle JET custom
 * element. Setting values as JS PROPERTIES (not attributes) is the robust path for JET elements,
 * whose props resolve off the instance after upgrade. Listeners are attached idempotently so a
 * re-render never stacks them.
 *
 * Reused from the redwood-spectra renderer's ojDriver — the one genuinely reusable seam of the
 * previous attempt.
 */

export interface OjBindings {
  props?: Record<string, unknown>
  attrs?: Record<string, string | undefined>
  events?: Record<string, (e: Event) => void>
}

const OJ_LISTENERS = Symbol('ojListeners')

class ApplyOjDirective extends Directive {
  constructor(partInfo: PartInfo) {
    super(partInfo)
    if (partInfo.type !== PartType.ELEMENT) {
      throw new Error('applyOj can only be used on an element binding')
    }
  }

  render(_bindings: OjBindings): typeof nothing {
    return nothing
  }

  update(part: ElementPart, [bindings]: [OjBindings]): typeof nothing {
    const el = part.element as unknown as HTMLElement & Record<string, unknown>
    for (const [key, value] of Object.entries(bindings.props ?? {})) {
      if (value !== undefined) el[key] = value
    }
    for (const [key, value] of Object.entries(bindings.attrs ?? {})) {
      if (value === undefined) el.removeAttribute(key)
      else el.setAttribute(key, value)
    }
    const store = (el[OJ_LISTENERS as unknown as string] ??= {}) as Record<string, EventListener>
    for (const [name, handler] of Object.entries(bindings.events ?? {})) {
      const prev = store[name]
      if (prev) el.removeEventListener(name, prev)
      el.addEventListener(name, handler as EventListener)
      store[name] = handler as EventListener
    }
    return nothing
  }
}

const applyOj = directive(ApplyOjDirective)

/**
 * Emit an oj-c / oj-sp / oj-dynamic element by tag name with props (by property) + attrs (by
 * attribute) + slotted children. The generic driver every view uses, so the mapping code stays
 * pure data.
 */
export function ojElement(
  tag: string,
  cfg: {
    props?: Record<string, unknown>
    attrs?: Record<string, string | undefined>
    events?: Record<string, (e: Event) => void>
    children?: TemplateResult | typeof nothing
  },
): TemplateResult {
  const t = unsafeStatic(tag)
  return staticHtml`<${t} ${applyOj({ props: cfg.props, attrs: cfg.attrs, events: cfg.events })}>${cfg.children ?? nothing}</${t}>`
}
