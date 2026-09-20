import * as vscode from 'vscode'
import { MateuVisualEditorProvider } from './MateuVisualEditorProvider'
import { CreateInViewModelProvider } from './CreateInViewModelProvider'

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(MateuVisualEditorProvider.register(context))
    context.subscriptions.push(CreateInViewModelProvider.register())
}

export function deactivate() {}
