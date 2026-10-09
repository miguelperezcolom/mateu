import { PageDoc, PageNode, NodePath, presentSlots, slotSeg } from './pageModel'

/**
 * Design notes (an idea from m3e-canvas, where each element carries a note of what it should do and
 * the notes end up in the prompt). Here a note is the `note:` key any component accepts — authoring
 * only: the schema documents it, the server and the browser's expander ignore it, so it never
 * reaches the screen. It is the author's intent, written where it applies ("unique per customer",
 * "only managers may change it"), and it travels with the file — to a reviewer, to a share link, to
 * an agent.
 *
 * Its payoff is the step a definition-only page cannot take by itself: the view model. A page you
 * drew has the layout but no behaviour; the notes are what that behaviour should be, so the prompt
 * that asks for the class carries them, each tied to the component it is about.
 */
export interface NodeNote {
    path: NodePath
    type: string
    /** What identifies the component to a reader: its id, label, text or action. */
    name?: string
    note: string
}

/** Every note in the page, in reading order (a component, then its parts, then its children). */
export function collectNotes(doc: PageDoc | undefined): NodeNote[] {
    const out: NodeNote[] = []
    const visit = (node: PageNode, path: NodePath) => {
        if (typeof node.note === 'string' && node.note.trim()) {
            out.push({ path, type: node.type, name: nameOf(node), note: node.note.trim() })
        }
        for (const key of presentSlots(node)) {
            ;(node[key] as PageNode[]).forEach((c, i) => visit(c, [...path, slotSeg(key, i)]))
        }
        ;(Array.isArray(node.content) ? node.content : []).forEach((c, i) => visit(c, [...path, i]))
    }
    if (doc) visit(doc.layout, [])
    return out
}

function nameOf(node: PageNode): string | undefined {
    for (const k of ['id', 'label', 'title', 'text', 'actionId']) {
        const v = node[k]
        if (typeof v === 'string' && v.trim()) return v.trim()
    }
    return undefined
}

export interface ViewModelPromptInput {
    /** The definition as it will be saved. */
    yaml: string
    /** Its path under specs/ui, if known. */
    path?: string
    /** The route that serves it, if any. */
    route?: string
    /** The view model it is already bound to, if any (then the prompt asks to complete it). */
    viewModel?: string
    notes: NodeNote[]
}

/**
 * The prompt that asks a coding agent for the page's view model: the Java class whose fields and
 * actions the layout binds to, the behaviour the notes describe, and the one line that wires it in.
 * Deterministic, so it is unit-testable; the editor copies it, it never calls a model itself.
 */
export function buildViewModelPrompt(input: ViewModelPromptInput): string {
    const lines: string[] = []
    const where = input.path ? `specs/ui/${input.path}` : 'this definition'
    if (input.viewModel) {
        lines.push(`Complete the Mateu view model \`${input.viewModel}\` so it serves the page layout in ${where}.`)
    } else {
        lines.push(`Write the Java view model (a Mateu ViewModel class) that serves the page layout in ${where}.`)
    }
    lines.push('')
    lines.push('How the layout binds to the class:')
    lines.push('- Every `FormField` id is a field of the class (same name), typed for its `dataType`; validation annotations (@NotEmpty, @Min…) where the notes ask for rules.')
    lines.push('- Every `Button` `actionId` (and every entry of `actions:`) is a public method annotated @Action; it returns what the screen should do next (a Message, a URI to navigate, the view itself).')
    lines.push('- Keep the layout as it is: the definition owns the layout, the class owns data and behaviour. Do not add @Section/@Zones/layout annotations that would compete with it.')
    lines.push('- Instantiated per request: inject services with @Autowired fields; no mutable singleton state.')
    if (!input.viewModel) {
        lines.push(`- Then bind it: in routes.yaml, add \`viewModel: <fully.qualified.ClassName>\` to the entry${input.route !== undefined ? ` for route \`${input.route}\`` : ''} that renders ${input.path ?? 'this file'}.`)
    }
    lines.push('')
    if (input.notes.length) {
        lines.push('What each part must do (the author\'s design notes — treat them as requirements):')
        for (const n of input.notes) {
            const who = n.name ? `${n.type} \`${n.name}\`` : n.type
            lines.push(`- ${n.path.length ? who : `The page (${who})`}: ${n.note}`)
        }
    } else {
        lines.push('The layout carries no design notes: infer the behaviour from the field names and button labels, and say what you assumed.')
    }
    lines.push('')
    lines.push('The layout:')
    lines.push('```yaml')
    lines.push(input.yaml.trimEnd())
    lines.push('```')
    return lines.join('\n')
}
