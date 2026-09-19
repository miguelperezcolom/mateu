import { describe, it, expect } from 'vitest'
import { parse } from 'yaml'
import { TEMPLATES } from './templates'
import { parsePage, serializePage } from './pageModel'

describe('starter templates', () => {
    it('each template has a unique id and non-empty label/description/yaml', () => {
        const ids = TEMPLATES.map((t) => t.id)
        expect(new Set(ids).size).toBe(ids.length)
        for (const t of TEMPLATES) {
            expect(t.label, t.id).toBeTruthy()
            expect(t.description, t.id).toBeTruthy()
            expect(t.yaml.trim(), t.id).toBeTruthy()
        }
    })

    it('each template is valid YAML that parses to a non-empty page and round-trips', () => {
        for (const t of TEMPLATES) {
            // valid YAML with a discriminated root
            const raw = parse(t.yaml)
            expect(raw?.type, `${t.id}: template root must carry a type`).toBeTruthy()

            // parses to an editable page (never the empty-page fallback) and round-trips without loss
            const doc = parsePage(t.yaml)
            expect(doc.layout.type, t.id).toBe(raw.type)
            const out = parse(serializePage(doc))
            expect(out.type, t.id).toBe(raw.type)
        }
    })

    it('the named-slot template uses the coherence Phase 4 primitive (gridTemplateAreas + Slotted)', () => {
        const tpl = TEMPLATES.find((t) => t.id === 'template')!
        const raw = parse(tpl.yaml)
        expect(raw.type).toBe('ResponsiveGrid')
        expect(raw.gridTemplateAreas).toContain('header')
        expect(raw.content.every((c: any) => c.type === 'Slotted' && c.slot)).toBe(true)
    })
})
