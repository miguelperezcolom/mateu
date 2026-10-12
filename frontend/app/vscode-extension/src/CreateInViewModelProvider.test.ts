import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import * as vscode from 'vscode'
import { fake } from './test/vscode'
import { CreateInViewModelProvider } from './CreateInViewModelProvider'

// The quick-fix glue: the lightbulb only on the `id:` line of an unbound field, and the edit lands
// inside the right Java class.

let ws: string
const PAGE = [
    'modelView: com.acme.PersonView',
    'layout:',
    '  type: FormLayout',
    '  content:',
    '    - type: FormField',
    '      id: name',
    '    - type: FormField',
    '      id: age',
    '      dataType: integer',
].join('\n')
const JAVA = 'package com.acme;\n\npublic class PersonView {\n    String name;\n}\n'

beforeEach(() => {
    fake.reset()
    ws = mkdtempSync(join(tmpdir(), 'mateu-cvm-'))
    fake.workspaceRoot = ws
    mkdirSync(join(ws, 'src/main/java/com/acme'), { recursive: true })
    // a homonym in another package must not be the one edited
    mkdirSync(join(ws, 'src/main/java/com/other'), { recursive: true })
    writeFileSync(join(ws, 'src/main/java/com/other/PersonView.java'), 'package com.other;\npublic class PersonView {}\n')
    writeFileSync(join(ws, 'src/main/java/com/acme/PersonView.java'), JAVA)
    // build output is never a candidate
    mkdirSync(join(ws, 'target/x/com/acme'), { recursive: true })
    writeFileSync(join(ws, 'target/x/com/acme/PersonView.java'), JAVA)
})
afterEach(() => rmSync(ws, { recursive: true, force: true }))

const lineOf = (text: string, needle: string) => text.split('\n').findIndex((l) => l.includes(needle))

describe('CreateInViewModelProvider', () => {
    it('registers for specs/ui pages only, as a quick fix', () => {
        CreateInViewModelProvider.register()
        const { selector, meta } = fake.codeActionProviders[0]
        expect(selector.map((s: any) => s.pattern)).toEqual(['**/specs/ui/*.yaml', '**/specs/ui/*.yml'])
        expect(meta.providedCodeActionKinds).toEqual([vscode.CodeActionKind.QuickFix])
    })

    it("offers 'Create field' on the id line of an undeclared field and inserts it into the right class", async () => {
        const page = fake.doc(join(ws, 'page.yaml'))
        page.text = PAGE
        const at = lineOf(PAGE, 'id: age')
        const actions = await new CreateInViewModelProvider().provideCodeActions(page as any, new vscode.Range(at, 0, at, 0))
        expect(actions.map((a) => a.title)).toEqual(["Create field 'age' in PersonView"])
        await vscode.workspace.applyEdit(actions[0].edit as any)
        const java = fake.doc(join(ws, 'src/main/java/com/acme/PersonView.java')).getText()
        expect(java).toMatch(/Integer age;/)
        expect(java.indexOf('Integer age')).toBeLessThan(java.lastIndexOf('}'))
        expect(fake.doc(join(ws, 'src/main/java/com/other/PersonView.java')).getText()).not.toMatch(/Integer age/)
    })

    it('stays quiet on a declared field, on another line, or without a model view', async () => {
        const page = fake.doc(join(ws, 'page.yaml'))
        page.text = PAGE
        const p = new CreateInViewModelProvider()
        const name = lineOf(PAGE, 'id: name')
        expect(await p.provideCodeActions(page as any, new vscode.Range(name, 0, name, 0))).toEqual([])
        expect(await p.provideCodeActions(page as any, new vscode.Range(0, 0, 0, 0))).toEqual([])
        page.text = PAGE.replace('modelView: com.acme.PersonView\n', '')
        expect(await p.provideCodeActions(page as any, new vscode.Range(0, 0, 8, 0))).toEqual([])
        page.text = PAGE.replace('com.acme.PersonView', 'com.acme.Missing')
        expect(await p.provideCodeActions(page as any, new vscode.Range(0, 0, 8, 0))).toEqual([])
    })
})
