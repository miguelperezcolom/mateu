// @vitest-environment jsdom
// The pager's "N items" is the UI's language (chromeTexts), with the singular for one item — it
// was hard-coded English under a Spanish or German page.
import { afterEach, describe, expect, it } from 'vitest'
import './mateu-pagination'

const totalOf = async (totalElements: number, lang: string): Promise<string> => {
    document.documentElement.lang = lang
    const el = document.createElement('mateu-pagination') as HTMLElement & {
        totalElements: number
        pageSize: number
        pageNumber: number
        updateComplete: Promise<boolean>
    }
    el.totalElements = totalElements
    el.pageSize = 10
    el.pageNumber = 0
    document.body.appendChild(el)
    await el.updateComplete
    return el.shadowRoot?.querySelector('.total-count')?.textContent?.trim() ?? ''
}

describe('mateu-pagination total', () => {
    afterEach(() => {
        document.body.innerHTML = ''
        document.documentElement.lang = ''
    })

    it('counts in the page language', async () => {
        expect(await totalOf(57, 'en')).toBe('57 items')
        expect(await totalOf(1, 'en')).toBe('1 item')
        expect(await totalOf(57, 'es-ES')).toBe('57 elementos')
        expect(await totalOf(1, 'de')).toBe('1 Eintrag')
        expect(await totalOf(3, 'pt-BR')).toBe('3 itens')
    })
})
