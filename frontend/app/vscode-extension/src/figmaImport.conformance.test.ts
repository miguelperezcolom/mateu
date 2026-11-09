// The shared corpus of "Import from Figma": conformance/client/figma-import.json. This file is the
// REFERENCE — `FIGMA_IMPORT_WRITE=true npx vitest run src/figmaImport.conformance.test.ts` rewrites
// the expected values from the cases below; the Maven goal (FigmaImportConformanceTest) and the
// IntelliJ plugin (FigmaImportConformanceTest) run the same file.
import { describe, expect, it } from 'vitest'
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { appendImportedRoute, figmaFileKey, routeOfPage, routesFileFor } from './figmaImport'

const corpusPath = join(__dirname, '..', '..', '..', '..', 'conformance', 'client', 'figma-import.json')

const fileKeyInputs = [
    'https://www.figma.com/design/AbCdEf123456XyZ/Star-Wars?node-id=12-3&t=xyz',
    'https://www.figma.com/file/AbCdEf123456XyZ/Star-Wars',
    'figma.com/design/AbCdEf123456XyZ',
    'https://www.figma.com/proto/AbCdEf123456XyZ/Star-Wars?page-id=0%3A1',
    'https://www.figma.com/design/AbCdEf123456XyZ/Star-Wars/branch/BrAnCh987654/Star-Wars?node-id=0-1',
    '  AbCdEf123456XyZ  ',
    'https://www.figma.com/board/BoArD1234567/Ideas',
    'https://example.com/design/AbCdEf123456XyZ',
    'https://www.figma.com/files/recents',
    'not a key!',
    '',
]

const block = `type: Routes
routes:
  - route: ""          # the shell
    layout: app.yaml
  - route: people
    layout: people.yaml
`
const marker = `type: Routes
routes:
  - route: welcome
    layout: welcome.yaml
  # __ROUTES__
  - route: people/:id
    layout: person.yaml
`
const appendInputs = [
    { name: 'block list: after the last entry, comments kept', text: block, route: 'species', layout: 'species.yaml' },
    { name: 'already declared: nothing changes', text: block, route: 'people', layout: 'people.yaml' },
    { name: 'already declared under another layout: still nothing', text: block, route: 'people', layout: 'people-2.yaml' },
    { name: 'before the __ROUTES__ marker, at its indentation', text: marker, route: 'species/new', layout: 'species-new.yaml' },
    { name: 'empty flow list becomes a block list', text: 'type: Routes\nroutes: []\n', route: 'welcome', layout: 'welcome.yaml' },
    { name: 'no routes key: one is added at the end', text: 'type: Routes\n', route: 'welcome', layout: 'welcome.yaml' },
    { name: 'a sub-folder page keeps its folder', text: block, route: 'admin/users', layout: 'admin/users.yaml' },
    { name: 'a name that needs quoting', text: block, route: 'yes', layout: 'yes.yaml' },
    { name: 'CRLF line endings are kept', text: block.replace(/\n/g, '\r\n'), route: 'fleet', layout: 'fleet.yaml' },
]

const pageInputs = ['species.yaml', 'admin/users.yaml', 'about-this-demo.yml']
const routesFilesInputs = [['routes.yaml', 'admin/routes.yaml'], ['admin/routes.yaml', 'aa-routes.yaml'], []]

function keyResult(input: string) {
    try {
        return { key: figmaFileKey(input) }
    } catch {
        return { error: true }
    }
}

function build() {
    return {
        $comment:
            'Generated from frontend/app/vscode-extension/src/figmaImport.ts (the reference) by figmaImport.conformance.test.ts with FIGMA_IMPORT_WRITE=true. ' +
            'Run by the Maven goal mateu-bundle:figma (FigmaImportConformanceTest) and the IntelliJ plugin (FigmaImportConformanceTest). ' +
            '`expected: null` = the routes file is left unchanged.',
        fileKeys: fileKeyInputs.map((input) => ({ input, ...keyResult(input) })),
        routeAppends: appendInputs.map((c) => ({ ...c, expected: appendImportedRoute(c.text, c.route, c.layout) })),
        pageRoutes: pageInputs.map((path) => ({ path, route: routeOfPage(path) })),
        routesFiles: routesFilesInputs.map((files) => ({ files, chosen: routesFileFor(files) })),
    }
}

if (process.env.FIGMA_IMPORT_WRITE === 'true') writeFileSync(corpusPath, JSON.stringify(build(), null, 2) + '\n')

describe('figma-import corpus', () => {
    const corpus = JSON.parse(readFileSync(corpusPath, 'utf8'))

    it('is what the reference computes (regenerate with FIGMA_IMPORT_WRITE=true)', () => {
        expect(corpus).toEqual(build())
    })

    it.each(corpus.fileKeys as { input: string; key?: string; error?: boolean }[])('file key of "$input"', (c) => {
        if (c.error) expect(() => figmaFileKey(c.input)).toThrow()
        else expect(figmaFileKey(c.input)).toBe(c.key)
    })

    it.each(corpus.routeAppends as { name: string; text: string; route: string; layout: string; expected: string | null }[])('$name', (c) => {
        expect(appendImportedRoute(c.text, c.route, c.layout)).toBe(c.expected)
    })
})
