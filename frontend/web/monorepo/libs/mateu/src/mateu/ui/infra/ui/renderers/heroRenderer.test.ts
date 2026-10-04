// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { LitElement, render } from 'lit'
import type ClientSideComponent from '@mateu/shared/apiClients/dtos/ClientSideComponent'
import { heroImageCss, renderHeroSection } from './heroRenderer'

/** The hero drawn as Redwood's welcome banner: themed band, text on the start, image on the end, strip at the foot. */
describe('the hero', () => {
    const draw = (metadata: Record<string, unknown>) => {
        const host = document.createElement('div')
        const component = { type: 'ClientSide', id: 'hero', metadata: { type: 'HeroSection', ...metadata }, children: [] } as unknown as ClientSideComponent
        render(renderHeroSection({} as LitElement, component, undefined, {}, {}, {}, {}), host)
        return host.querySelector('.mateu-hero') as HTMLElement
    }

    it("puts the app's hero image on the end side, not as a veiled cover", () => {
        const hero = draw({ title: 'Plano de control', subtitle: 'IA y más', image: '/images/texture.png', centered: true })
        const image = hero.querySelector('.mateu-hero-image') as HTMLElement
        expect(image.getAttribute('style')).toContain('url("/images/texture.png")')
        expect(image.getAttribute('style')).toContain('background-position: right center')
        expect(hero.getAttribute('style')).not.toContain('linear-gradient(rgba(0,0,0,.35)')
        // with an image the text goes to the start side, as in Redwood's banner
        expect((hero.querySelector('.mateu-hero-text') as HTMLElement).getAttribute('style')).toContain('text-align: start')
        expect(hero.querySelector('h1')!.textContent).toBe('Plano de control')
    })

    it("sits on a deep tone of the app's accent and carries the accent strip at its foot", () => {
        const hero = draw({ title: 'Hola' })
        expect(hero.getAttribute('style')).toContain('var(--mateu-accent')
        const strip = hero.querySelector('.mateu-hero-strip') as HTMLElement
        expect(strip.getAttribute('style')).toContain('var(--mateu-page-band-image')
    })

    it('keeps the declared alignment with no image', () => {
        expect((draw({ title: 'Hola' }).querySelector('.mateu-hero-text') as HTMLElement).getAttribute('style')).toContain('text-align: center')
        expect((draw({ title: 'Hola', centered: false }).querySelector('.mateu-hero-text') as HTMLElement).getAttribute('style')).toContain('text-align: start')
    })

    it('ignores an image URL that would end the declaration', () => {
        expect(heroImageCss('x") ; background: red')).toBeUndefined()
        expect(heroImageCss(' /images/a b.png ')).toBe('url("/images/a b.png")')
    })
})
