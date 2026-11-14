import { afterEach, describe, expect, it, vi } from 'vitest'
import {
    drawsHeader, forgetShell, headerOnScreen, noteShell, onPlacementChange, resetSignOutPlacement,
    signOutCornerShown,
} from './signOutPlacement.ts'

afterEach(() => resetSignOutPlacement())

describe('where Sign out is offered', () => {
    it('an ordinary shell draws the header; a MEDIATOR or chromeless one does not', () => {
        expect(drawsHeader({ variant: 'MENU_ON_TOP' })).toBe(true)
        expect(drawsHeader({ variant: 'MEDIATOR' })).toBe(false)
        expect(drawsHeader({ variant: 'TABS', chromeless: true })).toBe(false)
        expect(drawsHeader(undefined)).toBe(false)
    })

    it('the page offers its own button only with a session and no header on screen', () => {
        expect(signOutCornerShown(true, false)).toBe(true)
        expect(signOutCornerShown(true, true)).toBe(false)
        expect(signOutCornerShown(false, false)).toBe(false)
    })

    it('tracks the shells that draw a header, by identity, until they leave', () => {
        const shell = {}, nested = {}
        noteShell(nested, false)
        expect(headerOnScreen()).toBe(false)
        noteShell(shell, true)
        expect(headerOnScreen()).toBe(true)
        noteShell(shell, false) // turned chromeless
        expect(headerOnScreen()).toBe(false)
        noteShell(shell, true)
        forgetShell(shell)
        expect(headerOnScreen()).toBe(false)
    })

    it('tells its listeners about changes only', () => {
        const listener = vi.fn()
        onPlacementChange(listener)
        const shell = {}
        noteShell(shell, true)
        noteShell(shell, true) // a re-render that changes nothing
        forgetShell({}) // a shell never noted
        forgetShell(shell)
        expect(listener).toHaveBeenCalledTimes(2)
    })
})
