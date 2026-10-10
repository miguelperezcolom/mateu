import { describe, it, expect } from 'vitest'
import {
    isProjectYaml, parseProjectSettings, projectSettingsOf, withRenderer, newProjectYaml, RENDERER_ARTIFACTS,
} from './projectSettings'
import { buildIndex } from './projectIndex'
import { buildPlayManifest } from './playManifest'
import { buildBundleManifest } from './exportBundle'

const descriptor = '# the project\ntype: Project\nrenderer: redwood   # vaadin | redwood\n'

describe('the project descriptor (project.yaml)', () => {
    it('is told apart by type: Project', () => {
        expect(isProjectYaml(descriptor)).toBe(true)
        expect(isProjectYaml('type: UI\nbasePath: ""\n')).toBe(false)
        expect(isProjectYaml('not: [yaml')).toBe(false)
    })

    it('reads the renderer; anything else (or nothing) is vaadin', () => {
        expect(parseProjectSettings(descriptor).renderer).toBe('redwood')
        expect(parseProjectSettings('type: Project\nrenderer: REDWOOD\n').renderer).toBe('redwood')
        expect(parseProjectSettings('type: Project\n').renderer).toBe('vaadin')
        expect(parseProjectSettings('type: Project\nrenderer: swing\n').renderer).toBe('vaadin')
    })

    it('a project with no descriptor gets the defaults', () => {
        expect(projectSettingsOf([{ path: 'app.ui.yaml', content: 'type: UI\n' }])).toEqual({ renderer: 'vaadin' })
        expect(projectSettingsOf([{ path: 'project.yaml', content: descriptor }])).toEqual({ renderer: 'redwood', path: 'project.yaml' })
    })

    it('setting the renderer is a line edit: comments and other keys survive', () => {
        const edited = withRenderer(descriptor, 'vaadin')
        expect(edited).toBe('# the project\ntype: Project\nrenderer: vaadin   # vaadin | redwood\n')
        expect(withRenderer('type: Project\nfoo: 1\n', 'redwood')).toBe('type: Project\nrenderer: redwood\nfoo: 1\n')
        expect(parseProjectSettings(withRenderer('', 'redwood')).renderer).toBe('redwood')
        expect(isProjectYaml(newProjectYaml())).toBe(true)
    })

    it('names the artifact that serves each renderer', () => {
        expect(RENDERER_ARTIFACTS.redwood).toBe('io.mateu:redwood')
        expect(RENDERER_ARTIFACTS.vaadin).toBe('io.mateu:vaadin-lit')
    })

    it('the project index carries it and does not take it for a page', () => {
        const index = buildIndex([
            { path: 'project.yaml', content: descriptor },
            { path: 'home.yaml', content: 'type: VerticalLayout\ncontent: []\n' },
        ])
        expect(index.project).toEqual({ renderer: 'redwood', path: 'project.yaml' })
        expect(index.pages).toEqual(['home.yaml'])
    })

    it('is neither played nor exported as a definition', () => {
        const files = [
            { path: 'project.yaml', content: descriptor },
            { path: 'home.yaml', content: 'type: VerticalLayout\ncontent: []\n' },
        ]
        expect(Object.keys(buildPlayManifest(files, 'now').definitions)).toEqual(['home.yaml'])
        expect(Object.keys(buildBundleManifest(files, 'now').definitions)).toEqual(['home.yaml'])
    })
})
