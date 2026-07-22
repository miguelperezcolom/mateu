/**
 * Central registration of the Vaadin custom elements the Vaadin renderer may render (previously
 * imported for their side effect by the shared mateu-component host). Keeping them here — imported
 * once by the Vaadin app's entry — means the core (libs/mateu) no longer pulls `@vaadin` in for
 * registration, while the Vaadin app still has every element defined regardless of which renderer
 * emits it. Redundant with the adapter renderers' own registration imports, which is harmless.
 */
import '@vaadin/horizontal-layout'
import '@vaadin/vertical-layout'
import '@vaadin/form-layout'
import '@vaadin/form-layout/vaadin-form-row.js'
import '@vaadin/form-layout/vaadin-form-item.js'
import '@vaadin/split-layout'
import '@vaadin/master-detail-layout'
import '@vaadin/app-layout'
import '@vaadin/app-layout/vaadin-drawer-toggle'
import '@vaadin/tabs'
import '@vaadin/tabs/vaadin-tab'
import '@vaadin/tabsheet'
import '@vaadin/card'
import '@vaadin/menu-bar'
import '@vaadin/progress-bar'
import '@vaadin/scroller'
import '@vaadin/accordion'
import '@vaadin/avatar'
import '@vaadin/avatar-group'
import '@vaadin/combo-box'
import '@vaadin/radio-group'
import '@vaadin/checkbox-group'
import '@vaadin/select'
import '@vaadin/multi-select-combo-box'
import '@vaadin/confirm-dialog'
import '@vaadin/context-menu'
import '@vaadin/dialog'
import '@vaadin/notification'
import '@vaadin/icons'                              // the `vaadin:` iconset
import '@vaadin/vaadin-lumo-styles/vaadin-iconset'  // the `lumo:` iconset (e.g. lumo:search, lumo:cross)
import '@vaadin/icon'
import '@vaadin/button'
import '@vaadin/popover'
import '@vaadin/tooltip'
import '@vaadin/message-input'
import '@vaadin/message-list'
import '@vaadin/custom-field'
import '@vaadin/grid'
import '@vaadin/grid/vaadin-grid-tree-column.js'
import '@vaadin/virtual-list'
import '@vaadin/board'
import '@vaadin/text-field'
import '@vaadin/side-nav'
import '@vaadin/details'

// Vaadin master-detail-layout feature flag. Lives HERE (the Vaadin adapter), not in the neutral
// core — importing '@vaadin/*' above defines window.Vaadin, so the flag is safe to set now. Moved
// out of mateu-ux.ts as part of keeping the core 0-Vaadin (a non-Vaadin renderer crashed on it).
{
  const V = (window as any).Vaadin
  if (V) (V.featureFlags ??= {}).masterDetailLayoutComponent = true
}
