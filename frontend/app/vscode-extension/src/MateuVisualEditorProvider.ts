import * as vscode from 'vscode'
import { connectSrc, sourceOrigins } from './csp'
import * as fs from 'fs'
import { randomBytes } from 'crypto'
import { BackendProxy } from './backendProxy'
import * as path from 'path'
import { copyInto, imageUrlPath, isImage, isWritableSpecPath, listImages, moduleRootOf, type Found } from './projectImages'

/**
 * Opens Mateu visual-builder pages (`specs/ui/*.yaml`) in the cross-IDE web visual editor, hosted in
 * a VSCode webview. The SAME web bundle as the IntelliJ JCEF host: the editor's HostBridge speaks
 * `acquireVsCodeApi()` here, so the web side needs no VSCode-specific code — this provider only wires
 * the bundle into a webview, seeds the document text via `init`, writes `save` back to the document,
 * and starts a local CORS proxy so the app can reach the backend.
 */
export class MateuVisualEditorProvider implements vscode.CustomTextEditorProvider {

    static register(context: vscode.ExtensionContext): vscode.Disposable {
        return vscode.window.registerCustomEditorProvider(
            'mateu.visualEditor',
            new MateuVisualEditorProvider(context),
            { webviewOptions: { retainContextWhenHidden: true } },
        )
    }

    private readonly proxy: BackendProxy

    constructor(private readonly context: vscode.ExtensionContext) {
        // it also serves the Redwood canvas from the bundle (media/redwood, media/redwood-preview.html)
        this.proxy = new BackendProxy(vscode.Uri.joinPath(context.extensionUri, 'media').fsPath)
    }

    async resolveCustomTextEditor(
        document: vscode.TextDocument,
        panel: vscode.WebviewPanel,
        _token: vscode.CancellationToken,
    ): Promise<void> {
        const backend = vscode.workspace.getConfiguration().get<string>('mateu.baseUrl', 'http://localhost:8080')
        const port = await this.proxy.ensureStarted(backend)
        const webview = panel.webview
        const mediaRoot = vscode.Uri.joinPath(this.context.extensionUri, 'media')
        // The module the page belongs to: its images are what the image pickers offer. The webview may
        // load them (thumbnails as webview URIs), so the module is a resource root too.
        const moduleRoot = document.uri.scheme === 'file'
            ? moduleRootOf(document.uri.fsPath, vscode.workspace.getWorkspaceFolder(document.uri)?.uri.fsPath)
            : undefined
        webview.options = { enableScripts: true, localResourceRoots: moduleRoot ? [mediaRoot, vscode.Uri.file(moduleRoot)] : [mediaRoot] }
        const imageToken = moduleRoot ? this.proxy.registerImageRoot(moduleRoot) : undefined
        // thumb: a webview URI (the picker); src: the loopback server's URL, which the canvas — and the
        // Redwood app it frames from that server — can load (a webview URI does not load in that frame)
        const imageEntry = (found: Found) => ({
            path: found.path,
            url: found.url,
            thumb: webview.asWebviewUri(vscode.Uri.file(path.join(moduleRoot!, ...found.path.split('/')))).toString(),
            src: `http://127.0.0.1:${port}${imageUrlPath(imageToken!, found.path)}`,
        })
        const sendImages = () => webview.postMessage({ type: 'images', images: moduleRoot ? listImages(moduleRoot).map(imageEntry) : [] })
        // The CSP names the REST source origins the project declares; when sources.yaml changes so
        // that set changes, the webview is rebuilt (it re-inits from the document, nothing is lost).
        let origins = sourceOrigins((await collectSpecsUiFiles(document.uri)).map((f) => f.content))
        webview.html = this.buildHtml(webview, mediaRoot, port, backend, origins)
        let rebuildTimer: ReturnType<typeof setTimeout> | undefined
        const refreshOrigins = () => {
            clearTimeout(rebuildTimer)
            rebuildTimer = setTimeout(async () => {
                const files = await collectSpecsUiFiles(document.uri)
                const next = sourceOrigins(files.map((f) => f.content))
                // a page created/changed/deleted while the editor is open reaches its pickers
                if (next.join(' ') === origins.join(' ')) {
                    webview.postMessage({ type: 'files', files })
                    return
                }
                origins = next
                webview.html = this.buildHtml(webview, mediaRoot, port, backend, origins)
            }, 500)
        }
        const root = specsUiRoot(document.uri)
        const watcher = root ? vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(root, '**/*.{yaml,yml}')) : undefined
        watcher?.onDidChange(refreshOrigins)
        watcher?.onDidCreate(refreshOrigins)
        watcher?.onDidDelete(refreshOrigins)
        // an image added, changed or removed in the module reaches the pickers
        let imagesTimer: ReturnType<typeof setTimeout> | undefined
        const refreshImages = (uri: vscode.Uri) => {
            if (!isImage(uri.path)) return
            clearTimeout(imagesTimer)
            imagesTimer = setTimeout(sendImages, 300)
        }
        const imageWatcher = moduleRoot
            ? vscode.workspace.createFileSystemWatcher(new vscode.RelativePattern(vscode.Uri.file(moduleRoot), '**/*.{png,jpg,jpeg,gif,svg,webp,avif,PNG,JPG,JPEG,GIF,SVG,WEBP,AVIF}'))
            : undefined
        imageWatcher?.onDidChange(refreshImages)
        imageWatcher?.onDidCreate(refreshImages)
        imageWatcher?.onDidDelete(refreshImages)

        let savingFromWebview = false

        const onMessage = webview.onDidReceiveMessage((msg) => {
            if (!msg || typeof msg !== 'object') return
            if (msg.type === 'ready') {
                webview.postMessage({ type: 'init', yaml: document.getText(), baseUrl: `http://127.0.0.1:${port}`, path: relativeSpecsUiPath(document.uri) })
            } else if ((msg.type === 'contentChanged' || msg.type === 'save') && typeof msg.yaml === 'string') {
                // The web bundle posts `contentChanged` on every edit (see hostBridge.ts); `save` is
                // kept as an alias for parity with the IntelliJ host. Applying the edit marks the
                // document dirty so VSCode's native Ctrl+S / save-all writes it to disk.
                if (document.getText() === msg.yaml) return
                savingFromWebview = true
                const edit = new vscode.WorkspaceEdit()
                edit.replace(document.uri, new vscode.Range(0, 0, document.lineCount, 0), msg.yaml)
                vscode.workspace.applyEdit(edit).then(() => { savingFromWebview = false })
            } else if (msg.type === 'listFiles') {
                // Project awareness: hand the whole mount to the editor's reference pickers.
                collectSpecsUiFiles(document.uri).then((files) => webview.postMessage({ type: 'files', files }))
            } else if (msg.type === 'listImages') {
                sendImages()
            } else if (msg.type === 'addImage') {
                // "Add image to project…": pick a file, copy it into the module's images folder
                const answer = (image: unknown) => webview.postMessage({ type: 'imageAdded', image })
                if (!moduleRoot) { answer(null); return }
                vscode.window.showOpenDialog({
                    canSelectMany: false, openLabel: 'Add to project', title: 'Add image to project',
                    filters: { Images: ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'avif'] },
                }).then((picked) => {
                    const source = picked?.[0]
                    if (!source) { answer(null); return }
                    try {
                        answer(imageEntry(copyInto(moduleRoot, source.fsPath)))
                        sendImages()
                    } catch (e) {
                        vscode.window.showErrorMessage(`Could not add the image: ${(e as Error).message}`)
                        answer(null)
                    }
                })
            } else if (msg.type === 'writeFile' && typeof msg.path === 'string' && (typeof msg.content === 'string' || msg.content === null)) {
                // The board's edits: another file of the mount (a route, a menu entry, a new screen).
                const root = specsUiRoot(document.uri)
                if (root && isWritableSpecPath(msg.path)) writeSpecFile(vscode.Uri.joinPath(root, msg.path), msg.content)
            } else if (msg.type === 'openFile' && typeof msg.path === 'string') {
                // The board's Edit: open another file of the mount in a visual editor of its own.
                const root = specsUiRoot(document.uri)
                if (root && !msg.path.split('/').includes('..')) {
                    vscode.commands.executeCommand('vscode.openWith', vscode.Uri.joinPath(root, msg.path), 'mateu.visualEditor')
                }
            }
        })

        // Push out-of-band edits (the file changed in the text editor / on disk) back to the webview.
        const onDocChange = vscode.workspace.onDidChangeTextDocument((e) => {
            if (e.document.uri.toString() !== document.uri.toString()) return
            if (savingFromWebview || e.contentChanges.length === 0) return
            webview.postMessage({ type: 'externalChange', yaml: document.getText() })
        })

        panel.onDidDispose(() => {
            onMessage.dispose(); onDocChange.dispose(); watcher?.dispose(); imageWatcher?.dispose()
            clearTimeout(rebuildTimer); clearTimeout(imagesTimer)
        })
    }

    /** The bundle's index.html, rewritten for the webview: CSP, the host baseUrl, and the entry asset. */
    private buildHtml(webview: vscode.Webview, mediaRoot: vscode.Uri, port: number, backend: string, origins: string[]): string {
        const indexPath = vscode.Uri.joinPath(mediaRoot, 'index.html')
        // The web bundle is copied into media/ by `npm run copy:web`; the dir is gitignored, so a fresh
        // checkout has none. Fail with an actionable message instead of a raw ENOENT that blanks the panel.
        if (!fs.existsSync(indexPath.fsPath)) {
            return `<!doctype html><html><body style="font-family: var(--vscode-font-family); padding: 2rem; color: var(--vscode-foreground)">
                <h3>Mateu Visual Editor bundle not found</h3>
                <p>The web bundle is missing at <code>media/</code>. Build and copy it, then reopen this editor:</p>
                <pre style="padding:.75rem;background:var(--vscode-textCodeBlock-background);border-radius:4px">cd frontend/app/vscode-extension &amp;&amp; npm run copy:web</pre>
            </body></html>`
        }
        let html = fs.readFileSync(indexPath.fsPath, 'utf8')

        // Rewrite the entry module src (./assets/index-*.js) to a webview resource URI. Its lazy
        // chunks resolve relative to this URL, so they load from media/assets too.
        const entry = /\.\/assets\/[^"']+\.js/.exec(html)?.[0]
        if (entry) {
            const uri = webview.asWebviewUri(vscode.Uri.joinPath(mediaRoot, entry.replace('./', '')))
            html = html.replace(entry, uri.toString())
        }

        const nonce = makeNonce()
        const origin = `http://127.0.0.1:${port}`
        const csp = [
            `default-src 'none'`,
            `img-src ${webview.cspSource} data: ${origin}`,
            `style-src ${webview.cspSource} 'unsafe-inline'`,
            `font-src ${webview.cspSource} data:`,
            // 'unsafe-eval': the shared Mateu renderer evaluates ${...} label/rule expressions via
            // new Function(); harmless here (the webview only runs our own bundle + the local proxy).
            `script-src 'nonce-${nonce}' ${webview.cspSource} 'unsafe-eval'`,
            // The backend proxy, loopback, the backend's own origin and the REST sources the project
            // declares (the canvas fetches rows/options straight from the browser, as the app does).
            // Not "any https host" — see csp.ts.
            `connect-src ${connectSrc(origin, backend, origins)}`,
            // The Redwood canvas: the real Redwood/VB app, framed from the loopback server (it loads
            // JET and the VB runtime from Oracle's CDN inside its own document, not this one).
            `frame-src ${origin}`,
        ].join('; ')

        const head = `
    <meta http-equiv="Content-Security-Policy" content="${csp}">
    <script nonce="${nonce}">window.__mateuBaseUrl = '${origin}'; window.__mateuRedwoodPreview = '${origin}/redwood-preview.html';</script>`

        // Inject the CSP + baseUrl bootstrap before the module entry (which VSCode injects
        // acquireVsCodeApi() ahead of, so the web app already sees the IDE host on first render).
        return html.replace('</head>', `${head}\n  </head>`)
    }
}

/**
 * Write a mount file the way an edit does — a WorkspaceEdit (undoable in VS Code), then saved, since
 * the board's edits are explicit actions on files that are not open in this editor. A new file is
 * created; `null` deletes it (the undo of a screen the board created).
 */
async function writeSpecFile(uri: vscode.Uri, content: string | null): Promise<void> {
    const edit = new vscode.WorkspaceEdit()
    if (content === null) {
        edit.deleteFile(uri, { ignoreIfNotExists: true })
        await vscode.workspace.applyEdit(edit)
        return
    }
    let exists = true
    try { await vscode.workspace.fs.stat(uri) } catch { exists = false }
    if (!exists) {
        edit.createFile(uri, { ignoreIfExists: true })
        edit.insert(uri, new vscode.Position(0, 0), content)
    } else {
        const doc = await vscode.workspace.openTextDocument(uri)
        if (doc.getText() === content) return
        edit.replace(uri, new vscode.Range(0, 0, doc.lineCount, 0), content)
    }
    if (await vscode.workspace.applyEdit(edit)) {
        const doc = await vscode.workspace.openTextDocument(uri)
        await doc.save()
    }
}

// A CSP nonce is only worth anything if it cannot be predicted: from the CSPRNG, not Math.random.
function makeNonce(): string {
    return randomBytes(24).toString('base64url')
}

/**
 * Every `specs/ui/**` YAML file (path relative to `specs/ui`) so the editor can build its reference
 * index. The edited document lives under `specs/ui`, so that directory is the mount root.
 */
/** The document's path relative to its `specs/ui` directory (for the data-source binding resolver). */
function relativeSpecsUiPath(docUri: vscode.Uri): string | undefined {
    const marker = '/specs/ui/'
    const idx = docUri.path.lastIndexOf(marker)
    return idx < 0 ? undefined : docUri.path.slice(idx + marker.length)
}

function specsUiRoot(docUri: vscode.Uri): vscode.Uri | undefined {
    const marker = '/specs/ui/'
    const idx = docUri.path.lastIndexOf(marker)
    return idx < 0 ? undefined : docUri.with({ path: docUri.path.slice(0, idx + marker.length - 1) })
}

async function collectSpecsUiFiles(docUri: vscode.Uri): Promise<{ path: string; content: string }[]> {
    const marker = '/specs/ui/'
    const idx = docUri.path.lastIndexOf(marker)
    if (idx < 0) return []
    const rootPath = docUri.path.slice(0, idx + marker.length - 1)
    const rootUri = docUri.with({ path: rootPath })
    // Bound the scan (a huge monorepo could otherwise read thousands of files) and read them in
    // parallel rather than one-by-one; the reference index only needs the mount's own YAMLs.
    const uris = await vscode.workspace.findFiles(new vscode.RelativePattern(rootUri, '**/*.{yaml,yml}'), undefined, 500)
    return Promise.all(
        uris.map(async (u) => ({
            path: u.path.slice(rootPath.length + 1),
            content: Buffer.from(await vscode.workspace.fs.readFile(u)).toString('utf8'),
        })),
    )
}
