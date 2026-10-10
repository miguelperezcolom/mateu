import { PageDoc } from './pageModel'
import { pageActions, withPageActions, PageAction } from './pageActions'

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

export interface RawAction {
    id?: string
    steps?: unknown
    [k: string]: unknown
}

/** The page's declared action ids (from the preserved `actions:` envelope). */
export function pageActionIds(doc: PageDoc): string[] {
    return actionIdsIn(rawActions(doc))
}

export function actionSteps(doc: PageDoc, actionId: string): FlowStep[] {
    return stepsIn(rawActions(doc), actionId)
}

/** Set (replacing) the steps of an action, creating the action if it isn't declared yet. Switches to a flow. */
export function setActionSteps(doc: PageDoc, actionId: string, steps: FlowStep[]): PageDoc {
    return withActions(doc, withStepsIn(rawActions(doc), actionId, steps))
}

/** Ensure an action with the given id exists (empty flow); no-op if already present. */
export function addFlowAction(doc: PageDoc, actionId: string): PageDoc {
    const actions = rawActions(doc)
    const next = withFlowActionIn(actions, actionId)
    return next === actions ? doc : withActions(doc, next)
}

export function removeAction(doc: PageDoc, actionId: string): PageDoc {
    return withActions(doc, withoutActionIn(rawActions(doc), actionId))
}

// --- the same flow edits over any raw `actions:` list: a page's envelope, or an app shell's own
// `actions:` (appModel) - one model, so a shell flow is authored exactly like a page flow ---

/** The declared action ids of a raw `actions:` list. */
export function actionIdsIn(actions: RawAction[]): string[] {
    return actions.map((a) => a.id).filter((id): id is string => !!id)
}

/** The steps of one action of a raw list (none when it is not a flow). */
export function stepsIn(actions: RawAction[], actionId: string): FlowStep[] {
    const a = actions.find((x) => x.id === actionId)
    return Array.isArray(a?.steps) ? (a!.steps as unknown[]).map(toStep) : []
}

/** The list with that action's steps replaced (the action is appended when it is not declared). */
export function withStepsIn(actions: RawAction[], actionId: string, steps: FlowStep[]): RawAction[] {
    const raw = steps.map(stepToRaw)
    return actions.some((a) => a.id === actionId)
        ? actions.map((a) => (a.id === actionId ? withSteps(a, raw) : a))
        : [...actions, { id: actionId, steps: raw }]
}

/** The list with an (empty) flow action of that id - the SAME list when it is already declared. */
export function withFlowActionIn(actions: RawAction[], actionId: string): RawAction[] {
    if (actions.some((a) => a.id === actionId)) return actions
    return [...actions, { id: actionId, steps: [] }]
}

/** The list without that action. */
export function withoutActionIn(actions: RawAction[], actionId: string): RawAction[] {
    return actions.filter((a) => a.id !== actionId)
}

// --- helpers ---

// Where a page keeps its actions (envelope vs bare definition root) is pageActions' concern.
function rawActions(doc: PageDoc): RawAction[] {
    return pageActions(doc) as RawAction[]
}

function withActions(doc: PageDoc, actions: RawAction[]): PageDoc {
    return withPageActions(doc, actions as PageAction[])
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
