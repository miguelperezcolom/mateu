import { describe, expect, it } from 'vitest'
import { pageColumnCap, serverSideStyle } from './renderComponent'

describe('serverSideStyle (a centred column takes the width it is given)', () => {
    it('gives a centred, capped column a full width so it can shrink to the viewport', () => {
        expect(serverSideStyle('max-width: 900px; margin: auto;')).toBe('width: 100%; box-sizing: border-box; max-width: var(--mateu-page-column-cap, 900px); margin: auto;')
        expect(serverSideStyle('max-width:900px;margin: 0 auto;')).toContain('width: 100%')
    })
    it('lets a full or edge page lift the DEFAULT 900px column, and keeps any other cap', () => {
        expect(serverSideStyle('max-width:900px;margin: auto;')).toContain('max-width: var(--mateu-page-column-cap, 900px)')
        expect(serverSideStyle('max-width: 40rem; margin: auto;')).toContain('max-width: 40rem')
        expect(pageColumnCap('max-width:900px;margin: auto;display: block;')).toBe('max-width: var(--mateu-page-column-cap, 900px);margin: auto;display: block;')
    })
    it('leaves any other style alone', () => {
        expect(serverSideStyle(undefined)).toBeUndefined()
        expect(serverSideStyle('flex: 1;')).toBe('flex: 1;')
        expect(serverSideStyle('width: 20rem; max-width: 900px; margin: auto;')).toBe('width: 20rem; max-width: 900px; margin: auto;')
    })
})
