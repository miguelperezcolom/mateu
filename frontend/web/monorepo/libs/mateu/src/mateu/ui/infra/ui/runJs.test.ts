// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { configureRunJs, resetRunJs, runJs, runJsAllowed } from './runJs'

afterEach(() => {
    resetRunJs()
    document.head.innerHTML = ''
    vi.restoreAllMocks()
})

describe('RunJS opt-in', () => {
    it('is off by default: the code does not run and a warning says why', () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        const target = { ran: false }
        expect(runJsAllowed()).toBe(false)
        expect(runJs('state.ran = true', { state: target })).toBe(false)
        expect(target.ran).toBe(false)
        expect(warn).toHaveBeenCalledTimes(1)
        runJs('state.ran = true', { state: target })
        expect(warn).toHaveBeenCalledTimes(1) // warns once
    })

    it('runs statements when enabled by the meta tag', () => {
        const meta = document.createElement('meta')
        meta.name = 'mateu-allow-run-js'
        meta.content = 'true'
        document.head.appendChild(meta)
        const target = { ran: false }
        expect(runJs('state.ran = true', { state: target })).toBe(true)
        expect(target.ran).toBe(true)
    })

    it('configureRunJs wins over the meta tag', () => {
        configureRunJs(true)
        const target = { n: 0 }
        runJs('state.n++; state.n++', { state: target })
        expect(target.n).toBe(2)
        configureRunJs(false)
        vi.spyOn(console, 'warn').mockImplementation(() => {})
        expect(runJs('state.n++', { state: target })).toBe(false)
    })
})
