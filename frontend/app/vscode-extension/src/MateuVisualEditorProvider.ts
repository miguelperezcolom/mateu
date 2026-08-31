import * as vscode from 'vscode'
import * as fs from 'fs'
import { BackendProxy } from './backendProxy'

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

    private readonly proxy = new BackendProxy()

    constructor(private readonly context: vscode.ExtensionContext) {}

    async resolveCustomTextEditor(
        document: vscode.TextDocument,
        panel: vscode.WebviewPanel,
        _token: vscode.CancellationToken,
    ): Promise<void> {
        const backend = vscode.workspace.getConfiguration().get<string>('mateu.baseUrl', 'http://localhost:8594')
        const port = await this.proxy.ensureStarted(backend)
        const webview = panel.webview
        const mediaRoot = vscode.Uri.joinPath(this.context.extensionUri, 'media')
        webview.options = { enableScripts: true, localResourceRoots: [mediaRoot] }
        webview.html = this.buildHtml(webview, mediaRoot, port)

        let savingFromWebview = false

        const onMessage = webview.onDidReceiveMessage((msg) => {
            if (!msg || typeof msg !== 'object') return
            if (msg.type === 'ready') {
                webview.postMessage({ type: 'init', yaml: document.getText(), baseUrl: `http://127.0.0.1:${port}`, path: relativeSpecsUiPath(document.uri) })
            } else if (msg.type === 'save' && typeof msg.yaml === 'string') {
                if (document.getText() === msg.yaml) return
                savingFromWebview = true
                const edit = new vscode.WorkspaceEdit()
                edit.replace(document.uri, new vscode.Range(0, 0, document.lineCount, 0), msg.yaml)
                vscode.workspace.applyEdit(edit).then(() => { savingFromWebview = false })
            } else if (msg.type === 'listFiles') {
                // Project awareness: hand the whole mount to the editor's reference pickers.
                collectSpecsUiFiles(document.uri).then((files) => webview.postMessage({ type: 'files', files }))
            }
        })

        // Push out-of-band edits (the file changed in the text editor / on disk) back to the webview.
        const onDocChange = vscode.workspace.onDidChangeTextDocument((e) => {
            if (e.document.uri.toString() !== document.uri.toString()) return
            if (savingFromWebview || e.contentChanges.length === 0) return
            webview.postMessage({ type: 'externalChange', yaml: document.getText() })
        })

        panel.onDidDispose(() => { onMessage.dispose(); onDocChange.dispose() })
    }

    /** The bundle's index.html, rewritten for the webview: CSP, the host baseUrl, and the entry asset. */
    private buildHtml(webview: vscode.Webview, mediaRoot: vscode.Uri, port: number): string {
        const indexPath = vscode.Uri.joinPath(mediaRoot, 'index.html')
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
            `connect-src ${origin}`,
        ].join('; ')

        const head = `
    <meta http-equiv="Content-Security-Policy" content="${csp}">
    <script nonce="${nonce}">window.__mateuBaseUrl = '${origin}';</script>`

        // Inject the CSP + baseUrl bootstrap before the module entry (which VSCode injects
        // acquireVsCodeApi() ahead of, so the web app already sees the IDE host on first render).
        return html.replace('</head>', `${head}\n  </head>`)
    }
}

function makeNonce(): string {
    let s = ''
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    for (let i = 0; i < 32; i++) s += chars.charAt(Math.floor(Math.random() * chars.length))
    return s
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

async function collectSpecsUiFiles(docUri: vscode.Uri): Promise<{ path: string; content: string }[]> {
    const marker = '/specs/ui/'
    const idx = docUri.path.lastIndexOf(marker)
    if (idx < 0) return []
    const rootPath = docUri.path.slice(0, idx + marker.length - 1)
    const rootUri = docUri.with({ path: rootPath })
    const uris = await vscode.workspace.findFiles(new vscode.RelativePattern(rootUri, '**/*.{yaml,yml}'))
    const out: { path: string; content: string }[] = []
    for (const u of uris) {
        const rel = u.path.slice(rootPath.length + 1)
        const bytes = await vscode.workspace.fs.readFile(u)
        out.push({ path: rel, content: Buffer.from(bytes).toString('utf8') })
    }
    return out
}
