// A small, disk-backed fake of the `vscode` module, aliased in vitest.config.ts, so the extension's
// glue (commands, the custom editor's message bridge) runs in plain node. It only implements what
// the extension calls. Dialogs are SCRIPTED: tests queue answers with `fake.answer(...)`, each
// showQuickPick/showInputBox/showOpenDialog consumes the next one, and every prompt is recorded.
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'

type Listener<T> = (e: T) => unknown

export class EventEmitter<T> {
    private listeners: Listener<T>[] = []
    event = (l: Listener<T>) => {
        this.listeners.push(l)
        return new Disposable(() => { this.listeners = this.listeners.filter((x) => x !== l) })
    }
    fire(e: T) { for (const l of [...this.listeners]) l(e) }
    get count() { return this.listeners.length }
}

export class Disposable {
    constructor(private readonly fn: () => void = () => {}) {}
    dispose() { this.fn() }
    static from(...items: { dispose(): unknown }[]) { return new Disposable(() => items.forEach((i) => i.dispose())) }
}

export class Uri {
    private constructor(readonly scheme: string, readonly path: string, readonly query = '') {}
    get fsPath() { return this.path }
    static file(p: string) { return new Uri('file', p) }
    static parse(s: string) {
        const m = /^([a-z][a-z0-9+.-]*):(?:\/\/)?(.*)$/i.exec(s)
        return m ? new Uri(m[1], s) : new Uri('file', s)
    }
    static joinPath(base: Uri, ...segments: string[]) { return new Uri(base.scheme, join(base.path, ...segments)) }
    with(change: { path?: string; scheme?: string }) { return new Uri(change.scheme ?? this.scheme, change.path ?? this.path) }
    toString() { return this.scheme === 'file' ? `file://${this.path}` : this.path }
}

export class Position { constructor(readonly line: number, readonly character: number) {} }
export class Range {
    readonly start: Position
    readonly end: Position
    constructor(a: Position | number, b: Position | number, c?: number, d?: number) {
        this.start = typeof a === 'number' ? new Position(a, b as number) : a
        this.end = typeof a === 'number' ? new Position(c!, d!) : (b as Position)
    }
}
export class RelativePattern {
    readonly base: string
    constructor(base: Uri | string, readonly pattern: string) { this.base = typeof base === 'string' ? base : base.fsPath }
}

// ── documents ─────────────────────────────────────────────────────────────────────────────────────
const offsetAt = (text: string, p: Position) => {
    const lines = text.split('\n')
    if (p.line >= lines.length) return text.length
    let o = 0
    for (let i = 0; i < p.line; i++) o += lines[i].length + 1
    return Math.min(o + p.character, text.length)
}

export class FakeDocument {
    saved = 0
    constructor(readonly uri: Uri, public text: string) {}
    get fileName() { return this.uri.fsPath }
    get lineCount() { return this.text.split('\n').length }
    getText() { return this.text }
    positionAt(offset: number) {
        const before = this.text.slice(0, offset).split('\n')
        return new Position(before.length - 1, before[before.length - 1].length)
    }
    lineAt(line: number) { return { text: this.text.split('\n')[line] ?? '' } }
    async save() {
        mkdirSync(dirname(this.uri.fsPath), { recursive: true })
        writeFileSync(this.uri.fsPath, this.text)
        this.saved++
        return true
    }
}

type Op =
    | { kind: 'replace'; uri: Uri; range: Range; text: string }
    | { kind: 'insert'; uri: Uri; pos: Position; text: string }
    | { kind: 'create'; uri: Uri }
    | { kind: 'delete'; uri: Uri }

export class WorkspaceEdit {
    readonly ops: Op[] = []
    replace(uri: Uri, range: Range, text: string) { this.ops.push({ kind: 'replace', uri, range, text }) }
    insert(uri: Uri, pos: Position, text: string) { this.ops.push({ kind: 'insert', uri, pos, text }) }
    createFile(uri: Uri) { this.ops.push({ kind: 'create', uri }) }
    deleteFile(uri: Uri) { this.ops.push({ kind: 'delete', uri }) }
}

// ── globbing for findFiles / watchers ────────────────────────────────────────────────────────────
export function globToRegExp(glob: string): RegExp {
    let re = ''
    for (let i = 0; i < glob.length; i++) {
        const c = glob[i]
        if (c === '*' && glob[i + 1] === '*') {
            if (glob[i + 2] === '/') { re += '(?:.*/)?'; i += 2 } else { re += '.*'; i++ }
        } else if (c === '*') re += '[^/]*'
        else if (c === '{') {
            const end = glob.indexOf('}', i)
            re += '(?:' + glob.slice(i + 1, end).split(',').map((s) => s.replace(/[.+^$()|[\]\\]/g, '\\$&').replace(/\*/g, '[^/]*')).join('|') + ')'
            i = end
        } else if ('.+^$()|[]\\'.includes(c)) re += '\\' + c
        else re += c
    }
    return new RegExp('^' + re + '$')
}

function walk(dir: string, out: string[] = []): string[] {
    if (!existsSync(dir)) return out
    for (const e of readdirSync(dir)) {
        const p = join(dir, e)
        if (statSync(p).isDirectory()) walk(p, out)
        else out.push(p)
    }
    return out
}

// ── state the tests drive ────────────────────────────────────────────────────────────────────────
type Answer = unknown | ((items: any, options: any) => unknown)

export const fake = {
    answers: [] as Answer[],
    prompts: [] as { kind: string; items?: any; options?: any }[],
    messages: [] as { level: 'error' | 'warning' | 'info'; text: string; items: string[] }[],
    messageAnswer: undefined as string | undefined,
    shown: [] as string[],
    executed: [] as { command: string; args: unknown[] }[],
    commands: new Map<string, (...args: any[]) => any>(),
    documents: new Map<string, FakeDocument>(),
    config: new Map<string, unknown>(),
    configUpdates: [] as { key: string; value: unknown; target: unknown }[],
    workspaceRoot: undefined as string | undefined,
    activeEditor: undefined as { document: FakeDocument } | undefined,
    tasks: [] as any[],
    opened: [] as string[],
    providers: [] as any[],
    codeActionProviders: [] as any[],
    watchers: [] as FakeWatcher[],
    applyEditResult: true,
    onDidChangeActiveTextEditor: new EventEmitter<unknown>(),
    onDidSaveTextDocument: new EventEmitter<unknown>(),
    onDidChangeTextDocument: new EventEmitter<{ document: FakeDocument; contentChanges: unknown[] }>(),
    onDidChangeConfiguration: new EventEmitter<{ affectsConfiguration(key: string): boolean }>(),
    onDidReceiveDebugSessionCustomEvent: new EventEmitter<unknown>(),
    /** Answers by question instead of by order (when set, the queue is not consulted). */
    respond: undefined as undefined | ((kind: string, items: any, options: any) => unknown),
    answer(...a: Answer[]) { this.answers.push(...a) },
    reset() {
        this.answers = []; this.prompts = []; this.messages = []; this.shown = []; this.executed = []
        this.commands.clear(); this.documents.clear(); this.config.clear(); this.configUpdates = []
        this.workspaceRoot = undefined; this.activeEditor = undefined; this.tasks = []; this.opened = []
        this.providers = []; this.codeActionProviders = []; this.watchers = []; this.applyEditResult = true
        this.messageAnswer = undefined
        this.respond = undefined
        for (const k of ['onDidChangeActiveTextEditor', 'onDidSaveTextDocument', 'onDidChangeTextDocument',
            'onDidChangeConfiguration', 'onDidReceiveDebugSessionCustomEvent'] as const) (this as any)[k] = new EventEmitter()
    },
    /** A document as an open editor would hold it (unsaved text wins over disk). */
    doc(path: string): FakeDocument {
        let d = this.documents.get(path)
        if (!d) {
            d = new FakeDocument(Uri.file(path), existsSync(path) ? readFileSync(path, 'utf8') : '')
            this.documents.set(path, d)
        }
        return d
    },
}

function nextAnswer(kind: string, items?: any, options?: any) {
    fake.prompts.push({ kind, items, options })
    if (fake.respond) return fake.respond(kind, items, options)
    if (fake.answers.length === 0) return undefined
    const a = fake.answers.shift()
    return typeof a === 'function' ? (a as any)(items, options) : a
}

/** Pick a quick-pick item by its label (or a predicate). */
export const pick = (label: string | ((i: any) => boolean)) => (items: any[]) =>
    items.find((i) => (typeof label === 'string' ? (i.label ?? i) === label : label(i)))

export class FakeWatcher {
    readonly created = new EventEmitter<Uri>()
    readonly changed = new EventEmitter<Uri>()
    readonly deleted = new EventEmitter<Uri>()
    disposed = false
    constructor(readonly pattern: string | RelativePattern) {}
    onDidCreate = this.created.event
    onDidChange = this.changed.event
    onDidDelete = this.deleted.event
    dispose() { this.disposed = true }
}

async function find(include: string | RelativePattern, exclude?: string | null, max?: number): Promise<Uri[]> {
    const base = typeof include === 'string' ? fake.workspaceRoot : include.base
    if (!base) return []
    const inc = globToRegExp(typeof include === 'string' ? include : include.pattern)
    const exc = exclude ? globToRegExp(exclude) : undefined
    const hits = walk(base).map((p) => relative(base, p)).filter((r) => inc.test(r) && !(exc && exc.test(r)))
    return hits.slice(0, max ?? hits.length).map((r) => Uri.file(join(base, r)))
}

export const window = {
    get activeTextEditor() { return fake.activeEditor },
    showQuickPick: async (items: any, options?: any) => nextAnswer('quickPick', await items, options),
    showInputBox: async (options?: any) => {
        const a = nextAnswer('inputBox', undefined, options)
        if (typeof a === 'string' && options?.validateInput) {
            const err = options.validateInput(a)
            if (err) throw new Error(`input "${a}" rejected: ${err}`)
        }
        return a
    },
    showOpenDialog: async (options?: any) => nextAnswer('openDialog', undefined, options),
    showErrorMessage: (text: string, ...items: string[]) => { fake.messages.push({ level: 'error', text, items }); return Promise.resolve(fake.messageAnswer) },
    showWarningMessage: (text: string, ...items: string[]) => { fake.messages.push({ level: 'warning', text, items }); return Promise.resolve(fake.messageAnswer) },
    showInformationMessage: (text: string, ...items: string[]) => { fake.messages.push({ level: 'info', text, items }); return Promise.resolve(fake.messageAnswer) },
    showTextDocument: async (uri: Uri) => { fake.shown.push(uri.fsPath) },
    withProgress: async (_o: unknown, task: () => Promise<unknown>) => task(),
    onDidChangeActiveTextEditor: (l: Listener<unknown>) => fake.onDidChangeActiveTextEditor.event(l),
    registerCustomEditorProvider: (viewType: string, provider: unknown, options: unknown) => {
        fake.providers.push({ viewType, provider, options })
        return new Disposable()
    },
}

export const ConfigurationTarget = { Global: 1, Workspace: 2, WorkspaceFolder: 3 }
export const ProgressLocation = { Notification: 15 }

export const workspace = {
    get workspaceFolders() { return fake.workspaceRoot ? [{ uri: Uri.file(fake.workspaceRoot), name: 'ws', index: 0 }] : undefined },
    get textDocuments() { return [...fake.documents.values()] },
    getWorkspaceFolder: (uri: Uri) => (fake.workspaceRoot && uri.fsPath.startsWith(fake.workspaceRoot)
        ? { uri: Uri.file(fake.workspaceRoot), name: 'ws', index: 0 } : undefined),
    openTextDocument: async (uri: Uri) => fake.doc(uri.fsPath),
    applyEdit: async (edit: WorkspaceEdit) => {
        if (!fake.applyEditResult) return false
        for (const op of edit.ops) {
            const p = op.uri.fsPath
            if (op.kind === 'delete') { rmSync(p, { force: true }); fake.documents.delete(p); continue }
            if (op.kind === 'create') { mkdirSync(dirname(p), { recursive: true }); if (!existsSync(p)) writeFileSync(p, ''); fake.doc(p); continue }
            const d = fake.doc(p)
            if (op.kind === 'insert') {
                const o = offsetAt(d.text, op.pos)
                d.text = d.text.slice(0, o) + op.text + d.text.slice(o)
            } else {
                d.text = d.text.slice(0, offsetAt(d.text, op.range.start)) + op.text + d.text.slice(offsetAt(d.text, op.range.end))
            }
            fake.onDidChangeTextDocument.fire({ document: d, contentChanges: [{}] })
        }
        return true
    },
    findFiles: find,
    createFileSystemWatcher: (pattern: string | RelativePattern) => {
        const w = new FakeWatcher(pattern)
        fake.watchers.push(w)
        return w
    },
    getConfiguration: (section?: string) => {
        const key = (k: string) => (section ? `${section}.${k}` : k)
        return {
            get: <T>(k: string, def?: T) => (fake.config.has(key(k)) ? fake.config.get(key(k)) as T : def),
            inspect: (k: string) => ({ key: key(k), workspaceValue: fake.config.get(`ws:${key(k)}`) }),
            update: async (k: string, value: unknown, target: unknown) => {
                fake.configUpdates.push({ key: key(k), value, target })
                fake.config.set(key(k), value)
            },
        }
    },
    onDidChangeConfiguration: (l: Listener<any>) => fake.onDidChangeConfiguration.event(l),
    onDidSaveTextDocument: (l: Listener<unknown>) => fake.onDidSaveTextDocument.event(l),
    onDidChangeTextDocument: (l: Listener<any>) => fake.onDidChangeTextDocument.event(l),
    fs: {
        stat: async (uri: Uri) => { if (!existsSync(uri.fsPath)) throw new Error('FileNotFound'); return statSync(uri.fsPath) },
        readFile: async (uri: Uri) => readFileSync(uri.fsPath),
    },
}

export const commands = {
    registerCommand: (id: string, fn: (...args: any[]) => any) => {
        fake.commands.set(id, fn)
        return new Disposable(() => fake.commands.delete(id))
    },
    executeCommand: async (command: string, ...args: unknown[]) => {
        fake.executed.push({ command, args })
        return fake.commands.get(command)?.(...args)
    },
}

export class CodeAction {
    edit?: WorkspaceEdit
    constructor(readonly title: string, readonly kind: unknown) {}
}
export const CodeActionKind = { QuickFix: 'quickfix' }
export const languages = {
    registerCodeActionsProvider: (selector: unknown, provider: unknown, meta: unknown) => {
        fake.codeActionProviders.push({ selector, provider, meta })
        return new Disposable()
    },
}

export class ShellExecution { constructor(readonly command: string, readonly options: unknown) {} }
export class Task {
    constructor(readonly definition: unknown, readonly scope: unknown, readonly name: string, readonly source: string, readonly execution: ShellExecution) {}
}
export const tasks = { executeTask: async (t: Task) => { fake.tasks.push(t) } }
export const debug = { onDidReceiveDebugSessionCustomEvent: (l: Listener<unknown>) => fake.onDidReceiveDebugSessionCustomEvent.event(l) }
export const env = { openExternal: async (uri: Uri) => { fake.opened.push(uri.toString()); return true } }
