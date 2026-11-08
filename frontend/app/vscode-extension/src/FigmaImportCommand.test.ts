import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createServer, type Server } from 'node:http'
import { type AddressInfo } from 'node:net'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import * as vscode from 'vscode'
import { fake } from './test/vscode'
import { FigmaImportCommand, TOKEN_SECRET, figmaScriptPath, findNode, importFromFigma } from './FigmaImportCommand'
import {
    framesOf,
    nodeCandidates,
    nodeMajor,
    routablePages,
    summaryOf,
    tokenFromEnvOrFiles,
    type ImportReport,
} from './figmaImport'

// "Mateu: Import from Figma…" end to end against the fake `vscode`: the driver really runs (with the
// node running this suite) over the Star Wars fixture, offline and through a local server playing
// the Figma API; what lands in specs/ui and routes.yaml is checked byte for byte where it matters.

const extensionRoot = join(__dirname, '..')
const repo = join(extensionRoot, '..', '..', '..')
const fixture = join(repo, 'design/figma/to-yaml/test/fixtures/starwars.figma.json')

class Secrets {
    readonly map = new Map<string, string>()
    async get(k: string) { return this.map.get(k) }
    async store(k: string, v: string) { this.map.set(k, v) }
    async delete(k: string) { this.map.delete(k) }
}
const context = (secrets = new Secrets()) => ({ extensionPath: extensionRoot, secrets, subscriptions: [] }) as any

let ws: string
let specs: string
const read = (rel: string) => readFileSync(join(specs, rel), 'utf8')
const savedEnv = { ...process.env }

beforeEach(() => {
    fake.reset()
    ws = mkdtempSync(join(tmpdir(), 'mateu-figma-'))
    specs = join(ws, 'src/main/resources/specs/ui')
    mkdirSync(specs, { recursive: true })
    fake.workspaceRoot = ws
    fake.config.set('mateu.nodePath', process.execPath)
    delete process.env.FIGMA_TOKEN
    process.env.HOME = ws
})
afterEach(() => {
    process.env = { ...savedEnv }
    rmSync(ws, { recursive: true, force: true })
})

describe('Import from Figma (offline payload)', () => {
    it('writes the frames asked for and registers them before the marker', async () => {
        writeFileSync(join(specs, 'routes.yaml'), 'type: Routes\nroutes:\n  - route: ""\n    layout: app.yaml\n  # __ROUTES__\n')
        fake.answer(fixture, 'species, Welcome')
        await importFromFigma(context())
        expect(read('species.yaml')).toBe(readFileSync(join(repo, 'design/figma/to-yaml/test/golden/species.yaml'), 'utf8'))
        expect(existsSync(join(specs, 'partials/species-list.yaml'))).toBe(true)
        expect(read('routes.yaml')).toBe(
            'type: Routes\nroutes:\n  - route: ""\n    layout: app.yaml\n' +
                '  - route: welcome\n    layout: welcome.yaml\n  - route: species\n    layout: species.yaml\n  # __ROUTES__\n',
        )
        expect(fake.messages.at(-1)!.text).toMatch(/3 created.*2 route\(s\) added \(welcome, species\)/)

        // again: nothing changes, nothing is registered twice
        fake.answer(fixture, 'species')
        await importFromFigma(context())
        expect(fake.messages.at(-1)!.text).toMatch(/0 created, 0 updated, 2 unchanged; 0 route\(s\) added/)
    })

    it('creates routes.yaml when the mount has none, and opens the first page on request', async () => {
        fake.messageAnswer = 'Open'
        fake.answer(fixture, 'species')
        await importFromFigma(context(), vscode.Uri.file(ws))
        expect(read('routes.yaml')).toMatch(/type: Routes\nroutes:\n {2}- route: species\n {4}layout: species\.yaml\n$/)
        expect(fake.shown).toEqual([join(specs, 'species.yaml')])
    })

    it('shows the converter warnings and a driver failure', async () => {
        writeFileSync(join(specs, 'species.yaml'), 'type: Form\n')
        fake.answer(fixture, 'species')
        await importFromFigma(context())
        expect(fake.messages.at(-1)).toMatchObject({ level: 'warning' })
        expect(fake.messages.at(-1)!.text).toMatch(/1 skipped.*not generated from Figma/)

        fake.answer(fixture, 'nope')
        await importFromFigma(context())
        expect(fake.messages.at(-1)).toMatchObject({ level: 'error' })
        expect(fake.messages.at(-1)!.text).toMatch(/No frame called "nope"/)
    })

    it('a missing node is a clear error; no folder, no import', async () => {
        fake.config.set('mateu.nodePath', join(ws, 'no-node'))
        fake.answer(fixture, '')
        await importFromFigma(context())
        expect(fake.messages.at(-1)!.text).toMatch(/Node.js 20 or newer.*mateu.nodePath/)
        fake.workspaceRoot = undefined
        await importFromFigma(context())
        expect(fake.messages.at(-1)!.text).toMatch(/Open a folder first/)
    })

    it('the URL prompt validates; a cancelled prompt imports nothing', async () => {
        fake.answer((_: unknown, o: any) => {
            expect(o.validateInput('https://example.com/x')).toMatch(/Not a Figma file URL/)
            expect(o.validateInput('https://www.figma.com/design/AbCdEf123456XyZ/x')).toBeUndefined()
            return undefined
        })
        await importFromFigma(context())
        expect(existsSync(join(specs, 'routes.yaml'))).toBe(false)
    })
})

describe('Import from Figma (the API)', () => {
    let server: Server
    let seen: { token?: string; path?: string }
    beforeEach(async () => {
        seen = {}
        const body = readFileSync(fixture)
        server = createServer((rq, rs) => {
            seen = { token: rq.headers['x-figma-token'] as string, path: rq.url }
            if (rq.headers['x-figma-token'] === 'figd_bad') { rs.statusCode = 403; rs.end(); return }
            rs.setHeader('content-type', 'application/json')
            rs.end(body)
        })
        await new Promise<void>((r) => server.listen(0, '127.0.0.1', r))
        process.env.FIGMA_API_URL = `http://127.0.0.1:${(server.address() as AddressInfo).port}`
    })
    afterEach(() => new Promise<void>((r) => server.close(() => r())))

    it('asks for the token, saves it in SecretStorage on consent, and sends it only in the header', async () => {
        const secrets = new Secrets()
        fake.answer('https://www.figma.com/design/AbCdEf123456XyZ/Star-Wars?node-id=1-2', 'species', 'figd_typed', (items: any[]) => items[0])
        await importFromFigma(context(secrets))
        expect(seen).toEqual({ token: 'figd_typed', path: '/v1/files/AbCdEf123456XyZ' })
        expect(secrets.map.get(TOKEN_SECRET)).toBe('figd_typed')
        expect(fake.prompts.find((p) => p.options?.password)?.options.prompt).toMatch(/File content: Read only/)
        expect(read('species.yaml')).toMatch(/^# Generated from the Figma frame "species"/)

        // the stored token is used without asking
        fake.answer('AbCdEf123456XyZ', 'species')
        await importFromFigma(context(secrets))
        expect(fake.prompts.filter((p) => p.options?.password)).toHaveLength(1)
    })

    it('FIGMA_TOKEN works too; a refused token is reported without echoing it', async () => {
        process.env.FIGMA_TOKEN = 'figd_bad'
        fake.answer('AbCdEf123456XyZ', '')
        await importFromFigma(context())
        expect(fake.messages.at(-1)!.text).toMatch(/HTTP 403.*File content: Read only/)
        expect(fake.messages.at(-1)!.text).not.toContain('figd_bad')
    })

    it('forgetting the token removes it', async () => {
        const secrets = new Secrets()
        secrets.map.set(TOKEN_SECRET, 'x')
        FigmaImportCommand.register(context(secrets))
        await fake.commands.get('mateu.forgetFigmaToken')!()
        expect(secrets.map.has(TOKEN_SECRET)).toBe(false)
    })
})

describe('the pure parts', () => {
    it('node candidates, versions, frames, tokens', async () => {
        expect(nodeCandidates('/x/node', {}, '/h')).toEqual(['/x/node'])
        expect(nodeCandidates(undefined, { PATH: '/a:/b/' }, '/h', 'darwin').slice(0, 2)).toEqual(['/a/node', '/b/node'])
        expect(nodeCandidates(undefined, { Path: 'C:\\n' }, '/h', 'win32').slice(0, 2)).toEqual(['C:\\n/node.exe', 'C:\\n/node.cmd'])
        expect([nodeMajor('v22.3.0'), nodeMajor('nope')]).toEqual([22, null])
        expect(framesOf(' a, ,b ')).toEqual(['a', 'b'])
        const files: Record<string, string> = { '/h/.config/mateu/figma-token': ' c\n' }
        expect(tokenFromEnvOrFiles({ FIGMA_TOKEN: ' e ' }, '/h', (p) => files[p])).toBe('e')
        expect(tokenFromEnvOrFiles({}, '/h', (p) => files[p])).toBe('c')
        files['/h/.mateu-secrets/figma-token'] = 'b'
        expect(tokenFromEnvOrFiles({}, '/h', (p) => files[p])).toBe('b')
        expect(tokenFromEnvOrFiles({}, '/nobody', () => undefined)).toBeUndefined()
        expect((await findNode(process.execPath)).node).toBe(process.execPath)
        expect(figmaScriptPath(extensionRoot)).toMatch(/figma-import\.mjs$/)
    })

    it('what gets a route, and the summary', () => {
        const report: ImportReport = {
            frames: [],
            warnings: ['w'],
            files: [
                { path: 'a.yaml', frame: 'a', type: 'Form', partial: false, status: 'created' },
                { path: 'partials/p.yaml', frame: 'p', type: null, partial: true, status: 'created' },
                { path: 'shell.yaml', frame: 's', type: 'AppShell', partial: false, status: 'updated' },
                { path: 'h.yaml', frame: 'h', type: 'Form', partial: false, status: 'skipped' },
            ],
        }
        expect(routablePages(report).map((f) => f.path)).toEqual(['a.yaml'])
        expect(summaryOf(report, ['a'])).toBe('2 created, 1 updated, 0 unchanged, 1 skipped; 1 route(s) added (a); 1 warning(s)')
        expect(summaryOf({ ...report, warnings: [] }, [], true)).toMatch(/^Dry run — nothing written\. .*0 route\(s\) to add$/)
    })
})
