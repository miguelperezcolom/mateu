import { describe, expect, it } from 'vitest'
import { routeQueryOf } from './routeQuery'

describe('routeQueryOf (MINOR 31)', () => {
    it('drops the login flow\'s artefacts and keeps every other key as written', () => {
        expect(routeQueryOf('?continue')).toBe('')
        expect(routeQueryOf('?continue=')).toBe('')
        expect(routeQueryOf('?page=2&continue&sort=name:asc')).toBe('?page=2&sort=name:asc')
        expect(routeQueryOf('?q=a%20b&status=open')).toBe('?q=a%20b&status=open')
        expect(routeQueryOf('')).toBe('')
        expect(routeQueryOf('?')).toBe('')
        expect(routeQueryOf(undefined)).toBe('')
        expect(routeQueryOf('?%zz=1')).toBe('?%zz=1')
    })
})
