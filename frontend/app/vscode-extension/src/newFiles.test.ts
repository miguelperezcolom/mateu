import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'yaml'
import {
    fileNameOf,
    loadCatalogue,
    pageFileName,
    render,
    targetDir,
    templateText,
    templatesRoot,
    titleOf,
    yamlScalar,
} from './newFiles'

// Mirrors the IntelliJ plugin's NewMateuFileSkeletonsTest: same catalogue, same skeletons, same rules.
const root = join(__dirname, '..')
const roots = templatesRoot(root)
const catalogue = loadCatalogue(roots.catalogue)

describe('New › Mateu catalogue', () => {
    it('resolves the shared catalogue (staged templates/ or the IntelliJ plugin resources)', () => {
        expect(existsSync(roots.catalogue)).toBe(true)
        expect(catalogue.files.map((f) => f.id)).toEqual(
            expect.arrayContaining(['mount', 'routes', 'appShell', 'sources', 'page']),
        )
        expect(catalogue.pageTemplates.length).toBeGreaterThanOrEqual(17)
    })

    it('renders every file kind with its schema type', () => {
        const raw = JSON.parse(readFileSync(roots.catalogue, 'utf8'))
        for (const kind of catalogue.files.filter((k) => !k.page)) {
            const text = render(templateText(roots.internal, kind.template!), kind.fileName)
            expect(text).not.toContain('__')
            const expected = raw.files.find((f: any) => f.id === kind.id).schemaType
            expect(parse(text).type, kind.id).toBe(expected)
        }
    })

    it('renders every page template with every page width', () => {
        for (const t of catalogue.pageTemplates) {
            expect(catalogue.pageWidths.some((w) => w.id === t.pageWidth), `${t.id} default width`).toBe(true)
            for (const w of catalogue.pageWidths) {
                const text = render(templateText(roots.internal, t.template), 'my-page', undefined, w.style)
                expect(text, `${t.id}/${w.id}`).not.toContain('__')
                const doc = parse(text)
                expect(typeof doc.type, `${t.id}/${w.id}`).toBe('string')
                if (w.style != null) expect(doc.style).toBe(w.style)
                else expect(doc.style).toBeUndefined()
            }
        }
    })
})

describe('render', () => {
    const t = 'type: VerticalLayout\n  __PAGE_WIDTH__\ntitle: __TITLE__\nid: __NAME__\n'

    it('replaces the page-width line at its indentation, quoting the css', () => {
        expect(render(t, 'my-orders', undefined, 'padding: 0;')).toBe(
            'type: VerticalLayout\n  style: "padding: 0;"\ntitle: My orders\nid: my-orders\n',
        )
    })

    it('drops the page-width line when there is no style', () => {
        expect(render(t, 'my-orders')).toBe('type: VerticalLayout\ntitle: My orders\nid: my-orders\n')
        expect(render(t, 'my-orders', undefined, null)).toBe('type: VerticalLayout\ntitle: My orders\nid: my-orders\n')
    })

    it('keeps an awkward title intact through YAML', () => {
        const doc = parse(render('{type: Text, text: __TITLE__}', 'x', 'a, {b}: "c"'))
        expect(doc.text).toBe('a, {b}: "c"')
    })
})

describe('names', () => {
    it('titleOf', () => {
        expect(titleOf('customer-orders')).toBe('Customer orders')
        expect(titleOf('customerOrders.yaml')).toBe('Customer orders')
        expect(titleOf('app.ui')).toBe('App')
        expect(titleOf('')).toBe('Untitled')
    })

    it('yamlScalar', () => {
        expect(yamlScalar('Orders: open')).toBe('"Orders: open"')
        expect(yamlScalar('Yes')).toBe('"Yes"')
        expect(yamlScalar('My orders')).toBe('My orders')
    })

    it('fileNameOf / pageFileName', () => {
        expect(fileNameOf('a')).toBe('a.yaml')
        expect(fileNameOf('a.yml')).toBe('a.yml')
        expect(pageFileName('smartSearch')).toBe('smart-search')
    })
})

describe('targetDir', () => {
    const existing = new Set([
        '/p/mod/src/main/resources',
        '/p/mod/src/main/resources/specs/ui',
        '/p/other/src/main/resources',
    ])
    const exists = (s: string) => existing.has(s)

    it('respects a folder inside specs/ui', () => {
        expect(targetDir('/p/mod/src/main/resources/specs/ui/orders', '/p', exists)).toBe('/p/mod/src/main/resources/specs/ui/orders')
        expect(targetDir('/p/mod/src/main/resources/specs/ui', '/p', exists)).toBe('/p/mod/src/main/resources/specs/ui')
    })

    it("finds the module's existing specs/ui from the module or deeper folders", () => {
        expect(targetDir('/p/mod', '/p', exists)).toBe('/p/mod/src/main/resources/specs/ui')
        expect(targetDir('/p/mod/src/main/java/com', '/p', exists)).toBe('/p/mod/src/main/resources/specs/ui')
    })

    it('creates specs/ui under resources, else under the folder', () => {
        expect(targetDir('/p/other', '/p', exists)).toBe('/p/other/src/main/resources/specs/ui')
        expect(targetDir('/q', '/q', exists)).toBe('/q/specs/ui')
    })
})
