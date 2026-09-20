import { PageDoc } from './pageModel'

/**
 * The declared-flow editor model (visual-editor Phase 3 — the VB "action chain" analog). A page-level
 * action can carry a `steps:` FLOW that runs client-side with no round-trip: the bounded v0 verbs
 * Navigate / Emit / CloseOverlay / RunAction / MarkClean / MarkDirty (each lowers 1:1 to a wire command).
 * Authorable classless in YAML now that the runtime registers the verbs (see YamlDeclaredFlowSyncTest).
 *
 * Pure read/write over `PageDoc.rest.actions` (the preserved envelope); `extra` keeps any unmodelled
 * field so a round trip is lossless. Deep logic still lives in a `@Action`; a step delegates via RunAction.
 */
export const STEP_TYPES = ['Navigate', 'Emit', 'CloseOverlay', 'RunAction', 'MarkClean', 'MarkDirty'] as const
export type StepType = (typeof STEP_TYPES)[number]

export interface FlowStep {
    type: string
    route?: string // Navigate
    event?: string // Emit / CloseOverlay
    actionId?: string // RunAction
    extra: Record<string, unknown>
}

/** The param field a verb takes (or null for the no-arg MarkClean/MarkDirty). */
export function stepParam(type: string): { key: 'route' | 'event' | 'actionId'; label: string } | null {
    switch (type) {
        case 'Navigate': return { key: 'route', label: 'route' }
        case 'Emit': return { key: 'event', label: 'event name' }
        case 'CloseOverlay': return { key: 'event', label: 'result event (optional)' }
        case 'RunAction': return { key: 'actionId', label: 'action id (a @Action)' }
        default: return null
    }
}

const STEP_KNOWN = ['type', 'route', 'event', 'actionId']

interface RawAction {
    id?: string
    steps?: unknown
    [k: string]: unknown
}

/** The page's declared action ids (from the preserved `actions:` envelope). */
export function pageActionIds(doc: PageDoc): string[] {
    return rawActions(doc).map((a) => a.id).filter((id): id is string => !!id)
}

export function actionSteps(doc: PageDoc, actionId: string): FlowStep[] {
    const a = rawActions(doc).find((x) => x.id === actionId)
    return Array.isArray(a?.steps) ? (a!.steps as unknown[]).map(toStep) : []
}

/** Set (replacing) the steps of an action, creating the action if it isn't declared yet. Switches to a flow. */
export function setActionSteps(doc: PageDoc, actionId: string, steps: FlowStep[]): PageDoc {
    const raw = steps.map(stepToRaw)
    const actions = rawActions(doc)
    const next = actions.some((a) => a.id === actionId)
        ? actions.map((a) => (a.id === actionId ? withSteps(a, raw) : a))
        : [...actions, { id: actionId, steps: raw }]
    return withActions(doc, next)
}

/** Ensure an action with the given id exists (empty flow); no-op if already present. */
export function addFlowAction(doc: PageDoc, actionId: string): PageDoc {
    if (rawActions(doc).some((a) => a.id === actionId)) return doc
    return withActions(doc, [...rawActions(doc), { id: actionId, steps: [] }])
}

export function removeAction(doc: PageDoc, actionId: string): PageDoc {
    return withActions(doc, rawActions(doc).filter((a) => a.id !== actionId))
}

// --- helpers ---

function rawActions(doc: PageDoc): RawAction[] {
    const a = (doc.rest as Record<string, unknown> | undefined)?.actions
    return Array.isArray(a) ? (a as RawAction[]) : []
}

function withActions(doc: PageDoc, actions: RawAction[]): PageDoc {
    const rest: Record<string, unknown> = { ...(doc.rest ?? {}) }
    if (actions.length) rest.actions = actions
    else delete rest.actions
    return { ...doc, rest: Object.keys(rest).length ? rest : undefined }
}

/** Replace an action's steps, dropping the key when the flow is emptied (keeps a restAction-only action clean). */
function withSteps(a: RawAction, steps: Record<string, unknown>[]): RawAction {
    const next = { ...a }
    if (steps.length) next.steps = steps
    else delete next.steps
    return next
}

function toStep(raw: unknown): FlowStep {
    const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
    return {
        type: typeof r.type === 'string' ? r.type : 'Navigate',
        route: r.route as string | undefined,
        event: r.event as string | undefined,
        actionId: r.actionId as string | undefined,
        extra: omit(r, STEP_KNOWN),
    }
}

function stepToRaw(s: FlowStep): Record<string, unknown> {
    const out: Record<string, unknown> = { type: s.type }
    const p = stepParam(s.type)
    if (p && s[p.key]) out[p.key] = s[p.key]
    return { ...out, ...s.extra }
}

function omit(obj: Record<string, unknown>, keys: string[]): Record<string, unknown> {
    const out: Record<string, unknown> = {}
    for (const k of Object.keys(obj)) if (!keys.includes(k)) out[k] = obj[k]
    return out
}
