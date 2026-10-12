// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { hasOverlayInside } from './overlayStack'

describe('hasOverlayInside', () => {

    it('finds a dialog opened from a drawer, inside the shadow roots between them', () => {
        const drawer = document.createElement('div')
        const island = document.createElement('div')
        drawer.attachShadow({ mode: 'open' }).appendChild(island)
        const dialog = document.createElement('mateu-dialog') as HTMLElement & { opened?: boolean }
        dialog.opened = true
        island.attachShadow({ mode: 'open' }).appendChild(dialog)
        expect(hasOverlayInside(drawer)).toBe(true)
    })

    it('ignores a closed one still fading out, and an empty host', () => {
        const drawer = document.createElement('div')
        const dialog = document.createElement('mateu-dialog') as HTMLElement & { opened?: boolean }
        dialog.opened = false
        drawer.attachShadow({ mode: 'open' }).appendChild(dialog)
        expect(hasOverlayInside(drawer)).toBe(false)
        expect(hasOverlayInside(document.createElement('div'))).toBe(false)
    })
})
