import { describe, expect, it } from 'vitest'
import { deflateRawSync } from 'node:zlib'
import {
    buildAgentInstruction, decodeShared, encodePlainShareLink, encodeShareLink, hasSharedDesign, isSharedDesign,
    SharedDesign,
} from './shareLink'

const YAML = 'type: VerticalLayout\ncontent:\n  - type: Text\n    text: "Hola — ñandú ✓"\n'
const design: SharedDesign = { v: 1, path: 'orders.yaml', yaml: YAML }

describe('share links', () => {
    it('round-trips a design through the compressed link', async () => {
        const link = await encodeShareLink(design, 'http://localhost:5199/')
        expect(link.startsWith('http://localhost:5199/#mateuz=')).toBe(true)
        expect(await decodeShared(link)).toEqual(design)
    })

    it('drops the base url own fragment', async () => {
        const link = await encodeShareLink(design, 'http://localhost:5199/#mateuz=old')
        expect(link.match(/#/g)?.length).toBe(1)
        expect(await decodeShared(link)).toEqual(design)
    })

    it('round-trips through the plain link', async () => {
        const link = encodePlainShareLink(design, 'https://example.org/editor/')
        expect(link).toContain('#mateu=')
        expect(await decodeShared(link)).toEqual(design)
    })

    it('reads what an agent produces with node zlib (the agent.md recipe)', async () => {
        const json = JSON.stringify({ v: 1, yaml: YAML, files: { 'routes.yaml': 'type: Routes\n' } })
        const link = 'http://localhost:5199/#mateuz=' + deflateRawSync(json).toString('base64url')
        const got = await decodeShared(link)
        expect(got?.yaml).toBe(YAML)
        expect(got?.files).toEqual({ 'routes.yaml': 'type: Routes\n' })
    })

    it('accepts just the fragment, or the bare JSON document', async () => {
        const link = await encodeShareLink(design, 'http://x/')
        expect(await decodeShared(link.slice(link.indexOf('#')))).toEqual(design)
        expect(await decodeShared(link.slice(link.indexOf('#') + 1))).toEqual(design)
        expect(await decodeShared('  ' + JSON.stringify(design) + '\n')).toEqual(design)
    })

    it('answers null for anything else, never throws', async () => {
        for (const junk of ['', 'hello', 'http://x/#mateuz=!!!', 'http://x/#mateuz=AAAA', 'http://x/#mateu=%7Bnope',
            '{"v":2,"yaml":"x"}', '{"v":1}', 'http://x/#other=1']) {
            expect(await decodeShared(junk)).toBeNull()
        }
    })

    it('validates the shape', () => {
        expect(isSharedDesign({ v: 1, yaml: '' })).toBe(true)
        expect(isSharedDesign({ v: 1, yaml: 'a', path: 3 })).toBe(false)
        expect(isSharedDesign({ v: 1, yaml: 'a', files: { 'x.yaml': 1 } })).toBe(false)
        expect(isSharedDesign({ v: 1, yaml: 'a', files: [] })).toBe(false)
    })

    it('tells a carrying hash apart', () => {
        expect(hasSharedDesign('#mateuz=abc')).toBe(true)
        expect(hasSharedDesign('mateu=abc')).toBe(true)
        expect(hasSharedDesign('#/orders')).toBe(false)
        expect(hasSharedDesign('')).toBe(false)
    })

    it('compresses a realistic page well below its JSON size', async () => {
        const big: SharedDesign = { v: 1, yaml: Array.from({ length: 40 }, (_, i) => `- type: FormField\n  id: field${i}\n  label: Field ${i}\n`).join('') }
        const link = await encodeShareLink(big, 'http://x/')
        expect(link.length).toBeLessThan(JSON.stringify(big).length / 2)
    })

    it('builds the agent instruction around the guide and this editor', () => {
        const text = buildAgentInstruction('a customer form', 'http://localhost:5199/#mateuz=zzz', 'customer.yaml')
        expect(text).toContain('agent.md')
        expect(text).toContain('a customer form')
        expect(text).toContain('specs/ui/customer.yaml')
        expect(text).toContain('share link on this editor: http://localhost:5199/')
        expect(text).not.toContain('zzz')
    })
})
