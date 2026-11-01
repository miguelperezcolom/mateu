// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { LitElement, render } from 'lit'
import type ClientSideComponent from '@mateu/shared/apiClients/dtos/ClientSideComponent'
import { interpolateFields } from '@infra/ui/interpolation.ts'
import { renderHeroSection } from './heroRenderer'
import { renderMetricCard } from './dashboardRenderer'
import { renderStat } from './statRenderer'
import { renderEntityHeader } from './entityHeaderRenderer'
import { renderAnchor } from './anchorRenderer'
import { renderAvatar } from './avatarRenderer'

/**
 * The components that draw their texts straight from the metadata interpolate `${state.x}` like
 * everything else (Redwood always did): a YAML record page — `title: ${state.name}` on a route with
 * `data:` — showed the raw template in the Welcome / MultimediaContentPage banner, a MetricCard, an
 * EntityHeader, an Anchor, and requested an Avatar's `image: ${state.thumbnail}` literally (a 404).
 */
const state = {
    name: 'Artemis III', program: 'Artemis', summary: 'Crewed landing', photo: '/img/a3.jpg',
    budget: 1200, visitors: 37, url: 'https://example.test/a3', thumbnail: '/img/t.jpg',
}
const component = (metadata: Record<string, unknown>) =>
    ({ type: 'ClientSide', id: 'c', metadata, children: [] }) as unknown as ClientSideComponent
const draw = (t: unknown) => {
    const host = document.createElement('div')
    render(t, host)
    return host
}

describe('${state.x} in the components drawn from their metadata', () => {
    it('the hero (Welcome / MultimediaContentPage banner): overline, title, subtitle and image', () => {
        const hero = draw(renderHeroSection({} as LitElement, component({
            type: 'HeroSection', overline: '${state.program}', title: '${state.name}',
            subtitle: '${state.summary}', image: '${state.photo}',
        }), undefined, state, {}, {}, {}))
        expect(hero.querySelector('.mateu-hero-overline')!.textContent).toBe('Artemis')
        expect(hero.querySelector('h1')!.textContent).toBe('Artemis III')
        expect(hero.textContent).toContain('Crewed landing')
        expect(hero.querySelector('.mateu-hero-image')!.getAttribute('style')).toContain('url("/img/a3.jpg")')
    })

    it('a MetricCard: title, value, unit and the rest of its texts', () => {
        const card = draw(renderMetricCard(component({
            type: 'MetricCard', title: '${state.name}', value: '${state.budget}', unit: 'USD',
            description: '${state.visitors} visitors',
        }), state, {}))
        expect(card.textContent).toContain('Artemis III')
        expect(card.textContent).toContain('1200')
        expect(card.textContent).toContain('37 visitors')
        expect(card.textContent).not.toContain('${')
        expect(card.querySelector('.mateu-metric-card')!.getAttribute('aria-label')).toBe('Artemis III, 1200 USD, 37 visitors')
    })

    it('a Stat', () => {
        const stat = draw(renderStat(component({ type: 'Stat', label: '${state.name}', value: '${state.visitors}' }), state, {}))
            .querySelector('mateu-stat')!
        expect(stat.getAttribute('label')).toBe('Artemis III')
        expect(stat.getAttribute('value')).toBe('37')
    })

    it('an EntityHeader in the body: title, subtitle, facts, badges and its metric', () => {
        const header = draw(renderEntityHeader(component({
            type: 'EntityHeader', title: '${state.name}', subtitle: '${state.program}',
            facts: [{ label: 'Budget', value: '${state.budget}' }], badges: [{ label: '${state.program}' }],
            metricLabel: 'Visitors', metricValue: '${state.visitors}',
        }), state, {})).querySelector('mateu-entity-header') as unknown as Record<string, any>
        expect(header.title).toBe('Artemis III')
        expect(header.subtitle).toBe('Artemis')
        expect(header.facts[0].value).toBe('1200')
        expect(header.badges[0].label).toBe('Artemis')
        expect(header.metricValue).toBe('37')
    })

    it('an Anchor: its url and its text', () => {
        const a = draw(renderAnchor(component({ type: 'Anchor', url: '${state.url}', text: 'See ${state.name}' }), state, {}))
            .querySelector('a')!
        expect(a.getAttribute('href')).toBe('https://example.test/a3')
        expect(a.textContent).toBe('See Artemis III')
    })

    it("an Avatar's image is fetched from the interpolated URL, not the template", () => {
        const img = draw(renderAvatar(component({ type: 'Avatar', name: '${state.name}', image: '${state.thumbnail}' }), state, {}))
            .querySelector('img')!
        expect(img.getAttribute('src')).toBe('/img/t.jpg')
        expect(img.getAttribute('alt')).toBe('Artemis III')
    })
})

describe('interpolateFields', () => {
    it('interpolates only the named string fields, and never mutates the metadata', () => {
        const metadata = { title: '${state.name}', other: '${state.name}', count: 3 }
        const out = interpolateFields(metadata, ['title', 'count'], state, {})
        expect(out).toEqual({ title: 'Artemis III', other: '${state.name}', count: 3 })
        expect(metadata.title).toBe('${state.name}')
    })

    it('hands the same object back when there is nothing to interpolate', () => {
        const metadata = { title: 'Plain' }
        expect(interpolateFields(metadata, ['title'], state, {})).toBe(metadata)
    })
})
