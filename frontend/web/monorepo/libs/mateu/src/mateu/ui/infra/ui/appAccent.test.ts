// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { applyAccent } from './mateu-app'

/** @App(accentColor) reaches the shell as --mateu-accent; with none, nothing changes. */
describe("the app's brand accent", () => {
    it('is set on the shell when the app declares one', () => {
        const host = document.createElement('div')
        applyAccent(host, ' #D2232A ')
        expect(host.style.getPropertyValue('--mateu-accent')).toBe('#D2232A')
    })

    it('is removed when the app no longer declares it, but only if the shell set it', () => {
        const host = document.createElement('div')
        applyAccent(host, 'rgb(210, 35, 42)')
        applyAccent(host, undefined)
        expect(host.style.getPropertyValue('--mateu-accent')).toBe('')
        const styled = document.createElement('div')
        styled.style.setProperty('--mateu-accent', 'green')
        applyAccent(styled, undefined)
        expect(styled.style.getPropertyValue('--mateu-accent')).toBe('green')
    })

    it('ignores a value that is not a plain colour', () => {
        const host = document.createElement('div')
        applyAccent(host, 'red; background: url(x)')
        expect(host.style.getPropertyValue('--mateu-accent')).toBe('')
    })

    it('draws the accent strip as a plain accent band when the app declares no strip image', () => {
        const host = document.createElement('div')
        applyAccent(host, '#464c68')
        expect(host.style.getPropertyValue('--mateu-page-band-h')).toBe('10px')
        expect(host.style.getPropertyValue('--mateu-page-band-image')).toBe('linear-gradient(#464c68, #464c68)')
    })

    it("draws the app's strip image (@App(accentStrip)) when it declares one", () => {
        const host = document.createElement('div')
        applyAccent(host, '#464c68', ' /images/strip-control-plane.svg ')
        expect(host.style.getPropertyValue('--mateu-page-band-image')).toBe('url("/images/strip-control-plane.svg")')
    })

    it('draws no strip with no accent, and removes the one it drew', () => {
        const host = document.createElement('div')
        applyAccent(host, undefined, '/images/strip.svg')
        expect(host.style.getPropertyValue('--mateu-page-band-h')).toBe('')
        applyAccent(host, '#D2232A')
        applyAccent(host, undefined)
        expect(host.style.getPropertyValue('--mateu-page-band-h')).toBe('')
        expect(host.style.getPropertyValue('--mateu-page-band-image')).toBe('')
    })

    it('ignores a strip URL that would end the declaration, falling back to the plain band', () => {
        const host = document.createElement('div')
        applyAccent(host, '#D2232A', 'x"); background: red')
        expect(host.style.getPropertyValue('--mateu-page-band-image')).toBe('linear-gradient(#D2232A, #D2232A)')
    })
})
