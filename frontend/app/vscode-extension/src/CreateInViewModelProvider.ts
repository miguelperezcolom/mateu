import * as vscode from 'vscode'
import {
    extractBindings, javaTypeForDataType, declaresClass, computeFieldInsertion, simpleName,
} from './createInViewModel'

/**
 * A quick-fix on a `specs/ui/*.yaml` page: when a `FormField` binds an `id:` the page's bound
 * ModelView does not declare, offer "Create field '<id>' in <ViewModel>" and, on invoke, write the
 * field into the Java class — the VSCode twin of the IntelliJ CreateFieldInViewModelFix, so the
 * Layout ↔ ViewModel sync (visual-editor Phase 5, §G) works in both IDE hosts.
 *
 * The page YAML opens in the text editor by default (the custom visual editor is priority "option"),
 * so this text-editor code-action is the right surface. All the logic lives in the pure
 * createInViewModel core (unit-tested); this class only resolves the file and applies the edit.
 */
export class CreateInViewModelProvider implements vscode.CodeActionProvider {
    static readonly providedKinds = [vscode.CodeActionKind.QuickFix]

    static register(): vscode.Disposable {
        return vscode.languages.registerCodeActionsProvider(
            [
                { language: 'yaml', pattern: '**/specs/ui/*.yaml' },
                { language: 'yaml', pattern: '**/specs/ui/*.yml' },
            ],
            new CreateInViewModelProvider(),
            { providedCodeActionKinds: CreateInViewModelProvider.providedKinds },
        )
    }

    async provideCodeActions(
        document: vscode.TextDocument, range: vscode.Range | vscode.Selection,
    ): Promise<vscode.CodeAction[]> {
        const { modelView, fields } = extractBindings(document.getText())
        if (!modelView || fields.length === 0) return []

        // Only offer for the field whose `id:` line the cursor/selection is on — keeps the lightbulb tidy.
        const onLine = fields.filter((f) => this.idLine(document, f.id, range))
        if (onLine.length === 0) return []

        const java = await this.resolveViewModel(modelView)
        if (!java) return []

        const actions: vscode.CodeAction[] = []
        for (const f of onLine) {
            const ins = computeFieldInsertion(java.text, modelView, f.id, javaTypeForDataType(f.dataType))
            if (!ins) continue // already declared, a record, or an invalid id
            const action = new vscode.CodeAction(
                `Create field '${f.id}' in ${simpleName(modelView)}`, vscode.CodeActionKind.QuickFix,
            )
            const edit = new vscode.WorkspaceEdit()
            edit.insert(java.uri, java.doc.positionAt(ins.index), ins.text)
            action.edit = edit
            actions.push(action)
        }
        return actions
    }

    /** Whether the binding `id`'s `id: <id>` line intersects the requested range. */
    private idLine(document: vscode.TextDocument, id: string, range: vscode.Range): boolean {
        const re = new RegExp(`^\\s*id:\\s*["']?${id}\\b`)
        for (let line = range.start.line; line <= range.end.line; line++) {
            if (re.test(document.lineAt(line).text)) return true
        }
        return false
    }

    /** Find the Java file that declares `fqn` among the workspace candidates for its simple name. */
    private async resolveViewModel(
        fqn: string,
    ): Promise<{ uri: vscode.Uri; doc: vscode.TextDocument; text: string } | null> {
        const uris = await vscode.workspace.findFiles(`**/${simpleName(fqn)}.java`, '**/{node_modules,target,build}/**', 20)
        for (const uri of uris) {
            const doc = await vscode.workspace.openTextDocument(uri)
            const text = doc.getText()
            if (declaresClass(text, fqn)) return { uri, doc, text }
        }
        return null
    }
}
