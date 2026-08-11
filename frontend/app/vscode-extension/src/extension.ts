import * as vscode from 'vscode'
import { MateuVisualEditorProvider } from './MateuVisualEditorProvider'

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(MateuVisualEditorProvider.register(context))
}

export function deactivate() {}
