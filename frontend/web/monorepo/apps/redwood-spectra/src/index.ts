/**
 * Redwood (Oracle JET / Spectra) renderer entry — the ADAPTER route.
 *
 * Unlike the earlier clean-room attempt (its own rw-root/rw-host), this reuses the de-vaadinized
 * neutral core: `mateu-ui` boots it, and we register a `RedwoodComponentRenderer` that overrides
 * only the widgets we re-skin with Oracle `oj-*` components — everything else renders through the
 * core's DS-neutral defaults, so the app is runnable from the first line.
 *
 * Oracle JET / Spectra are loaded from the CDN by oj-bootstrap.ts BEFORE this module's <mateu-ui>
 * is revealed (oj-c-* VComponents need OJET + the preact binding provider ready first).
 */
import './oj-preact' // Oracle oj-c-* preact component CSS (not on the CDN) — styles the form controls.
import '@infra/ui/mateu-ui'
import { componentRenderer } from '@infra/ui/renderers/ComponentRenderer'
import { RedwoodComponentRenderer } from './RedwoodComponentRenderer'

componentRenderer.set(new RedwoodComponentRenderer())
// Render the whole tree in LIGHT DOM (not shadow): Oracle oj-c-* VComponents only upgrade under the
// body's `data-oj-binding-provider="preact"`, which does NOT cross a shadow boundary — so a field
// rendered inside mateu-component's shadow root would never render. (Vaadin keeps the default shadow.)
componentRenderer.setUseShadowRoot(false)
// setNotifier(redwoodNotifier) — optional; the neutral toast (installed by mateu-ui) works until then.
