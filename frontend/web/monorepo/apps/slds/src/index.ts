import '@infra/ui/mateu-ui'
import { componentRenderer } from '@infra/ui/renderers/ComponentRenderer.ts'
import { SldsComponentRenderer } from './SldsComponentRenderer.ts'

componentRenderer.set(new SldsComponentRenderer())
// SLDS ships global CSS (slds-* classes + --slds hooks); render in light DOM so it reaches our markup.
componentRenderer.setUseShadowRoot(false)
