import { css, html, LitElement, PropertyValues } from "lit";
import { customElement, property, query } from 'lit/decorators.js';
import type OlMap from "ol/Map";
import { DEFAULT_CENTER, parsePosition, parseZoom } from "./mapPosition";

/**
 * <mateu-map> — design-system-neutral map component (renderer parity phase 2).
 *
 * Wraps OpenLayers directly (the same engine vaadin-map wraps) with an OSM tile layer, so the
 * Map component no longer depends on the commercially-licensed vaadin-map element and renders
 * the same under every renderer. OpenLayers (~1 MB) is lazy-loaded so it stays out of the
 * initial bundle, mirroring mateu-bpmn/mateu-chart/mateu-workflow-elk.
 */
@customElement('mateu-map')
export class MateuMap extends LitElement {

    /** "lat, lon" (free-form wire string; falls back to a world view when unparsable). */
    @property()
    position: string | undefined

    @property()
    zoom: string | undefined

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
        const [{ default: Map }, { default: View }, { default: TileLayer }, { default: OSM }, { fromLonLat }, { default: olCss }] =
            await Promise.all([
                import("ol/Map"),
                import("ol/View"),
                import("ol/layer/Tile"),
                import("ol/source/OSM"),
                import("ol/proj"),
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
        const center = parsePosition(this.position) ?? DEFAULT_CENTER
        this.map = new Map({
            target: this.mapElement,
            layers: [new TileLayer({ source: new OSM() })],
            view: new View({
                center: fromLonLat([center.lon, center.lat]),
                zoom: parseZoom(this.zoom),
            }),
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
