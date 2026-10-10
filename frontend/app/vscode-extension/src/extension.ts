import * as vscode from 'vscode'
import { MateuVisualEditorProvider } from './MateuVisualEditorProvider'
import { CreateInViewModelProvider } from './CreateInViewModelProvider'
import { NewMateuFileCommand } from './NewMateuFileCommand'
import { AddRouteCommand } from './AddRouteCommand'
import { LiveRunCommand } from './LiveRunCommand'

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(MateuVisualEditorProvider.register(context))
    context.subscriptions.push(CreateInViewModelProvider.register())
    context.subscriptions.push(NewMateuFileCommand.register(context))
    context.subscriptions.push(AddRouteCommand.register())
    context.subscriptions.push(LiveRunCommand.register())
}

export function deactivate() {}
