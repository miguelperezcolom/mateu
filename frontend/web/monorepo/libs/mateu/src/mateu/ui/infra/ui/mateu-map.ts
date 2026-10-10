import { css, html, LitElement, PropertyValues } from "lit";
import { customElement, property, query } from 'lit/decorators.js';
import type OlMap from "ol/Map";
import { planMapView } from "./mapPosition";
import type { MapMarker } from "@mateu/shared/apiClients/dtos/componentmetadata/Map";

/** Pin colour when a marker declares none (Redwood's brand red reads on any tile). */
const DEFAULT_PIN = '#c74634'

/**
 * <mateu-map> — design-system-neutral map component (renderer parity phase 2).
 *
 * Wraps OpenLayers directly (the same engine vaadin-map wraps) with an OSM tile layer, so the
 * Map component no longer depends on the commercially-licensed vaadin-map element and renders
 * the same under every renderer. OpenLayers (~1 MB) is lazy-loaded so it stays out of the
 * initial bundle, mirroring mateu-bpmn/mateu-chart.
 *
 * Markers are drawn on a vector layer: a pin in the marker's colour with its label beside it, the
 * description on hover, and — when `markerActionId` is set — a click dispatches the standard
 * `action-requested` with the marker id in `parameters._markerId`. With markers and no position
 * the view fits them (planMapView).
 */
@customElement('mateu-map')
export class MateuMap extends LitElement {

    /** "lat, lon" (free-form wire string; falls back to the markers, then to a world view). */
    @property()
    position: string | undefined

    @property()
    zoom: string | undefined

    @property({ attribute: false })
    markers: MapMarker[] = []

    @property()
    markerActionId: string | undefined

    @query('#map')
    private mapElement!: HTMLDivElement;

    private map: OlMap | undefined;
    private renderSeq = 0;

    protected updated(_changedProperties: PropertyValues) {
        super.updated(_changedProperties);
        this.createMap()
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.map?.setTarget(undefined)
        this.map = undefined
    }

    private async createMap() {
        const seq = ++this.renderSeq
        const [
            { default: Map }, { default: View }, { default: TileLayer }, { default: OSM }, { fromLonLat, transformExtent },
            { default: VectorLayer }, { default: VectorSource }, { default: Feature }, { default: Point },
            { default: Style }, { default: CircleStyle }, { default: Fill }, { default: Stroke }, { default: Text },
            { default: olCss },
        ] = await Promise.all([
            import("ol/Map"),
            import("ol/View"),
            import("ol/layer/Tile"),
            import("ol/source/OSM"),
            import("ol/proj"),
            import("ol/layer/Vector"),
            import("ol/source/Vector"),
            import("ol/Feature"),
            import("ol/geom/Point"),
            import("ol/style/Style"),
            import("ol/style/Circle"),
            import("ol/style/Fill"),
            import("ol/style/Stroke"),
            import("ol/style/Text"),
            // @ts-ignore vite `?inline` CSS import (resolves to a string); ships no types
            import("ol/ol.css?inline"),
        ])
        // the properties may have changed (or the element been detached) while loading
        if (seq !== this.renderSeq || !this.isConnected) {
            return
        }
        if (!this.shadowRoot!.querySelector('style[data-ol]')) {
            const style = document.createElement('style')
            style.setAttribute('data-ol', '')
            style.textContent = olCss
            this.shadowRoot!.appendChild(style)
        }
        if (this.map) {
            this.map.setTarget(undefined)
            this.map = undefined
        }
        const markers = this.markers ?? []
        const features = markers.map(marker => {
            const feature = new Feature({ geometry: new Point(fromLonLat([marker.longitude, marker.latitude])) })
            feature.setId(marker.id)
            feature.set('marker', marker)
            feature.setStyle(new Style({
                image: new CircleStyle({
                    radius: 8,
                    fill: new Fill({ color: marker.color || DEFAULT_PIN }),
                    stroke: new Stroke({ color: '#ffffff', width: 2 }),
                }),
                text: marker.label ? new Text({
                    text: marker.label,
                    offsetX: 12,
                    textAlign: 'left',
                    font: '600 13px system-ui, sans-serif',
                    fill: new Fill({ color: '#1a1a1a' }),
                    stroke: new Stroke({ color: '#ffffff', width: 3 }),
                }) : undefined,
            }))
            return feature
        })
        const plan = planMapView(this.position, this.zoom, markers)
        const view = plan.kind === 'center'
            ? new View({ center: fromLonLat([plan.center.lon, plan.center.lat]), zoom: plan.zoom })
            : new View({ center: fromLonLat([0, 0]), zoom: 2 })
        this.map = new Map({
            target: this.mapElement,
            layers: [
                new TileLayer({ source: new OSM() }),
                new VectorLayer({ source: new VectorSource({ features }) }),
            ],
            view,
        })
        if (plan.kind === 'fit') {
            view.fit(transformExtent([plan.min.lon, plan.min.lat, plan.max.lon, plan.max.lat], 'EPSG:4326', 'EPSG:3857'),
                { padding: [48, 160, 48, 48], maxZoom: 16 })
        }
        const map = this.map
        const markerAt = (pixel: number[]) =>
            map.forEachFeatureAtPixel(pixel, f => f.get('marker') as MapMarker | undefined)
        map.on('pointermove', event => {
            const marker = markerAt(event.pixel)
            this.mapElement.style.cursor = marker && this.markerActionId ? 'pointer' : ''
            this.mapElement.title = marker ? [marker.label, marker.description].filter(Boolean).join('\n') : ''
        })
        map.on('singleclick', event => {
            const marker = markerAt(event.pixel)
            if (!marker || !this.markerActionId) {
                return
            }
            this.dispatchEvent(new CustomEvent('action-requested', {
                detail: { actionId: this.markerActionId, parameters: { _markerId: marker.id } },
                bubbles: true,
                composed: true,
            }))
        })
    }

    render() {
        return html`<div id="map"></div>`
    }

    static styles = css`
        :host {
            display: block;
            width: 100%;
            height: 25rem;
        }
        #map {
            width: 100%;
            height: 100%;
        }
    `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-map': MateuMap
    }
}
