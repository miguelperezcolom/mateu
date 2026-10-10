import * as vscode from 'vscode'
import { MateuVisualEditorProvider } from './MateuVisualEditorProvider'
import { CreateInViewModelProvider } from './CreateInViewModelProvider'
import { NewMateuFileCommand } from './NewMateuFileCommand'

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(MateuVisualEditorProvider.register(context))
    context.subscriptions.push(CreateInViewModelProvider.register())
    context.subscriptions.push(NewMateuFileCommand.register(context))
}

export function deactivate() {}
