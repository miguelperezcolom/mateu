import { describe, it, expect, beforeEach } from 'vitest'
import { checkWireVersion, observeWireVersion, resetWireVersionCheck, wireMismatchMessage } from './wireVersion'

describe('wire version check', () => {

    beforeEach(() => resetWireVersionCheck())

    it('accepts the same major, whatever the minor', () => {
        expect(checkWireVersion('3.0')).toEqual({ ok: true })
        expect(checkWireVersion('3.7')).toEqual({ ok: true })
    })

    it('rejects another major, newer or older', () => {
        expect(checkWireVersion('4.0')).toEqual({ ok: false, serverMajor: 4, received: '4.0' })
        expect(checkWireVersion('2.9')).toMatchObject({ ok: false, serverMajor: 2 })
    })

    it('accepts a response without the field (an older backend) and garbage', () => {
        expect(checkWireVersion(undefined)).toEqual({ ok: true })
        expect(checkWireVersion('')).toEqual({ ok: true })
        expect(checkWireVersion('banana')).toEqual({ ok: true })
        expect(checkWireVersion(3)).toEqual({ ok: true })
    })

    it('names both majors in the message', () => {
        const message = wireMismatchMessage(4)
        expect(message).toContain('4.x')
        expect(message).toContain('3.x')
    })

    it('reports a mismatch once per page and keeps going', () => {
        const seen: string[] = []
        const report = (m: string) => seen.push(m)
        expect(observeWireVersion({ wireVersion: '4.0', fragments: [] }, report).ok).toBe(false)
        expect(observeWireVersion({ wireVersion: '4.0' }, report).ok).toBe(false)
        expect(seen).toHaveLength(1)
    })

    it('does not report a matching or missing version', () => {
        const seen: string[] = []
        observeWireVersion({ wireVersion: '3.0' }, (m) => seen.push(m))
        observeWireVersion({ fragments: [] }, (m) => seen.push(m))
        observeWireVersion(null, (m) => seen.push(m))
        expect(seen).toHaveLength(0)
    })
})
