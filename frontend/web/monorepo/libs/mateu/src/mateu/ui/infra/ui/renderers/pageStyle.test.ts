import { describe, expect, it } from 'vitest'
import { pageStyle } from './pageRenderer'

describe('pageStyle', () => {
    it('takes the width, and lets the page cap it — the default 900px column only on a fixed page', () => {
        expect(pageStyle('max-width:900px;margin: auto;')).toBe('width: 100%; box-sizing: border-box; max-width: var(--mateu-page-column-cap, 900px);margin: auto;')
        expect(pageStyle('max-width: 40rem;')).toContain('max-width: 40rem')
    })
    it('lets a page that sets its own width win, since its style comes after', () => {
        expect(pageStyle('width: 50%;').endsWith('width: 50%;')).toBe(true)
    })
    it('takes the width when the page has no style', () => {
        expect(pageStyle(undefined)).toBe('width: 100%; box-sizing: border-box; ')
    })
})
