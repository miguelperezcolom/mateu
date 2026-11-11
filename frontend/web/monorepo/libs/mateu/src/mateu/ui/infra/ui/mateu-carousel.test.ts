// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest'
import { MateuCarousel, nextSlide } from './mateu-carousel'

describe('nextSlide', () => {
    it('clamps without loop and wraps with it', () => {
        expect(nextSlide(0, -1, 3, false)).toBe(0)
        expect(nextSlide(2, 1, 3, false)).toBe(2)
        expect(nextSlide(2, 1, 3, true)).toBe(0)
        expect(nextSlide(0, -1, 3, true)).toBe(2)
        expect(nextSlide(0, 1, 0, true)).toBe(0)
    })
})

describe('mateu-carousel', () => {
    it('shows one slide at a time and pages with the nav buttons, dots and arrow keys', async () => {
        const el = document.createElement('mateu-carousel') as MateuCarousel
        el.nav = true
        el.dots = true
        for (const t of ['a', 'b', 'c']) {
            const d = document.createElement('div')
            d.textContent = t
            el.appendChild(d)
        }
        document.body.appendChild(el)
        await el.updateComplete
        await el.updateComplete
        const visible = () => Array.from(el.children).filter((c) => !(c as HTMLElement).hidden).map((c) => c.textContent)
        expect(visible()).toEqual(['a'])
        const prev = el.shadowRoot!.querySelector('.prev') as HTMLButtonElement
        expect(prev.disabled).toBe(true)
        ;(el.shadowRoot!.querySelector('.next') as HTMLButtonElement).click()
        await el.updateComplete
        expect(visible()).toEqual(['b'])
        const dots = el.shadowRoot!.querySelectorAll('.dot')
        expect(dots.length).toBe(3)
        ;(dots[2] as HTMLButtonElement).click()
        await el.updateComplete
        expect(visible()).toEqual(['c'])
        el.shadowRoot!.querySelector('.frame')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }))
        await el.updateComplete
        expect(visible()).toEqual(['b'])
        el.remove()
    })
})

describe('mateu-carousel autoplay (WCAG 2.2.2)', () => {
    it('an autoplaying carousel has a visible pause button that stops it, and play resumes', async () => {
        vi.useFakeTimers()
        try {
            const el = document.createElement('mateu-carousel') as MateuCarousel
            el.auto = true
            el.duration = 1000
            for (const t of ['a', 'b', 'c']) {
                const d = document.createElement('div')
                d.textContent = t
                el.appendChild(d)
            }
            document.body.appendChild(el)
            await el.updateComplete
            await el.updateComplete
            const visible = () => Array.from(el.children).filter((c) => !(c as HTMLElement).hidden).map((c) => c.textContent)[0]
            vi.advanceTimersByTime(1000)
            await el.updateComplete
            expect(visible()).toBe('b')
            const play = el.shadowRoot!.querySelector('.play') as HTMLButtonElement
            expect(play.getAttribute('aria-label')).toMatch(/Pause|Pausar/)
            play.click()
            await el.updateComplete
            vi.advanceTimersByTime(5000)
            await el.updateComplete
            expect(visible()).toBe('b')
            expect(play.getAttribute('aria-pressed')).toBe('false')
            play.click()
            await el.updateComplete
            vi.advanceTimersByTime(1000)
            await el.updateComplete
            expect(visible()).toBe('c')
            el.remove()
        } finally { vi.useRealTimers() }
    })
})
