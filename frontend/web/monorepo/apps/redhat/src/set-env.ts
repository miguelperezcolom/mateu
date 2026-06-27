import { componentRenderer } from '@infra/ui/renderers/ComponentRenderer'
import { RedhatComponentRenderer } from './RedhatComponentRenderer.ts'

// Must run BEFORE mateu-ui is imported/upgraded: mateu-ui.createRenderRoot() checks
// mustUseShadowRoot() at render time, so the flag has to be false first for the whole
// component tree to render in the light DOM (where the global PatternFly stylesheet reaches it).
componentRenderer.set(new RedhatComponentRenderer())
componentRenderer.setUseShadowRoot(false)
