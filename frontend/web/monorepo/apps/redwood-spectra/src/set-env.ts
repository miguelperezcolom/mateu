import { RedwoodSpectraComponentRenderer } from './RedwoodSpectraComponentRenderer.ts'
import { componentRenderer } from '@infra/ui/renderers/ComponentRenderer.ts'

// Register the Redwood Spectra renderer with the shared runtime. Light DOM (no shadow root) so the
// Oracle Redwood global CSS (loaded from the CDN in index.html) reaches the rendered tree.
componentRenderer.set(new RedwoodSpectraComponentRenderer())
componentRenderer.setUseShadowRoot(false)
