/**
 * The page `scripts/thumbnails.mjs` screenshots: the editor's OWN canvas, painting one component at a
 * time with the chosen renderer — so a palette thumbnail is exactly what the canvas will show once the
 * component is dropped, never a drawing that could drift from it.
 */
import '@infra/ui/mateu-ux.ts'
import { stringify } from 'yaml'
import { installNeutralRenderer, useCanvasRenderer, CanvasRendererId } from '../canvas/canvasRenderer'
import '../canvas/editor-canvas'
import { SCHEMA } from '../model/schemaCatalog'
import { parsePage } from '../model/pageModel'
import { NO_THUMBNAIL, thumbnailSample } from '../model/thumbnailSamples'

installNeutralRenderer()

type Canvas = HTMLElement & { doc?: unknown; clientRender: boolean; baseUrl: string; renderer: CanvasRendererId }

/** How the canvas painted the last sample: 'ok' = the backend, 'client'/'fallback' = in the browser. */
let lastStatus = ''
addEventListener('preview-status', (e) => { lastStatus = (e as CustomEvent).detail?.kind ?? '' }, true)

declare global {
    interface Window {
        thumbs: {
            types(): string[]
            /** `backend`: render through the server's `__preview__` (proxied same-origin), as what ships does. */
            use(renderer: CanvasRendererId, backend: boolean): Promise<void>
            show(type: string): void
            status(): string
            /** The components that deliberately have no thumbnail. */
            skipped(): Record<string, string>
        }
    }
}

const canvas = () => document.getElementById('canvas') as Canvas

window.thumbs = {
    types: () => [...SCHEMA.components.keys()].sort(),
    async use(renderer, backend) {
        const got = await useCanvasRenderer(renderer)
        canvas().baseUrl = ''
        canvas().clientRender = !backend
        canvas().renderer = got
    },
    status: () => lastStatus,
    skipped: () => ({ ...NO_THUMBNAIL }),
    show(type) {
        lastStatus = ''
        const spec = SCHEMA.components.get(type)
        if (!spec) throw new Error('unknown component ' + type)
        // The sample is the only child, so the renderer stamps it `ve-0` — the element to capture.
        canvas().doc = parsePage(stringify({ type: 'VerticalLayout', padding: true, content: [thumbnailSample(spec)] }))
    },
}
