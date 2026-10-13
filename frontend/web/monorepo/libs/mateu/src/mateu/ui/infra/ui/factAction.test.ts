// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import './mateu-entity-header'
import './mateu-content-header'
import type { MateuEntityHeader } from './mateu-entity-header'
import type { MateuContentHeader } from './mateu-content-header'
import { hoistLeadingEntityHeader } from './renderers/pageRenderer'
import { ComponentMetadataType } from '@mateu/shared/apiClients/dtos/ComponentMetadataType'

/**
 * An EntityHeader fact can carry an action (the pencil next to "EMPRESA"): an icon-only button
 * right after the value that dispatches `action-requested` {actionId, parameters} exactly like a
 * Button — from the button, bubbling out of the shadow root to the mateu-component. A fact without
 * action stays display-only. Same in the page header the banner is hoisted into.
 */
const plain = { label: 'TOTAL RESERVA', value: '€ 4.890,00' }
const company = {
    label: 'EMPRESA', value: 'Acme Corporation Ltd', actionId: 'changeCompany',
    icon: 'vaadin:pencil', actionLabel: 'Cambiar empresa', parameters: { stayId: 'S-1' },
}

const listen = () => {
    const heard: Array<{ actionId: string, parameters: unknown }> = []
    document.body.addEventListener('action-requested', (e) => heard.push((e as CustomEvent).detail))
    return heard
}

afterEach(() => { document.body.innerHTML = '' })

describe('an EntityHeader fact with an action', () => {
    it('renders an icon button after its value only for the fact that has an action', async () => {
        const el = document.createElement('mateu-entity-header') as MateuEntityHeader
        el.facts = [plain, company]
        document.body.appendChild(el)
        await el.updateComplete

        const facts = Array.from(el.shadowRoot!.querySelectorAll('.fact'))
        expect(facts[0].querySelector('button')).toBeNull()
        const button = facts[1].querySelector('.fact-value-row button.fact-action') as HTMLButtonElement
        expect(button).not.toBeNull()
        // on the value's line, right after it
        expect(button.previousElementSibling?.textContent).toBe('Acme Corporation Ltd')
        expect(button.getAttribute('aria-label')).toBe('Cambiar empresa')
        expect(button.getAttribute('title')).toBe('Cambiar empresa')
    })

    it('dispatches its action with its parameters, out of the shadow root, like a Button', async () => {
        const heard = listen()
        const el = document.createElement('mateu-entity-header') as MateuEntityHeader
        el.facts = [company]
        document.body.appendChild(el)
        await el.updateComplete

        ;(el.shadowRoot!.querySelector('button.fact-action') as HTMLButtonElement).click()
        expect(heard).toEqual([{ actionId: 'changeCompany', parameters: { stayId: 'S-1' } }])
    })

    it('is named after the fact when it has no label of its own', async () => {
        const el = document.createElement('mateu-entity-header') as MateuEntityHeader
        el.facts = [{ label: 'EMPRESA', value: 'Acme', actionId: 'changeCompany' }]
        document.body.appendChild(el)
        await el.updateComplete
        expect(el.shadowRoot!.querySelector('button.fact-action')!.getAttribute('aria-label')).toBe('EMPRESA')
    })
})

describe('a hoisted EntityHeader (the page header)', () => {
    const pageWithHeader = () => ({
        id: 'p', type: 'ClientSide',
        metadata: { type: ComponentMetadataType.Page, title: 'Stay' },
        children: [{
            id: 'stay', type: 'ClientSide',
            metadata: { type: ComponentMetadataType.EntityHeader, title: 'María Fernández', facts: [plain, company] },
            children: [],
        }],
    })

    it('carries the fact action onto its KPI, and a display-only fact gets none', () => {
        const kpis = (hoistLeadingEntityHeader(pageWithHeader() as never).metadata as any).kpis
        expect(kpis[0]).toEqual({ title: 'TOTAL RESERVA', text: '€ 4.890,00' })
        expect(kpis[1]).toMatchObject({
            title: 'EMPRESA', text: 'Acme Corporation Ltd', actionId: 'changeCompany',
            icon: 'vaadin:pencil', actionLabel: 'Cambiar empresa', parameters: { stayId: 'S-1' },
        })
    })

    it('draws the button in the header KPI row and dispatches from there', async () => {
        const heard = listen()
        const metadata = hoistLeadingEntityHeader(pageWithHeader() as never).metadata
        const el = document.createElement('mateu-content-header') as MateuContentHeader
        el.metadata = metadata as never
        document.body.appendChild(el)
        await el.updateComplete

        const pairs = Array.from(el.shadowRoot!.querySelectorAll('.kpi-row .kpi-pair'))
        expect(pairs).toHaveLength(2)
        expect(pairs[0].querySelector('button')).toBeNull()
        const button = pairs[1].querySelector('button.fact-action') as HTMLButtonElement
        expect(button.getAttribute('aria-label')).toBe('Cambiar empresa')
        button.click()
        expect(heard).toEqual([{ actionId: 'changeCompany', parameters: { stayId: 'S-1' } }])
    })

    it('draws it in the right-side KPI cluster too (a page KPI with an action, not below)', async () => {
        const el = document.createElement('mateu-content-header') as MateuContentHeader
        el.metadata = { type: ComponentMetadataType.Page, title: 'Stay',
            kpis: [{ title: 'EMPRESA', text: 'Acme', actionId: 'changeCompany' }] } as never
        document.body.appendChild(el)
        await el.updateComplete
        const fact = el.shadowRoot!.querySelector('.header-fact')!
        expect(fact.querySelector('.fact-value-row button.fact-action')!.getAttribute('aria-label')).toBe('EMPRESA')
    })
})
