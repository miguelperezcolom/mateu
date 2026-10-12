import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { parse } from 'yaml'
import * as vscode from 'vscode'
import { fake, pick } from './test/vscode'
import { activate } from './extension'
import { LiveRunCommand } from './LiveRunCommand'

// The command glue, end to end against the fake `vscode` (src/test/vscode.ts): what the user is
// asked, in which order, and exactly which bytes land on disk.

const extensionRoot = join(__dirname, '..')
const pkg = JSON.parse(readFileSync(join(extensionRoot, 'package.json'), 'utf8'))
const context = () => ({ extensionPath: extensionRoot, extensionUri: vscode.Uri.file(extensionRoot), subscriptions: [] as { dispose(): unknown }[] })

let ws: string
let specs: string
const write = (rel: string, text: string) => {
    const p = join(specs, rel)
    mkdirSync(join(p, '..'), { recursive: true })
    writeFileSync(p, text)
    return p
}
const read = (rel: string) => readFileSync(join(specs, rel), 'utf8')

const MOUNT = '# my mount\ntype: UI\nbasePath: /\nroutes:\n  - routes.yaml   # the registry\n'
const ROUTES = '# hand-written comment\ntype: Routes\nroutes:\n  - route: ""\n    layout: home.yaml   # keep me\n'

beforeEach(() => {
    fake.reset()
    ws = mkdtempSync(join(tmpdir(), 'mateu-vsc-'))
    specs = join(ws, 'src/main/resources/specs/ui')
    mkdirSync(specs, { recursive: true })
    fake.workspaceRoot = ws
})
afterEach(() => rmSync(ws, { recursive: true, force: true }))

describe('activation', () => {
    it('registers exactly the commands package.json contributes and activates on', () => {
        const ctx = context()
        activate(ctx as any)
        const contributed = pkg.contributes.commands.map((c: { command: string }) => c.command).sort()
        expect([...fake.commands.keys()].sort()).toEqual(contributed)
        for (const c of contributed) expect(pkg.activationEvents).toContain(`onCommand:${c}`)
        // the custom editor and the quick-fix are wired too, under the ids the manifest declares
        expect(fake.providers.map((p) => p.viewType)).toEqual([pkg.contributes.customEditors[0].viewType])
        expect(fake.providers[0].options.webviewOptions.retainContextWhenHidden).toBe(true)
        expect(fake.codeActionProviders).toHaveLength(1)
        // everything is disposed with the extension
        ctx.subscriptions.forEach((s) => s.dispose())
        expect(fake.commands.size).toBe(0)
    })

    it('every menu entry names a contributed command', () => {
        const contributed = new Set(pkg.contributes.commands.map((c: { command: string }) => c.command))
        for (const entries of Object.values(pkg.contributes.menus) as { command: string }[][]) {
            for (const e of entries) expect(contributed.has(e.command)).toBe(true)
        }
    })

    it('flags a routes file as the active editor for the editor/context menu', () => {
        fake.activeEditor = { document: fake.doc(write('routes.yaml', ROUTES)) }
        activate(context() as any)
        expect(fake.executed).toContainEqual({ command: 'setContext', args: ['mateu.isRoutesFile', true] })
        fake.activeEditor = { document: fake.doc(write('page.yaml', 'type: Form\ntitle: x\n')) }
        fake.onDidChangeActiveTextEditor.fire(undefined)
        expect(fake.executed.at(-1)).toEqual({ command: 'setContext', args: ['mateu.isRoutesFile', false] })
    })
})

describe('Mateu: Add Route…', () => {
    beforeEach(() => activate(context() as any))
    const addRoute = (uri?: vscode.Uri) => vscode.commands.executeCommand('mateu.addRoute', uri)

    it('appends ONE entry, leaving every other byte (comments, quoting) untouched, and saves', async () => {
        write('ui.yaml', MOUNT)
        const routes = write('routes.yaml', ROUTES)
        write('orders.yaml', 'type: Listing\ntitle: Orders\n')
        // layout → route → view model → home (no parent prompt: the file only has the root route)
        fake.answer(pick('orders.yaml'), 'orders', '', pick('Keep the current home page'))
        await addRoute(vscode.Uri.file(routes))
        const text = read('routes.yaml')
        expect(text.startsWith(ROUTES)).toBe(true)
        expect(text.slice(ROUTES.length)).toBe('  - route: orders\n    layout: orders.yaml\n')
        expect(read('ui.yaml')).toBe(MOUNT)
        expect(fake.documents.get(routes)!.saved).toBe(1)
        expect(fake.shown).toEqual([routes])
    })

    it('makes the new route the home page of the mount that lists the routes file', async () => {
        write('ui.yaml', MOUNT)
        const routes = write('routes.yaml', ROUTES)
        write('orders.yaml', 'type: Listing\ntitle: Orders\n')
        fake.answer(pick('orders.yaml'), 'orders', 'com.acme.Orders', pick('Make this the home page'))
        await addRoute(vscode.Uri.file(routes))
        expect(parse(read('routes.yaml')).routes.at(-1)).toEqual({ route: 'orders', layout: 'orders.yaml', viewModel: 'com.acme.Orders' })
        expect(read('ui.yaml')).toBe('# my mount\ntype: UI\nbasePath: /\nhome: orders\nroutes:\n  - routes.yaml   # the registry\n')
    })

    it('suggests the route from the layout under the picked parent', async () => {
        const routes = write('routes.yaml', ROUTES.replace('route: ""', 'route: shop'))
        write('orders/order.yaml', 'type: Form\ntitle: Order\n')
        fake.answer(pick('orders/order.yaml'), pick('shop'), (_: unknown, o: any) => o.value, '')
        await addRoute(vscode.Uri.file(routes))
        expect(fake.prompts[2].options.value).toBe('shop/order')
        expect(parse(read('routes.yaml')).routes.at(-1)).toEqual({ route: 'shop/order', layout: 'orders/order.yaml', parent: 'shop' })
    })

    it('rejects a duplicate route and a route with spaces in the input box', async () => {
        const routes = write('routes.yaml', ROUTES)
        const inputs: any[] = []
        // the only existing route is the root, so no parent prompt — straight to the route
        fake.answer(pick('(none)'), (_: unknown, o: any) => { inputs.push(o); return undefined })
        await addRoute(vscode.Uri.file(routes))
        const v = inputs[0].validateInput
        expect(v('')).toMatch(/already declared/)
        expect(v('a b')).toMatch(/spaces/)
        expect(v('/orders/')).toBeUndefined()
        expect(read('routes.yaml')).toBe(ROUTES)
    })

    it('a route declared meanwhile is asked again instead of failing the flow', async () => {
        const routes = write('routes.yaml', ROUTES)
        let retry: any
        fake.answer(pick('(none)'), 'orders',
            // somebody declares `orders` while the flow is still open
            () => { write('routes.yaml', ROUTES + '  - route: orders\n    viewModel: x.Y\n'); return 'a.B' },
            (_: unknown, o: any) => { retry = o; return 'orders2' })
        await addRoute(vscode.Uri.file(routes))
        expect(retry.validateInput('orders')).toMatch(/already declared/)
        expect(parse(read('routes.yaml')).routes.at(-1)).toEqual({ route: 'orders2', viewModel: 'a.B' })
        expect(fake.messages.filter((m) => m.level === 'error')).toEqual([])
    })

    it('a route with neither layout nor view model is refused', async () => {
        const routes = write('routes.yaml', ROUTES)
        let vmPrompt: any
        fake.answer(pick('(none)'), 'x', (_: unknown, o: any) => { vmPrompt = o; return undefined })
        await addRoute(vscode.Uri.file(routes))
        expect(vmPrompt.validateInput('')).toMatch(/layout or enter a view model/)
        expect(vmPrompt.validateInput('a.B')).toBeUndefined()
    })

    it('asks which routes file when there are several and none is selected', async () => {
        write('a.routes.yaml', ROUTES)
        write('b.routes.yaml', ROUTES)
        fake.answer(pick('b.routes.yaml'), pick('(none)'), 'x', 'a.B')
        await addRoute(vscode.Uri.file(specs))
        expect(fake.prompts[0].items).toEqual(['a.routes.yaml', 'b.routes.yaml'])
        expect(read('a.routes.yaml')).toBe(ROUTES)
        expect(parse(read('b.routes.yaml')).routes.at(-1)).toEqual({ route: 'x', viewModel: 'a.B' })
    })

    it('explains what to do when there is no folder or no routes file', async () => {
        fake.workspaceRoot = undefined
        await addRoute()
        expect(fake.messages.at(-1)).toMatchObject({ level: 'error', text: expect.stringMatching(/Open a folder first/) })
        fake.workspaceRoot = ws
        await addRoute(vscode.Uri.file(specs))
        expect(fake.messages.at(-1)!.text).toMatch(/no type: Routes file/)
    })

    it('reports a failed edit instead of throwing', async () => {
        const routes = write('routes.yaml', ROUTES)
        fake.applyEditResult = false
        fake.answer(pick('(none)'), 'x', 'a.B')
        await addRoute(vscode.Uri.file(routes))
        expect(fake.messages.at(-1)).toMatchObject({ level: 'error', text: expect.stringMatching(/Could not edit/) })
    })
})

describe('Mateu: New File…', () => {
    beforeEach(() => activate(context() as any))
    const newFile = (uri?: vscode.Uri) => vscode.commands.executeCommand('mateu.newFile', uri)

    it('creates a routes file EMPTY and registers it in the chosen mount', async () => {
        write('app.ui.yaml', MOUNT)
        fake.answer(pick('Routes File'), 'orders', pick('app.ui.yaml'), '')
        await newFile(vscode.Uri.file(specs))
        const created = read('orders.yaml')
        expect(parse(created)).toEqual({ type: 'Routes', routes: [] })
        expect(read('app.ui.yaml')).toBe(MOUNT + '  - orders.yaml\n')
        expect(fake.shown).toEqual([join(specs, 'orders.yaml')])
    })

    it('creates a mount with its home page', async () => {
        fake.answer(pick('UI Mount'), 'shop.ui', 'orders')
        await newFile(vscode.Uri.file(specs))
        const mount = parse(read('shop.ui.yaml'))
        expect(mount.type).toBe('UI')
        expect(mount.home).toBe('orders')
    })

    it('creates a page from a template with its width and routes it', async () => {
        write('ui.yaml', MOUNT)
        write('routes.yaml', ROUTES)
        fake.answer(pick('Page…'), pick('Listing / CRUD'), pick((i: any) => i.width?.id === 'edgeToEdge'),
            'customers', pick('Add a route to routes.yaml'), 'customers', pick('Keep the current home page'))
        await newFile(vscode.Uri.file(specs))
        // the template's default width is offered first
        expect(fake.prompts[2].items[0].width.id).toBe('fullWidth')
        expect(parse(read('customers.yaml')).type).toBeTruthy()
        expect(parse(read('routes.yaml')).routes.at(-1)).toEqual({ route: 'customers', layout: 'customers.yaml' })
    })

    it('never overwrites an existing file', async () => {
        write('sources.yaml', 'keep: me\n')
        let prompt: any
        fake.answer(pick('REST Source Catalogue'), (_: unknown, o: any) => { prompt = o; return undefined })
        await newFile(vscode.Uri.file(specs))
        expect(prompt.validateInput('sources')).toMatch(/already exists/)
        expect(prompt.validateInput('bad name')).toMatch(/letters, digits/)
        expect(prompt.validateInput('')).toMatch(/Enter a file name/)
        expect(read('sources.yaml')).toBe('keep: me\n')
    })

    it('proposes a free name when the template default is taken', async () => {
        write('listing.yaml', 'keep: me\n')
        let prompt: any
        fake.answer(pick('Page…'), pick('Listing / CRUD'), pick((i: any) => i.width?.id === 'fullWidth'),
            (_: unknown, o: any) => { prompt = o; return undefined })
        await newFile(vscode.Uri.file(specs))
        expect(prompt.value).toBe('listing-2')
        expect(prompt.validateInput(prompt.value)).toBeUndefined()
    })

    it('a file that appears before the write re-asks the NAME, keeping every other choice', async () => {
        write('ui.yaml', MOUNT)
        write('routes.yaml', ROUTES)
        let retry: any
        fake.answer(pick('Page…'), pick('Listing / CRUD'), pick((i: any) => i.width?.id === 'edgeToEdge'),
            'customers', pick('Add a route to routes.yaml'),
            // somebody creates customers.yaml while the flow is still open
            () => { write('customers.yaml', 'keep: me\n'); return 'customers' },
            pick('Keep the current home page'),
            (_: unknown, o: any) => { retry = o; return 'clients' })
        await newFile(vscode.Uri.file(specs))
        // asked again with the clash inline — not aborted, nothing overwritten
        expect(retry.value).toBe('customers')
        expect(retry.validateInput('customers')).toMatch(/already exists/)
        expect(read('customers.yaml')).toBe('keep: me\n')
        // the page lands under the new name, with the width and the route chosen before
        const page = parse(read('clients.yaml'))
        expect(page.style).toBe('padding: 0;')
        expect(page.pageType).toBe('collection')
        expect(parse(read('routes.yaml')).routes.at(-1)).toEqual({ route: 'customers', layout: 'clients.yaml' })
        expect(fake.messages.filter((m) => m.level === 'error')).toEqual([])
    })

    it('a route declared before the write re-asks the ROUTE and writes nothing until it is free', async () => {
        write('ui.yaml', MOUNT)
        write('routes.yaml', ROUTES)
        let retry: any
        fake.answer(pick('Page…'), pick('Form'), pick((i: any) => i.width?.id === 'fixed'),
            'customer', pick('Add a route to routes.yaml'), 'customer',
            // somebody declares the same route while the flow is still open
            (items: any[]) => { write('routes.yaml', ROUTES + '  - route: customer\n    layout: other.yaml\n'); return pick('Keep the current home page')(items) },
            (_: unknown, o: any) => { retry = o; return 'customer-edit' })
        await newFile(vscode.Uri.file(specs))
        expect(retry.validateInput('customer')).toMatch(/already declared/)
        expect(parse(read('routes.yaml')).routes.at(-1)).toEqual({ route: 'customer-edit', layout: 'customer.yaml' })
        expect(parse(read('customer.yaml')).pageType).toBe('form')
    })

    it('giving up on the re-asked route creates nothing', async () => {
        write('ui.yaml', MOUNT)
        write('routes.yaml', ROUTES)
        fake.answer(pick('Page…'), pick('Form'), pick((i: any) => i.width?.id === 'fixed'),
            'customer', pick('Add a route to routes.yaml'), 'customer',
            (items: any[]) => { write('routes.yaml', ROUTES + '  - route: customer\n'); return pick('Keep the current home page')(items) },
            () => undefined)
        await newFile(vscode.Uri.file(specs))
        expect(existsSync(join(specs, 'customer.yaml'))).toBe(false)
    })

    it('offers Project Settings only while the project has no descriptor', async () => {
        fake.answer(() => undefined)
        await newFile(vscode.Uri.file(specs))
        expect(fake.prompts[0].items.map((i: any) => i.label)).toContain('Project Settings')
        write('project.yaml', 'type: Project\nrenderer: vaadin\n')
        fake.answer(() => undefined)
        await newFile(vscode.Uri.file(specs))
        expect(fake.prompts[1].items.map((i: any) => i.label)).not.toContain('Project Settings')
    })
})

describe('Mateu: Project Settings…', () => {
    it('writes the picked renderer to specs/ui/project.yaml and syncs the setting FROM the file', async () => {
        activate(context() as any)
        fake.answer(pick('Redwood (Oracle)'))
        await vscode.commands.executeCommand('mateu.projectSettings')
        const file = join(specs, 'project.yaml')
        expect(existsSync(file)).toBe(true)
        expect(parse(readFileSync(file, 'utf8'))).toMatchObject({ type: 'Project', renderer: 'redwood' })
        expect(fake.configUpdates.at(-1)).toMatchObject({ key: 'mateu.renderer', value: 'redwood' })
        expect(fake.messages.at(-1)!.text).toMatch(/mateu-redwood/)
    })

    it('a user change of the setting edits the file', async () => {
        write('project.yaml', 'type: Project\nrenderer: vaadin\n')
        activate(context() as any)
        fake.config.set('mateu.renderer', 'redwood')
        fake.onDidChangeConfiguration.fire({ affectsConfiguration: (k) => k === 'mateu.renderer' })
        await new Promise((r) => setTimeout(r, 20))
        expect(read('project.yaml')).toMatch(/renderer: redwood/)
    })
})

describe('Mateu: Run App (Live)', () => {
    it('starts the runnable module as a task, points mateu.baseUrl at it and says how to attach', async () => {
        mkdirSync(join(ws, 'src/main/resources'), { recursive: true })
        writeFileSync(join(ws, 'pom.xml'), '<project><build><plugins><plugin><artifactId>spring-boot-maven-plugin</artifactId></plugin></plugins></build></project>')
        writeFileSync(join(ws, 'src/main/resources/application.properties'), 'server.port=8123\n')
        write('app.yaml', 'type: Form\n')
        activate(context() as any)
        vi.useFakeTimers() // the readiness poll that opens the browser: not this test's concern
        try {
            await vscode.commands.executeCommand('mateu.runLive')
        } finally {
            vi.clearAllTimers()
            vi.useRealTimers()
        }
        expect(fake.tasks).toHaveLength(1)
        expect(fake.tasks[0].name).toBe('Mateu (live)')
        expect(fake.tasks[0].execution.options.cwd).toBe(ws)
        expect(fake.configUpdates).toContainEqual({ key: 'mateu.baseUrl', value: 'http://localhost:8123', target: vscode.ConfigurationTarget.Workspace })
        expect(fake.messages.at(-1)!.text).toMatch(/Java: Attach/)
    })

    it('warns when there is no folder or nothing runnable', async () => {
        activate(context() as any)
        fake.workspaceRoot = undefined
        await vscode.commands.executeCommand('mateu.runLive')
        expect(fake.messages.at(-1)).toMatchObject({ level: 'warning', text: expect.stringMatching(/open the folder/) })
        fake.workspaceRoot = ws
        await vscode.commands.executeCommand('mateu.runLive')
        expect(fake.messages.at(-1)!.text).toMatch(/no pom.xml or build.gradle/)
    })

    it('Reload Screen reports a backend that does not answer — over https too', async () => {
        activate(context() as any)
        ;(LiveRunCommand as any).appUrl = undefined
        for (const base of ['http://127.0.0.1:9', 'https://127.0.0.1:9']) {
            fake.config.set('mateu.baseUrl', base)
            await vscode.commands.executeCommand('mateu.reloadScreen')
            await new Promise((r) => setTimeout(r, 200))
            expect(fake.messages.at(-1)).toMatchObject({ level: 'warning', text: `Mateu: no backend answered at ${base}.` })
        }
    })
})
