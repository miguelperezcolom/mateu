import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { parseSchema } from './componentSchema'
import { NO_THUMBNAIL } from './thumbnailSamples'
import { defaultLook, thumbnailTypes, thumbnailUrl } from './thumbnails'

/**
 * Palette thumbnail completeness. Every component of the REAL catalog either has a Vaadin thumbnail
 * or is listed in NO_THUMBNAIL with a reason — so a component added to Mateu fails here until someone
 * regenerates the thumbnails (`node scripts/thumbnails.mjs --backend …`) or decides it has none.
 */
function loadSchema(): any {
    let dir = dirname(fileURLToPath(import.meta.url))
    const rel = 'backend/shared/uidl/uidl-schema.json'
    while (dir !== '/' && !existsSync(resolve(dir, rel))) dir = dirname(dir)
    return JSON.parse(readFileSync(resolve(dir, rel), 'utf-8'))
}

const catalog = [...parseSchema(loadSchema()).components.keys()]

describe('palette thumbnails', () => {
    it('picture every component, or say why not', () => {
        const missing = catalog.filter((t) => !thumbnailUrl('vaadin', t) && !(t in NO_THUMBNAIL))
        expect(missing, 'regenerate with scripts/thumbnails.mjs, or add them to NO_THUMBNAIL with a reason').toEqual([])
    })

    it('list only real components as having none, and none of those has one after all', () => {
        expect(Object.keys(NO_THUMBNAIL).filter((t) => !catalog.includes(t))).toEqual([])
        expect(Object.keys(NO_THUMBNAIL).filter((t) => thumbnailUrl('vaadin', t))).toEqual([])
    })

    it('keep no stale thumbnail of a component that left the catalog', () => {
        for (const look of ['vaadin', 'redwood'] as const) {
            expect(thumbnailTypes(look).filter((t) => !catalog.includes(t)), look).toEqual([])
        }
    })

    it('picture the Redwood core: forms, tabs and the front-office atoms', () => {
        // Not every component — the Redwood renderer paints a subset, and a missing picture says so.
        // These it does paint; losing one of them means the generator (or the renderer) broke.
        for (const t of ['FormLayout', 'TabLayout', 'Badge', 'Notice', 'StatusList']) {
            expect(thumbnailUrl('redwood', t), t).toBeTruthy()
        }
    })

    it('start from the canvas design system, and with none on the DS-neutral canvas', () => {
        expect(defaultLook('vaadin')).toBe('vaadin')
        expect(defaultLook('neutral')).toBe('none')
    })
})
