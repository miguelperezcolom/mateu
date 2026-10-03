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
})
