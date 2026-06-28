import { componentRenderer } from '@infra/ui/renderers/ComponentRenderer.ts'
import { SldsComponentRenderer } from './SldsComponentRenderer.ts'

// Must run BEFORE mateu-ui is imported/upgraded: mateu-ui.createRenderRoot() checks
// mustUseShadowRoot() at render time, and the <mateu-ui> already in index.html upgrades
// synchronously the moment the element is defined (during the mateu-ui import). So the flag
// has to be false first, otherwise the whole component tree renders inside mateu-ui's shadow
// root and the global SLDS stylesheet (slds-* classes + --slds hooks) never reaches our markup.
componentRenderer.set(new SldsComponentRenderer())
componentRenderer.setUseShadowRoot(false)
