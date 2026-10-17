// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// OpenLayers draws on a canvas jsdom has not got: a recording stand-in per module, so the test
// sees what the element builds (view, layers, marker features) and can play the map's events.
const ol = vi.hoisted(() => {
    const maps: FakeMap[] = []
    class Base { constructor(public opts?: Record<string, unknown>) {} }
    class FakeMap extends Base {
        handlers: Record<string, (e: { pixel: number[] }) => void> = {}
        target: unknown
        hit: unknown = undefined
        constructor(opts: Record<string, unknown>) { super(opts); this.target = opts.target; maps.push(this) }
        setTarget(t: unknown) { this.target = t }
        on(type: string, cb: (e: { pixel: number[] }) => void) { this.handlers[type] = cb }
        forEachFeatureAtPixel(_pixel: number[], fn: (f: { get: (k: string) => unknown }) => unknown) {
            return this.hit ? fn({ get: () => this.hit }) : undefined
        }
    }
    class View extends Base { fitted: unknown[] | undefined; fit(...a: unknown[]) { this.fitted = a } }
    class Feature extends Base {
        id: unknown; props: Record<string, unknown> = {}; style: unknown
        setId(id: unknown) { this.id = id }
        set(k: string, v: unknown) { this.props[k] = v }
        get(k: string) { return this.props[k] }
        setStyle(s: unknown) { this.style = s }
    }
    return { maps, Base, FakeMap, View, Feature }
})
vi.mock('ol/Map', () => ({ default: ol.FakeMap }))
vi.mock('ol/View', () => ({ default: ol.View }))
vi.mock('ol/layer/Tile', () => ({ default: class extends ol.Base {} }))
vi.mock('ol/source/OSM', () => ({ default: class extends ol.Base {} }))
vi.mock('ol/proj', () => ({ fromLonLat: (c: number[]) => ['m', ...c], transformExtent: (e: number[]) => ['x', ...e] }))
vi.mock('ol/layer/Vector', () => ({ default: class extends ol.Base {} }))
vi.mock('ol/source/Vector', () => ({ default: class extends ol.Base {} }))
vi.mock('ol/Feature', () => ({ default: ol.Feature }))
vi.mock('ol/geom/Point', () => ({ default: class extends ol.Base {} }))
vi.mock('ol/style/Style', () => ({ default: class extends ol.Base {} }))
vi.mock('ol/style/Circle', () => ({ default: class extends ol.Base {} }))
vi.mock('ol/style/Fill', () => ({ default: class extends ol.Base {} }))
vi.mock('ol/style/Stroke', () => ({ default: class extends ol.Base {} }))
vi.mock('ol/style/Text', () => ({ default: class extends ol.Base {} }))
vi.mock('ol/ol.css?inline', () => ({ default: '.ol-viewport{}' }))

import './mateu-map'
import type { MateuMap } from './mateu-map'

/**
 * <mateu-map>: the OpenLayers map with a marker layer; clicking a marker (on the map, or the
 * keyboard-reachable button list) dispatches markerActionId with `_markerId`.
 */
describe('mateu-map (DOM)', () => {
    const MARKERS = [
        { id: 'h1', latitude: 39.57, longitude: 2.65, label: 'Hotel Palma', description: 'Old town', color: '#0a0' },
        { id: 'h2', latitude: 40.41, longitude: -3.70 },
    ]
    let events: { actionId: string, parameters: Record<string, unknown> }[]
    const listener = (e: Event) => events.push((e as CustomEvent).detail)
    const settle = async (el: MateuMap) => { for (let i = 0; i < 5; i++) await new Promise(r => setTimeout(r, 0)); await el.updateComplete }

    const mount = async (props: Partial<MateuMap>) => {
        const el = document.createElement('mateu-map') as MateuMap
        Object.assign(el, props)
        document.body.appendChild(el)
        await el.updateComplete
        await settle(el)
        return el
    }
    const lastMap = () => ol.maps.at(-1)!
    const layers = (m: InstanceType<typeof ol.FakeMap>) => m.opts!.layers as InstanceType<typeof ol.Base>[]
    const features = (m: InstanceType<typeof ol.FakeMap>) =>
        ((layers(m)[1].opts!.source as InstanceType<typeof ol.Base>).opts!.features) as InstanceType<typeof ol.Feature>[]

    beforeEach(() => { events = []; ol.maps.length = 0; document.addEventListener('action-requested', listener) })
    afterEach(() => { document.removeEventListener('action-requested', listener); document.body.innerHTML = '' })

    it('centres on an explicit position and injects the OpenLayers stylesheet once', async () => {
        const el = await mount({ position: '39.5, 2.6', zoom: '10' })
        const view = lastMap().opts!.view as InstanceType<typeof ol.View>
        expect(view.opts).toEqual({ center: ['m', 2.6, 39.5], zoom: 10 })
        expect(view.fitted).toBeUndefined()
        expect(lastMap().target).toBe(el.shadowRoot!.querySelector('#map'))
        el.zoom = '12'
        await el.updateComplete
        await settle(el)
        expect(el.shadowRoot!.querySelectorAll('style[data-ol]')).toHaveLength(1)
        // the previous map was detached before the new one was built
        expect(ol.maps[0].target).toBeUndefined()
    })

    it('with markers and no position it fits them, one feature per marker', async () => {
        await mount({ markers: MARKERS as never })
        const map = lastMap()
        const view = map.opts!.view as InstanceType<typeof ol.View>
        expect(view.fitted![0]).toEqual(['x', -3.70, 39.57, 2.65, 40.41])
        const fs = features(map)
        expect(fs.map(f => f.id)).toEqual(['h1', 'h2'])
        expect(fs[0].get('marker')).toEqual(MARKERS[0])
    })

    it('uses the tile provider the wire names', async () => {
        await mount({ position: '1, 2', tileUrl: 'https://tiles/{z}/{x}/{y}.png', attribution: '© Tiles' })
        const osm = layers(lastMap())[0].opts!.source as InstanceType<typeof ol.Base>
        expect(osm.opts!.url).toBe('https://tiles/{z}/{x}/{y}.png')
    })

    it('a click on a marker dispatches markerActionId; hovering shows its label and description', async () => {
        const el = await mount({ markers: MARKERS as never, markerActionId: 'openHotel' })
        const map = lastMap()
        const mapDiv = el.shadowRoot!.querySelector('#map') as HTMLElement
        map.hit = MARKERS[0]
        map.handlers.pointermove({ pixel: [1, 1] })
        expect(mapDiv.style.cursor).toBe('pointer')
        expect(mapDiv.title).toBe('Hotel Palma\nOld town')
        map.handlers.singleclick({ pixel: [1, 1] })
        expect(events).toEqual([{ actionId: 'openHotel', parameters: { _markerId: 'h1' } }])
        map.hit = undefined
        map.handlers.pointermove({ pixel: [5, 5] })
        expect(mapDiv.style.cursor).toBe('')
        expect(mapDiv.title).toBe('')
        map.handlers.singleclick({ pixel: [5, 5] })
        expect(events).toHaveLength(1)
    })

    it('actionable markers are also keyboard-reachable buttons; without an action there is no list', async () => {
        const el = await mount({ markers: MARKERS as never, markerActionId: 'openHotel' })
        const buttons = Array.from(el.shadowRoot!.querySelectorAll('.marker-list button')) as HTMLButtonElement[]
        expect(buttons.map(b => b.textContent)).toEqual(['Hotel Palma', 'h2'])
        expect(buttons[0].title).toBe('Old town')
        buttons[1].click()
        expect(events).toEqual([{ actionId: 'openHotel', parameters: { _markerId: 'h2' } }])

        document.body.innerHTML = ''
        const plain = await mount({ markers: MARKERS as never })
        expect(plain.shadowRoot!.querySelector('.marker-list')).toBeNull()
        const map = lastMap()
        map.hit = MARKERS[0]
        map.handlers.pointermove({ pixel: [1, 1] })
        expect((plain.shadowRoot!.querySelector('#map') as HTMLElement).style.cursor).toBe('')
        map.handlers.singleclick({ pixel: [1, 1] })
        expect(events).toHaveLength(1)
    })

    it('detaching the element releases the map', async () => {
        const el = await mount({ position: '1, 2' })
        const map = lastMap()
        el.remove()
        expect(map.target).toBeUndefined()
    })
})
