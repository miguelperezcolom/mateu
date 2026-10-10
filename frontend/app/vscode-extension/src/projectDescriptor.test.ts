import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
    coordinatesOf, dependencyXml, isProjectDescriptor, parseRenderer, rendererOf, withRenderer,
} from './projectDescriptor'
import { loadCatalogue, render, templateText, templatesRoot } from './newFiles'

describe('project descriptor', () => {
    it('reads vaadin when the file or key is absent or unknown', () => {
        expect(rendererOf(undefined)).toBe('vaadin')
        expect(rendererOf('')).toBe('vaadin')
        expect(rendererOf('type: Project\n')).toBe('vaadin')
        expect(rendererOf('type: Project\nrenderer: nope\n')).toBe('vaadin')
        expect(rendererOf('{{ not yaml')).toBe('vaadin')
    })

    it('reads the declared renderer', () => {
        expect(rendererOf('type: Project\nrenderer: redwood   # vaadin | redwood\n')).toBe('redwood')
        expect(parseRenderer('Redwood')).toBe('redwood')
        expect(isProjectDescriptor('type: Project\n')).toBe(true)
        expect(isProjectDescriptor('type: UI\n')).toBe(false)
    })

    it('rewrites only the renderer line, keeping comments and other keys', () => {
        const before = '# notes\ntype: Project\nrenderer: vaadin   # default\nfuture: kept\n'
        expect(withRenderer(before, 'redwood')).toBe('# notes\ntype: Project\nrenderer: redwood   # default\nfuture: kept\n')
    })

    it('adds the key after type:, or writes a fresh descriptor', () => {
        expect(withRenderer('type: Project\n# end\n', 'redwood')).toBe('type: Project\nrenderer: redwood\n# end\n')
        const fresh = withRenderer(undefined, 'redwood')
        expect(isProjectDescriptor(fresh)).toBe(true)
        expect(rendererOf(fresh)).toBe('redwood')
    })

    it('keeps the artifact mapping in one place', () => {
        expect(coordinatesOf('vaadin')).toBe('io.mateu:vaadin-lit')
        expect(coordinatesOf('redwood')).toBe('io.mateu:redwood')
        expect(dependencyXml('redwood')).toContain('<artifactId>redwood</artifactId>')
    })

    it('the shared New File skeleton is a singleton project descriptor', () => {
        const roots = templatesRoot(join(__dirname, '..'))
        const kind = loadCatalogue(roots.catalogue).files.find((k) => k.id === 'project')!
        expect(kind.singleton).toBe(true)
        const text = render(templateText(roots.internal, kind.template!), kind.fileName)
        expect(isProjectDescriptor(text)).toBe(true)
        expect(rendererOf(text)).toBe('vaadin')
    })

    it('contributes the mateu.renderer setting and the Project Settings command', () => {
        const pkg = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf8'))
        expect(pkg.contributes.configuration.properties['mateu.renderer'].enum).toEqual(['vaadin', 'redwood'])
        expect(pkg.contributes.commands.map((c: { command: string }) => c.command)).toContain('mateu.projectSettings')
    })
})
