import { nothing, type ElementPart } from 'lit'
import { Directive, directive, PartType, type PartInfo } from 'lit/directive.js'

/** Wire page-width value (data-page-width on <mateu-ux>) → oj-sp-simple-ui-shell pageLayout enum. */
const WIRE_TO_PAGELAYOUT: Record<string, string> = {
  fixed: 'fixedWidth',
  full: 'fullWidth',
  edge: 'edgeToEdge',
}

const SETUP = Symbol('pageLayoutSyncSetup')

/**
 * Element directive for the `oj-sp-simple-ui-shell`: keeps its `pageLayout` in sync with the RDS
 * page-width the core resolves per route and stamps as `data-page-width` on the descendant
 * <mateu-ux> (which lives in the same render root as the shell). Set up once per shell element;
 * a MutationObserver tracks the attribute across navigations.
 */
class PageLayoutSyncDirective extends Directive {
  constructor(partInfo: PartInfo) {
    super(partInfo)
    if (partInfo.type !== PartType.ELEMENT) throw new Error('pageLayoutSync is an element directive')
  }

  render(): typeof nothing {
    return nothing
  }

  update(part: ElementPart): typeof nothing {
    const shell = part.element as HTMLElement & { pageLayout?: string; [SETUP]?: boolean }
    if (shell[SETUP]) return nothing
    shell[SETUP] = true

    const findUx = (): Element | null => shell.querySelector('mateu-ux')
    const read = () => {
      const mode = findUx()?.getAttribute('data-page-width') // 'fixed' | 'full' | 'edge'
      const layout = mode ? WIRE_TO_PAGELAYOUT[mode] : undefined
      if (layout) shell.pageLayout = layout
      // The content cap element reads the shell's width VARS; drive them directly for full/edge since
      // the shell's own pageLayout override doesn't always reach slotted content post-mount.
      const pc = shell.querySelector('.oj-sp-rw-ask-oracle-page-container') as HTMLElement | null
      if (pc && layout) {
        if (layout === 'fullWidth' || layout === 'edgeToEdge') {
          pc.style.setProperty('--oj-sp-simple-uishell-max-content-width', '100%')
          pc.style.setProperty('--oj-sp-simple-uishell-max-content-width-margin', '0')
          pc.style.setProperty('--oj-sp-simple-uishell-max-content-width-padding', layout === 'edgeToEdge' ? '0' : '24px')
        } else {
          pc.style.removeProperty('--oj-sp-simple-uishell-max-content-width')
          pc.style.removeProperty('--oj-sp-simple-uishell-max-content-width-margin')
          pc.style.removeProperty('--oj-sp-simple-uishell-max-content-width-padding')
        }
      }
    }

    let observer: MutationObserver | undefined
    let ticks = 0
    const timer = setInterval(() => {
      const ux = findUx()
      if (ux && !observer) {
        observer = new MutationObserver(read)
        observer.observe(ux, { attributes: true, attributeFilter: ['data-page-width'] })
        read()
      }
      if (observer || ++ticks > 60) clearInterval(timer)
    }, 250)
    return nothing
  }
}

export const pageLayoutSync = directive(PageLayoutSyncDirective)
