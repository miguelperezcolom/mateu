import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import * as vscode from 'vscode'
import { fake } from './test/vscode'
import { NewProjectCommand } from './NewProjectCommand'

// The New Project wizard's glue: the questions, the project written, and opened on request.
// Offline: Maven Central is unreachable here, so the pinned starter version is used.

const extensionRoot = join(__dirname, '..')
let parent: string

beforeEach(() => {
    fake.reset()
    parent = mkdtempSync(join(tmpdir(), 'mateu-np-'))
    vi.stubGlobal('fetch', () => Promise.reject(new Error('offline')))
    NewProjectCommand.register({ extensionPath: extensionRoot } as any)
})
afterEach(() => {
    vi.unstubAllGlobals()
    rmSync(parent, { recursive: true, force: true })
})

const run = () => vscode.commands.executeCommand('mateu.newProject')

/** A user answering each question by what it asks; `inputs` by prompt, the rest by placeholder. */
function user(choices: Record<string, unknown>) {
    fake.respond = (kind, items, o) => {
        const key = o?.placeHolder ?? o?.prompt ?? o?.title
        const want = Object.entries(choices).find(([k]) => key?.startsWith(k))?.[1]
        if (kind === 'openDialog') return choices.folder
        if (kind === 'inputBox') {
            const v = want === undefined ? o.value : want
            if (typeof v === 'string' && o.validateInput?.(v)) throw new Error(`rejected ${v}: ${o.validateInput(v)}`)
            return v
        }
        if (o?.canPickMany) return want === undefined ? [] : items.filter((i: any) => (want as string[]).includes(i.id))
        if (want === null) return undefined
        return want === undefined ? items[0] : items.find((i: any) => i.id === want)
    }
}

describe('Mateu: New Project', () => {
    it('writes a YAML-only Spring project with the picked renderer and pages, then opens it', async () => {
        fake.messageAnswer = 'Open'
        user({ 'How do you want': 'yaml', 'Renderer': 'redwood', 'Add sample pages': ['form'], 'Group id': 'com.acme',
            'Artifact id': 'my-shop', folder: [vscode.Uri.file(parent)] })
        await run()
        const target = join(parent, 'my-shop')
        expect(existsSync(join(target, 'pom.xml'))).toBe(true)
        expect(readFileSync(join(target, 'pom.xml'), 'utf8')).toMatch(/mateu-redwood/)
        // the package suggested from group + artifact
        expect(fake.prompts.find((p) => p.options?.prompt === 'Package')!.options.value).toMatch(/^com\.acme\./)
        expect(fake.messages.at(-1)!.text).toMatch(/^Created my-shop \(Mateu .+\)\. Run: /)
        expect(fake.executed.at(-1)).toEqual({ command: 'vscode.openFolder', args: [vscode.Uri.file(target), { forceNewWindow: false }] })
    })

    it('validates the coordinates as the user types', async () => {
        let group: any
        user({ 'How do you want': 'code', 'Runtime': 'spring-mvc' })
        const respond = fake.respond!
        fake.respond = (kind, items, o) => {
            if (o?.prompt === 'Group id') { group = o; return undefined }
            return respond(kind, items, o)
        }
        await run()
        expect(group.validateInput('com.acme')).toBeUndefined()
        expect(group.validateInput('com acme')).toMatch(/dotted Java name/)
        expect(fake.executed).toEqual([{ command: 'mateu.newProject', args: [] }])
    })

    it('never writes into a non-empty folder', async () => {
        mkdirSync(join(parent, 'taken'))
        writeFileSync(join(parent, 'taken/keep.txt'), 'x')
        user({ 'How do you want': 'static', 'Project name': 'taken', 'Artifact id': 'taken', folder: [vscode.Uri.file(parent)] })
        await run()
        expect(fake.messages.at(-1)).toMatchObject({ level: 'error', text: expect.stringMatching(/already exists and is not empty/) })
        expect(readFileSync(join(parent, 'taken/keep.txt'), 'utf8')).toBe('x')
    })

    it('cancelling a step creates nothing', async () => {
        user({ 'How do you want': 'yaml', 'Renderer': null })
        await run()
        expect(fake.messages).toEqual([])
        expect(fake.executed.filter((e) => e.command === 'vscode.openFolder')).toEqual([])
    })
})
