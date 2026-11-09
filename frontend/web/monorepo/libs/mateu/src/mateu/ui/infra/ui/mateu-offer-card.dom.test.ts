// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import './mateu-offer-card'
import type { MateuOfferCard } from './mateu-offer-card'
import { offerFooterOf } from './mateu-offer-card'

afterEach(() => { document.body.innerHTML = '' })

const mount = async (props: Partial<MateuOfferCard>) => {
    const el = document.createElement('mateu-offer-card') as MateuOfferCard
    Object.assign(el, { title: 'Junior suite', ...props })
    document.body.appendChild(el)
    await el.updateComplete
    return el
}
const footer = (el: MateuOfferCard) => el.shadowRoot!.querySelector('.footer')!

describe('mateu-offer-card', () => {
    it('without an actionId it still shows its price and its CTA — an inert one', async () => {
        const el = await mount({ priceLabel: '+ € 60 / night', actionLabel: 'Upgrade' })
        const button = footer(el).querySelector('button')!
        expect(button.textContent).toContain('Upgrade')
        expect(button.textContent).toContain('+ € 60 / night')
        expect(button.disabled).toBe(true)
        let fired = 0
        el.addEventListener('action-requested', () => fired++)
        button.click()
        expect(fired).toBe(0)
    })

    it('with an actionId the CTA runs it', async () => {
        const el = await mount({ priceLabel: '€ 20', actionLabel: 'Add', actionId: 'add' })
        const seen: string[] = []
        el.addEventListener('action-requested', (e) => seen.push((e as CustomEvent).detail.actionId))
        const button = footer(el).querySelector('button')!
        expect(button.disabled).toBe(false)
        button.click()
        expect(seen).toEqual(['add'])
    })

    it('added shows its addedLabel (and the price) even with no action label', async () => {
        const el = await mount({ priceLabel: '€ 20 / person', added: true, addedLabel: 'Added' })
        const button = footer(el).querySelector('button')!
        expect(button.classList.contains('added')).toBe(true)
        expect(button.textContent).toContain('Added')
        expect(button.textContent).toContain('€ 20 / person')
    })

    it('a price alone is still shown', async () => {
        const el = await mount({ priceLabel: '€ 142' })
        expect(footer(el).textContent).toContain('€ 142')
        expect(footer(el).querySelector('button')).toBeNull()
    })

    it('the footer model', () => {
        expect(offerFooterOf({ current: true, currentLabel: 'Your room', priceLabel: 'x' })).toEqual({ kind: 'current', label: 'Your room' })
        expect(offerFooterOf({})).toBeNull()
        expect(offerFooterOf({ actionLabel: 'Go', actionId: 'go' })).toMatchObject({ kind: 'cta', label: 'Go', enabled: true, added: false })
        expect(offerFooterOf({ added: true, actionLabel: 'Add' })).toMatchObject({ kind: 'cta', label: 'Add', added: true, enabled: false })
    })
})
