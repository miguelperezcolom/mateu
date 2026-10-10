import { describe, expect, it } from 'vitest'
import { serverSideStyle } from './renderComponent'

describe('serverSideStyle (a centred column takes the width it is given)', () => {
    it('gives a centred, capped column a full width so it can shrink to the viewport', () => {
        expect(serverSideStyle('max-width: 900px; margin: auto;')).toBe('width: 100%; box-sizing: border-box; max-width: 900px; margin: auto;')
        expect(serverSideStyle('max-width:900px;margin: 0 auto;')).toContain('width: 100%')
    })
    it('leaves any other style alone', () => {
        expect(serverSideStyle(undefined)).toBeUndefined()
        expect(serverSideStyle('flex: 1;')).toBe('flex: 1;')
        expect(serverSideStyle('width: 20rem; max-width: 900px; margin: auto;')).toBe('width: 20rem; max-width: 900px; margin: auto;')
    })
})
