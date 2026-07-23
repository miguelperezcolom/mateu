// Code-splitting shared by every renderer app's vite.config (apps/vaadin,
// apps/sapui5, apps/redhat, apps/redwood-oj): keep heavy vendors in their own
// chunks so each entry (assets/mateu-<renderer>.js) stays small. Safe with the
// static serving model: the entry is loaded as <script type="module"
// src="/assets/mateu-<renderer>.js"> and the browser resolves the chunk imports
// relative to that URL (all chunks live in assets/, the copy scripts ship the
// whole dist folder, and the npm package publishes dist/ so the jsdelivr CDN
// use keeps working too).
//
// vendor-highcharts, vendor-diagrams and vendor-chartjs come out as async
// chunks: they are only reached through dynamic import() in libs/mateu (see
// mateu-bpmn.ts, mateu-chart.ts and elementRenderer.ts),
// so they are downloaded only when a screen actually renders a chart/diagram.
// Groups that a renderer does not use simply produce no chunk.
export const vendorChunks = (id: string): string | undefined => {
    if (!id.includes('node_modules')) return undefined
    const parts = id.split('node_modules/').pop()!.split('/')
    const pkg = parts[0].startsWith('@') ? `${parts[0]}/${parts[1]}` : parts[0]
    // self-contained heavy leaves first (no imports back into other groups)
    // @vaadin/charts goes with highcharts (not vendor-vaadin): it is only
    // dynamically imported (elementRenderer.ts), so keeping the wrapper in
    // the same chunk as highcharts makes the whole thing an async chunk.
    if (pkg === 'highcharts' || pkg === '@vaadin/charts') return 'vendor-highcharts'
    if (pkg === 'ol' || pkg.startsWith('ol-')
        || pkg === 'rbush' || pkg === 'quickselect'
        || pkg === 'geotiff' || pkg === 'earcut'
        || pkg === 'pbf' || pkg === 'ieee754' || pkg === 'color-space'
        || pkg === 'color-rgba' || pkg === 'color-parse' || pkg === 'color-name'
        || pkg === 'quick-lru' || pkg === 'web-worker') return 'vendor-ol'
    if (pkg === 'bpmn-js' || pkg === 'diagram-js' || pkg === 'diagram-js-direct-editing'
        || pkg.startsWith('bpmn-') || pkg === 'moddle' || pkg === 'moddle-xml'
        || pkg === 'didi' || pkg === 'saxen' || pkg === 'ids'
        || pkg === 'min-dash' || pkg === 'min-dom' || pkg === 'tiny-svg'
        || pkg === 'path-intersection' || pkg === 'object-refs'
        || pkg === 'component-event' || pkg === 'domify'
        || pkg === 'hammerjs') return 'vendor-diagrams'
    if (pkg === 'chart.js' || pkg === 'chartjs-adapter-date-fns'
        || pkg === 'date-fns' || pkg.startsWith('@kurkle/')
        || pkg === '@ngyewch/chartjs-v4-webcomponent') return 'vendor-chartjs'
    if (pkg.startsWith('@ui5/')) return 'vendor-ui5'
    if (pkg === 'lit' || pkg === 'lit-html' || pkg === 'lit-element'
        || pkg.startsWith('@lit/') || pkg.startsWith('@lit-labs/')) return 'vendor-lit'
    // Vaadin/Polymer web components, plus the packages that import them
    // (keeping them together avoids circular chunks)
    if (pkg.startsWith('@vaadin/') || pkg.startsWith('@vaadin-component-factory/')
        || pkg.startsWith('@polymer/') || pkg === 'lit-vaadin-helpers'
        || pkg.startsWith('@fabricelements/') || pkg.startsWith('@web-comp/')
        || pkg === '@alenaksu/json-viewer') return 'vendor-vaadin'
    return 'vendor'
}
