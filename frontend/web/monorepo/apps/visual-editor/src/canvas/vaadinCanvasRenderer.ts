/**
 * The Vaadin reference renderer, loaded on demand for the canvas (see canvasRenderer.ts). The same
 * modules the Vaadin app boots with — its custom elements, the Lumo stylesheets and the
 * ComponentRenderer adapter — imported from apps/vaadin so the preview cannot drift from what ships.
 */
import '../../../vaadin/src/vaadinElements'
import '../../../vaadin/src/lumo.js'
import { VaadinComponentRenderer } from '../../../vaadin/src/VaadinComponentRenderer'
import { setNotifier } from '@application/Notifier.ts'
import { vaadinNotifier } from '../../../vaadin/src/VaadinNotifier'
import type { ComponentRenderer } from '@infra/ui/renderers/ComponentRenderer.ts'

export function createVaadinRenderer(): ComponentRenderer {
    setNotifier(vaadinNotifier)
    return new VaadinComponentRenderer()
}
