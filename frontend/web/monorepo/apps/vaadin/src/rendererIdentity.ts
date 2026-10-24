// Who calls the server (X-Mateu-Renderer): this renderer's name and its package version. Imported
// FIRST by index.ts, so it is set before mateu-ui can send its first request.
import { setRendererIdentity } from '@infra/http/rendererIdentity.ts'

setRendererIdentity({
    name: 'vaadin',
    version: typeof __MATEU_RENDERER_VERSION__ === 'string' ? __MATEU_RENDERER_VERSION__ : undefined,
})
