import { RedwoodSpectraComponentRenderer } from './RedwoodSpectraComponentRenderer.ts'
import { componentRenderer } from '@infra/ui/renderers/ComponentRenderer.ts'
import { MateuUi } from '@infra/ui/mateu-ui.ts'
import { MateuUx } from '@infra/ui/mateu-ux.ts'
import { MateuComponent } from '@infra/ui/mateu-component.ts'
import { MateuApp } from '@infra/ui/mateu-app.ts'
import { MateuTableCrud } from '@infra/ui/mateu-table-crud.ts'

// Register the Redwood Spectra renderer with the shared runtime. Light DOM (no shadow root) so the
// Oracle Redwood global CSS (loaded from the CDN in index.html) reaches the rendered tree.
componentRenderer.set(new RedwoodSpectraComponentRenderer())
componentRenderer.setUseShadowRoot(false)

// Light-DOM trade-off: the shared shell elements above honour setUseShadowRoot(false) by rendering
// into themselves, which makes Lit DROP their static styles (they were written for their shadow
// roots). Re-adopt those exact stylesheets globally so the shell keeps its structure; the Lumo
// custom properties inside them resolve to the Redwood palette via the bridge in index.css, and
// our own rules afterwards override the shell into the Redwood look (charcoal sidebar etc.).
const adoptStaticStyles = (ctor: unknown, name: string) => {
  const styles = (ctor as { styles?: unknown }).styles
  if (!styles) return
  const list = Array.isArray(styles) ? styles : [styles]
  const text = list
    .map(s => (s as { cssText?: string }).cssText ?? String(s))
    .join('\n')
  if (!text.trim()) return
  const el = document.createElement('style')
  el.setAttribute('data-mateu-adopted', name)
  el.textContent = text
  document.head.appendChild(el)
}

adoptStaticStyles(MateuUi, 'mateu-ui')
adoptStaticStyles(MateuUx, 'mateu-ux')
adoptStaticStyles(MateuComponent, 'mateu-component')
adoptStaticStyles(MateuApp, 'mateu-app')
adoptStaticStyles(MateuTableCrud, 'mateu-table-crud')
