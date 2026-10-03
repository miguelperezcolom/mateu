/**
 * Which design system the canvas paints with. The editor itself is renderer-neutral (it edits the
 * catalog, never a DS's components); the CANVAS, though, is a preview, and a preview is only worth
 * trusting when it looks like what ships. So the canvas can render with:
 *
 *  - `vaadin` — the Vaadin/Lumo reference renderer (apps/vaadin), the one a Mateu app serves by
 *    default. Loaded lazily, so an editor session that never asks for it never downloads it.
 *  - `neutral` — the DS-neutral BasicComponentRenderer (plain HTML), the shape every other renderer
 *    starts from; handy to see the structure without a design system in the way.
 *
 * Redwood cannot run inside the editor: its runtime (JET / visual-runtime) is loaded from Oracle's
 * CDN by a whole VB app, not by a component renderer — preview Redwood against the running app.
 */
import { componentRenderer, ComponentRenderer } from '@infra/ui/renderers/ComponentRenderer.ts'
import { BasicComponentRenderer } from '@infra/ui/renderers/BasicComponentRenderer.ts'
import { registerNeutralNotifier } from '@infra/notify/neutralNotifier.ts'

export type CanvasRendererId = 'vaadin' | 'neutral'

export const CANVAS_RENDERERS: CanvasRendererId[] = ['vaadin', 'neutral']

export const CANVAS_RENDERER_LABELS: Record<CanvasRendererId, string> = {
    vaadin: 'Vaadin (Lumo)',
    neutral: 'DS-neutral',
}

/** A concrete DS-neutral renderer (BasicComponentRenderer implements the whole surface). */
class NeutralRenderer extends BasicComponentRenderer {}

const neutral = new NeutralRenderer()
let vaadin: ComponentRenderer | undefined
let current: CanvasRendererId = 'neutral'

/** Install the DS-neutral renderer synchronously — the editor's boot default until a choice loads. */
export function installNeutralRenderer() {
    componentRenderer.set(neutral)
    registerNeutralNotifier()
    current = 'neutral'
}

/** Switch the canvas renderer. Resolves once the renderer is installed (the Vaadin one loads lazily). */
export async function useCanvasRenderer(id: CanvasRendererId): Promise<CanvasRendererId> {
    if (id === 'vaadin') {
        try {
            if (!vaadin) vaadin = (await import('./vaadinCanvasRenderer')).createVaadinRenderer()
            componentRenderer.set(vaadin)
            current = 'vaadin'
            return current
        } catch (e) {
            // A host that cannot load the chunk keeps a working (neutral) canvas rather than a dead one.
            console.warn('mateu visual editor: the Vaadin renderer could not load, staying DS-neutral', e)
        }
    }
    componentRenderer.set(neutral)
    registerNeutralNotifier()
    current = 'neutral'
    return current
}

export function currentCanvasRenderer(): CanvasRendererId {
    return current
}

export function parseCanvasRenderer(value: string | null | undefined): CanvasRendererId {
    return value === 'neutral' ? 'neutral' : 'vaadin'
}
