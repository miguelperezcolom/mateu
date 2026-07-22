import { nothing, type ElementPart, type TemplateResult } from 'lit'
import { html as staticHtml, unsafeStatic } from 'lit/static-html.js'
import { Directive, directive, PartType, type PartInfo } from 'lit/directive.js'

export interface OjBindings {
  /**
   * Set as JS PROPERTIES on the element — the robust path for Oracle JET custom elements, whose
   * props resolve off the instance after upgrade (an attribute set by Lit can land too early and be
   * missed). Undefined values are skipped.
   */
  props?: Record<string, unknown>
  /**
   * Set as ATTRIBUTES — for dotted JET sub-properties (`display-options.*`) that have no plain
   * property name, and for ordinary html attrs (class/style). Undefined values are removed.
   */
  attrs?: Record<string, string | undefined>
}

/** Element-position directive that applies {props, attrs} to the bound element. */
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
    return nothing
  }
}

const applyOj = directive(ApplyOjDirective)

/**
 * Emit an oj-sp / oj-c element by tag name with props (by property) + attrs (by attribute) + slotted
 * children. The generic driver every page template uses, so the mapping code stays pure data.
 */
export function ojElement(
  tag: string,
  cfg: {
    props?: Record<string, unknown>
    attrs?: Record<string, string | undefined>
    children?: TemplateResult | typeof nothing
  },
): TemplateResult {
  const t = unsafeStatic(tag)
  return staticHtml`<${t} ${applyOj({ props: cfg.props, attrs: cfg.attrs })}>${cfg.children ?? nothing}</${t}>`
}
