import { describe, it, expect } from 'vitest'
import { buildScaffoldPrompt, validateScaffoldYaml, stripFences } from './aiScaffold'

const KNOWN = ['VerticalLayout', 'HorizontalLayout', 'FormField', 'Button', 'Text']

describe('aiScaffold', () => {
    it('builds a prompt listing the known types and the description, classless by default', () => {
        const p = buildScaffoldPrompt('a login form', KNOWN)
        expect(p).toContain('Generate a Mateu page layout as YAML')
        expect(p).toContain('Button, FormField, HorizontalLayout, Text, VerticalLayout') // sorted
        expect(p).toContain('a login form')
        expect(p).toContain('do NOT emit a `modelView:` key')
    })

    it('weaves in the bound view model and its members when present', () => {
        const p = buildScaffoldPrompt('an edit form', KNOWN, { modelView: 'com.acme.PersonView', fields: ['name', 'email'], actions: ['save'] })
        expect(p).toContain('com.acme.PersonView')
        expect(p).toContain('Available fields: name, email')
        expect(p).toContain('Available actions: save')
    })

    it('accepts YAML whose every type is known', () => {
        const yaml = 'type: VerticalLayout\ncontent:\n  - type: FormField\n    id: name\n  - type: Button\n    label: Save\n'
        expect(validateScaffoldYaml(yaml, KNOWN)).toEqual({ ok: true, unknownTypes: [] })
    })

    it('rejects unknown component types, listing them', () => {
        const yaml = 'type: VerticalLayout\ncontent:\n  - type: MadeUpWidget\n  - type: FormField\n    id: x\n  - type: AlsoFake\n'
        const v = validateScaffoldYaml(yaml, KNOWN)
        expect(v.ok).toBe(false)
        expect(v.unknownTypes.sort()).toEqual(['AlsoFake', 'MadeUpWidget'])
    })

    it('rejects unparseable YAML and a rootless / typeless root', () => {
        expect(validateScaffoldYaml(':\n  - [', KNOWN).ok).toBe(false)
        expect(validateScaffoldYaml('- a\n- b\n', KNOWN).error).toMatch(/single component/)
        expect(validateScaffoldYaml('foo: bar\n', KNOWN).error).toMatch(/missing a .type/)
    })

    it('strips ```yaml code fences an AI may add', () => {
        expect(stripFences('```yaml\ntype: Text\n```')).toBe('type: Text')
        expect(validateScaffoldYaml('```yaml\ntype: Text\ntext: hi\n```', KNOWN).ok).toBe(true)
    })
})
