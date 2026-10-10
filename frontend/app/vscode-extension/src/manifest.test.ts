import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

// Pins the packaging/activation contract of the extension manifest (no VS Code instance needed).
const root = join(__dirname, '..')
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))

describe('extension manifest', () => {
    it('never activates on every YAML file', () => {
        const events: string[] = pkg.activationEvents
        expect(events.some((e) => e.startsWith('onLanguage:'))).toBe(false)
        expect(events).toContain('workspaceContains:**/specs/ui/**/*.yaml')
        expect(events).toContain('onCustomEditor:mateu.visualEditor')
    })

    it('contributes the bundled specs schema for specs/ui/**', () => {
        const validations: { fileMatch: string; url: string }[] = pkg.contributes.yamlValidation
        expect(validations.map((v) => v.fileMatch)).toEqual(
            expect.arrayContaining(['**/specs/ui/**/*.yaml', '**/specs/ui/**/*.yml']),
        )
        for (const v of validations) expect(v.url).toBe('./schema/specs-schema.json')
        // The packaging script stages it from the generated schema — the source must exist.
        expect(existsSync(join(root, '../../../backend/shared/uidl/specs-schema.json'))).toBe(true)
    })

    it('carries the metadata vsce needs to package non-interactively', () => {
        expect(pkg.publisher).toBeTruthy()
        expect(pkg.repository?.url).toMatch(/^https:\/\//)
        expect(pkg.license).toBe('Apache-2.0')
        expect(existsSync(join(root, pkg.icon))).toBe(true)
        expect(existsSync(join(root, 'CHANGELOG.md'))).toBe(true)
        expect(existsSync(join(root, '../../../LICENSE.txt'))).toBe(true)
    })

    it('contributes Mateu: New Project and activates on it', () => {
        const commands: { command: string }[] = pkg.contributes.commands
        expect(commands.map((c) => c.command)).toContain('mateu.newProject')
        expect(pkg.activationEvents).toContain('onCommand:mateu.newProject')
        // The generator's data is staged from the repository's starters at packaging time.
        expect(existsSync(join(root, '../../../starters/generator/new-project.json'))).toBe(true)
    })
})
