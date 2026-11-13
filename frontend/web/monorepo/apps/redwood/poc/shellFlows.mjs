import { reduceContexts, HOST_ID, MENU_RULE_PREFIX, menuNodeIdOf, autoSaveOf, rangeEditOf, declaredActionOf } from './reduceContexts.mjs'
import { valueChangeActionOf } from './rules.mjs'
import { chromeText } from './i18n.mjs'
import { urlOfRoute } from './mount.mjs'
import { undoLastMove } from './historyIndex.mjs'
import { interpolateRestUrl } from './restSources.mjs'

// The FLOWS of an app shell (`actions:` with `steps:` on a `type: AppShell`, AppShell.actions in
// code) travel on the wire App as `actions`, each with its steps LOWERED to `commands`. A menu leaf
// (RuleLink) whose RunAction rule names one runs those commands in the browser — no server
// round-trip, so the menu also works on a static bundle. The commands go through the SAME reducer a
// server increment goes through (reduceContexts), so a flow's NavigateTo/DispatchEvent/CloseModal/
// MarkAsClean mean here exactly what they mean coming from the server. An id the shell does not
// declare (or declares without steps) keeps the app-level dispatch (runMateuHeaderAction).

/** Is this menu node id a leaf that runs rules (not a route)? */
export function isMenuRuleId(id) {
  return typeof id === 'string' && id.indexOf(MENU_RULE_PREFIX) === 0
}

/** The rules of the menu leaf with node id `id`, at any depth of the wire menu; null if none. */
export function menuRulesOf(menu, id) {
  for (const option of menu || []) {
    const raw = option.route || option.path || ''
    if ((option.rules || []).length && menuNodeIdOf(option, raw) === id) return option.rules
    const found = menuRulesOf(option.submenus || option.submenu || [], id)
    if (found) return found
  }
  return null
}

/** The lowered commands of an action, or null when it carries no flow. */
function flowCommandsOf(action) {
  return action && Array.isArray(action.commands) && action.commands.length ? action.commands : null
}

/** The app's ACTION catalogue entry `actionId` (App.actionCatalogue, kept on reg.shell), or null. */
export function catalogueActionOf(shell, actionId) {
  return ((shell && shell.actionCatalogue) || []).find((a) => a && a.id === actionId) || null
}

/**
 * The lowered commands of the shell action `actionId`, OWNER FIRST: a flow the shell declares — a
 * shell action WITHOUT steps is the shell's own server action, so it answers null — and only when
 * the shell does not declare the id, the app's action catalogue. Null: dispatch it app-level.
 */
export function shellFlowOf(shell, actionId) {
  const own = ((shell && shell.actions) || []).find((a) => a && a.id === actionId)
  if (own) return flowCommandsOf(own)
  return flowCommandsOf(catalogueActionOf(shell, actionId))
}

/**
 * A flow's commands with their placeholders resolved against `scope` ({state, data, appState, …}).
 * A `Navigate` route is a URL: interpolated like a source url (a value encoded as a path segment
 * or a query component, a dot segment refused), so `route: missions/${state._markerId}` opens the
 * clicked record — it used to navigate to the literal text. libs/mateu's resolveFlowCommand.
 */
export function resolveFlowCommands(commands, scope) {
  if (!commands || !scope) return commands
  return commands.map((c) => (c && c.type === 'NavigateTo' && typeof c.data === 'string' && c.data.indexOf('${') >= 0
    ? { ...c, data: interpolateRestUrl(c.data, scope) }
    : c))
}

/**
 * The flow a PAGE button runs client-side, OWNER FIRST: the host page's own action of that id (its
 * declared flow, or null — its server action), else the app's action catalogue entry. Null: the
 * action goes to the server as before. With a `scope` the commands' placeholders are resolved
 * ({@link resolveFlowCommands}) — the page's state with the action's parameters on top of it.
 */
/**
 * Whether a content button's action is CLAIMED by something on screen — a context (page, overlay,
 * island, micro frontend) that advertises it (its actions, a `prefix*` wildcard included, or its
 * declared flows) or the app's action catalogue. Vaadin's rule (mateu-component sends only what it
 * advertises): a button with no action behind it — a YAML `Button` with a label and a style, whose
 * id the server derives from the label — is inert. Redwood used to send it and answer the user
 * «You're not allowed to do this» (403) with a Retry that could never succeed (Explorer F3).
 */
export function contentActionIsClaimed(reg, actionId) {
  if (!actionId) return false
  for (const ctx of Object.values((reg && reg.contexts) || {})) {
    if (declaredActionOf(ctx, actionId)) return true
    if (((ctx && ctx.declaredActions) || []).some((a) => a && a.id === actionId)) return true
  }
  return !!catalogueActionOf(reg && reg.shell, actionId)
}

export function pageFlowOf(reg, actionId, scope, contextId = HOST_ID) {
  // `contextId`: a SURFACE of its own (an inline island, a MicroFrontend) owns ITS actions the same way
  const host = reg && reg.contexts ? reg.contexts[contextId || HOST_ID] : null
  const own = [...((host && host.declaredActions) || []), ...((host && host.tree && host.tree.actions) || [])]
    .find((a) => a && a.id === actionId)
  const commands = own ? flowCommandsOf(own) : flowCommandsOf(catalogueActionOf(reg && reg.shell, actionId))
  return resolveFlowCommands(commands, scope)
}

/**
 * What clicking a rule leaf does, as data the shell chain applies: `reg` (the registry after the
 * flows' commands — a CloseOverlay closes the top overlay), `navigate` ({route} in-app, or {url}),
 * the bus `events` ({name, detail}), the `serverActions` to dispatch app-level (a RunAction rule
 * with no declared flow, or a flow's RunAction step) and `dirty` (true/false when a flow marked the
 * screen, null otherwise). RunJS rules are not run (the VB CSP forbids eval) — they are reported
 * in `skipped`.
 */
function runShellAction(plan, actionId, depth) {
  const commands = depth < 8 ? shellFlowOf(plan.reg && plan.reg.shell, actionId) : null
  if (!commands) {
    plan.serverActions.push(actionId)
    return
  }
  const next = reduceContexts(plan.reg, { commands, fragments: [], messages: [] }, { initiator: HOST_ID })
  const effects = next.effects || {}
  plan.reg = next
  if (effects.navigate) {
    plan.navigate = effects.navigate.url
      ? { url: effects.navigate.url }
      : { route: '/' + String(effects.navigate.route || '').replace(/^\/+/, '') }
  }
  plan.events.push(...(effects.events || []))
  for (const c of commands) {
    if (c.type === 'MarkAsClean') plan.dirty = false
    if (c.type === 'MarkAsDirty') plan.dirty = true
  }
  // a flow's RunAction step resolves the same way: the shell's flow, then the catalogue's (capped,
  // so a flow that runs itself cannot loop), else an app-level server action
  for (const run of effects.runActions || []) {
    if (run && run.actionId) runShellAction(plan, run.actionId, depth + 1)
  }
}

export function menuRulePlanOf(reg, rules) {
  const plan = { reg, navigate: null, events: [], serverActions: [], dirty: null, skipped: [] }
  for (const rule of rules || []) {
    if (!rule) continue
    if (rule.action !== 'RunAction' || !rule.actionId) {
      plan.skipped.push(rule)
      continue
    }
    runShellAction(plan, rule.actionId, 0)
  }
  return plan
}

/**
 * Unsaved changes when the WINDOW goes away (reload, close, typing another address): the browser's
 * own "Leave site?" prompt while `isDirty()` says the screen has unsaved edits — what the Vaadin
 * renderer's dirtyGuard does (`beforeunload` → preventDefault + returnValue). A navigation INSIDE
 * the app is asked about by onMateuNavigate; this covers the exits the app never sees. Installed
 * once per window; returns the uninstaller.
 */
export function installUnsavedChangesGuard(win, isDirty) {
  if (!win || typeof win.addEventListener !== 'function' || typeof isDirty !== 'function') return () => {}
  if (win.__mateuUnsavedGuard) return win.__mateuUnsavedGuard
  const onBeforeUnload = (e) => {
    let dirty = false
    try { dirty = !!isDirty() } catch (_) { dirty = false }
    if (!dirty) return undefined
    e.preventDefault()
    e.returnValue = '' // what older browsers need to show the prompt
    return ''
  }
  win.addEventListener('beforeunload', onBeforeUnload)
  const uninstall = () => {
    win.removeEventListener('beforeunload', onBeforeUnload)
    if (win.__mateuUnsavedGuard === uninstall) delete win.__mateuUnsavedGuard
  }
  win.__mateuUnsavedGuard = uninstall
  return uninstall
}

/**
 * The actions that LEAVE the screen without saving: the editor's Cancel, a crud's back to the
 * listing, a page's Back. The ids the server treats as such: `FormMapper.resolveStyle` gives them
 * the tertiary look (`cancel*`, `back`, `backToList`) and the crud/editable view name theirs
 * `cancel-create` / `cancel-new` / `cancel-edit` / `cancel-view`. Of the `cancel` family only
 * `cancel` itself and `cancel-…` count: a business `cancelBooking` does not leave the screen.
 * Port of libs/mateu leaveActions.ts — keep both in step.
 */
export function isLeaveAction(actionId, ownerActionIds = []) {
  if (typeof actionId !== 'string' || !actionId) return false
  if (isWizardStepAction(actionId, ownerActionIds)) return false
  return actionId === 'cancel' || actionId.indexOf('cancel-') === 0 || actionId === 'back' || actionId === 'backToList'
}

/**
 * Was the action answered from the optimistic-lock CONFLICT dialog («Modified by another user»)? Its
 * Reload runs `cancel-edit`, a leave action, but the user already chose to drop the edits there
 * («Reload to see the changes (losing yours)»). The server marks the dialog's buttons with
 * `_conflictDialog` (OptimisticLock.FROM_CONFLICT_DIALOG). Port of leaveActions.ts isConflictDialogAnswer.
 */
export function isConflictDialogAnswer(parameters) {
  return !!parameters && typeof parameters === 'object' && parameters._conflictDialog === true
}

/** The ids a wizard steps with (WizardActionDispatcher): they move inside the screen, never out of it. */
export const WIZARD_STEP_ACTIONS = ['next', 'back', 'skip', 'goToStep']

/**
 * Is `actionId` a step of a wizard? It is when the screen running it is a wizard, which always
 * advertises `next` (archetypes.mjs wizardOf's test). A wizard's Back keeps what was typed: asking
 * «leave this screen?» there would be wrong. Port of leaveActions.ts isWizardStepAction.
 */
export function isWizardStepAction(actionId, ownerActionIds) {
  return WIZARD_STEP_ACTIONS.indexOf(actionId) >= 0 && (ownerActionIds || []).indexOf('next') >= 0
}

/**
 * The action ids the screen on display advertises: the host's and those of the overlays open over
 * it (a wizard can open in a drawer), at any depth of their trees — where a step action's owner is.
 */
export function screenActionIdsOf(reg) {
  const ids = []
  const walk = (node) => {
    if (!node || typeof node !== 'object') return
    for (const a of node.actions || []) if (a && a.id) ids.push(a.id)
    for (const child of node.children || []) walk(child)
  }
  const contexts = (reg && reg.contexts) || {}
  for (const id of [HOST_ID].concat((reg && reg.stack) || [])) {
    const ctx = contexts[id]
    if (ctx) walk(ctx.tree)
  }
  return ids
}

/**
 * Before running a LEAVE action (isLeaveAction) on a screen with unsaved changes: the same question
 * a menu click or the browser's back button asks (onMateuNavigate, `unsavedLeave`). False = the user
 * stays: send nothing. True = go on; when it asked, the scope's flag is cleared so the navigation the
 * action answers with does not ask again. What the Vaadin renderer does in mateu-component
 * (dirtyGuard.confirmLeave / confirmDiscard).
 *
 * SCOPED like the web's dirtyGuard: while an overlay is open every action is the overlay's
 * (actionPlan.outboundActionOf sends it with the overlay's state), so its Cancel asks about the
 * overlay's own edits (`dirty` on its registry context) — never about the page behind it, and a
 * clean drawer over a dirty page leaves without a question. With no overlay, the page's
 * (`mateuDirty` in VB's application variables `vars`).
 */
export function confirmLeaveAction(actionId, vars, win = (typeof window !== 'undefined' ? window : undefined), parameters = undefined) {
  if (!vars) return true
  const top = topOverlayContextOf(vars.mateuRegistry)
  const dirty = top ? !!top.dirty : (!!vars.mateuDirty || pageMarkedDirty(vars.mateuRegistry))
  if (!dirty) return true
  if (!isLeaveAction(actionId, screenActionIdsOf(vars.mateuRegistry))) return true
  // the conflict dialog's Reload already said it drops the edits: no second question
  if (isConflictDialogAnswer(parameters)) return true
  if (!win || typeof win.confirm !== 'function' || !win.confirm(chromeText('unsavedLeave'))) return false
  if (top) vars.mateuRegistry = withOverlayDirty(vars.mateuRegistry, false)
  else { vars.mateuDirty = false; vars.mateuRegistry = withPageClean(vars.mateuRegistry) }
  return true
}

/** The registry context of the TOP overlay (drawer, dialog, selector), or null when none is open. */
export function topOverlayContextOf(reg) {
  const stack = (reg && reg.stack) || []
  const id = stack.length ? stack[stack.length - 1] : null
  return id && reg.contexts ? reg.contexts[id] || null : null
}

/**
 * The registry with the TOP overlay's unsaved-changes flag set to `dirty` — the overlay's own scope
 * (its context's `dirty`, which the server's MarkAsClean/MarkAsDirty also target). Marking it dirty
 * only takes when the overlay asks before it is left (tracksUnsavedChanges: the crud's create/edit
 * drawer); clearing always does. Same reg when nothing changes.
 */
export function withOverlayDirty(reg, dirty = true) {
  const stack = (reg && reg.stack) || []
  const id = stack.length ? stack[stack.length - 1] : null
  const ctx = id && reg.contexts ? reg.contexts[id] : null
  if (!ctx || !!ctx.dirty === !!dirty) return reg
  if (dirty && !tracksUnsavedChanges(ctx)) return reg
  return { ...reg, contexts: { ...reg.contexts, [id]: { ...ctx, dirty: !!dirty } } }
}

/** Does an open overlay (any on the stack) hold unsaved changes? */
export function overlaysHoldUnsavedChanges(reg) {
  const contexts = (reg && reg.contexts) || {}
  return ((reg && reg.stack) || []).some((id) => !!(contexts[id] && contexts[id].dirty))
}

/**
 * Anything on screen — the page (`mateuDirty`) or an open overlay — holds unsaved changes: what a
 * navigation away (menu, link, NavigateTo, the browser's back/forward), a reload or a chat preview
 * replacing the screen asks about. The web's `dirtyGuard.dirty`.
 */
export function hasUnsavedChanges(vars) {
  return !!vars && (!!vars.mateuDirty || pageMarkedDirty(vars.mateuRegistry) || overlaysHoldUnsavedChanges(vars.mateuRegistry))
}

/** The server said the PAGE has unsaved changes (a MarkAsDirty aimed at the host context: the
 *  reducer keeps it there) — counted like the user's own edits (R-7). */
export function pageMarkedDirty(reg) {
  const host = reg && reg.contexts && reg.contexts[HOST_ID]
  return !!(host && host.dirty === true)
}

/** The registry with the host context's server-set flag cleared (the user discarded the page). */
function withPageClean(reg) {
  if (!pageMarkedDirty(reg)) return reg
  return { ...reg, contexts: { ...reg.contexts, [HOST_ID]: { ...reg.contexts[HOST_ID], dirty: false } } }
}

/**
 * The page's own unsaved-changes flag (`mateuDirty`) after an action re-projected the screen —
 * runMateuAction (the page's or an overlay's action) and runMateuIslandAction (R-7). It used to be
 * cleared by ANY re-projection: type in two fields, open a lookup dialog, close it, click a menu
 * entry — no question, edits lost. The edits survive while the page's draft (`draft`, the values
 * typed and not yet sent, as the chain leaves it) still holds them, unless the server said the page
 * is clean (a MarkAsClean aimed at it with this action: its context's `cleaned` count grew) or the
 * page was replaced by another (`replaced`).
 */
export function pageDirtyAfterAction({ wasDirty, draft, hostBefore, hostAfter, replaced = false }) {
  if (replaced) return false
  const markedClean = !!hostAfter && (hostAfter.cleaned || 0) > ((hostBefore && hostBefore.cleaned) || 0)
  if (markedClean) return false
  const pending = !!draft && typeof draft === 'object' && Object.keys(draft).length > 0
  return !!wasDirty && pending
}

/**
 * The navigation guard (onMateuNavigate, the chat preview): true = go on. With unsaved changes it
 * asks ONCE (`unsavedLeave`) for the page and every open overlay together; accepting discards them
 * all (the overlays are closed by the caller — closeOverlaysOnNavigation). False = stay: nothing
 * changes (the caller restores the URL of a back/forward).
 */
export function confirmNavigationAway(vars, win = (typeof window !== 'undefined' ? window : undefined)) {
  if (!hasUnsavedChanges(vars)) return true
  if (!win || typeof win.confirm !== 'function' || !win.confirm(chromeText('unsavedLeave'))) return false
  vars.mateuDirty = false
  vars.mateuRegistry = withPageClean(withoutOverlays(vars.mateuRegistry))
  return true
}

/**
 * A NavigateTo of a flow the BROWSER ran (the page's or the catalogue's `steps:`, no server answer)
 * leaves the screen like a menu click, so with unsaved changes — the user's, or a MarkDirty step of
 * that same flow — it asks first (W-3; Vaadin's mateu-component leaveToRoute). True = go on (the
 * flags are cleared when it asked), false = stay. A server's NavigateTo is the server's decision:
 * it never asks (`ranInBrowser` false).
 */
export function confirmFlowNavigation(vars, ranInBrowser, win = (typeof window !== 'undefined' ? window : undefined)) {
  return !ranInBrowser || confirmNavigationAway(vars, win)
}

/**
 * The user chose to STAY (confirmNavigationAway said no): the address goes back to the screen still
 * on display (`route`, as urlOfRoute writes it). After a back/forward (`fromUrl`) the browser has
 * already moved to the other entry, so the URL is PUSHED — what the web renderer does (mateu-ui's
 * popstate); replacing it would overwrite the entry moved to and the next Back would leave the app.
 * A menu/link navigation had not touched the URL yet: replaced (a no-op at worst).
 */
export function restoreUrlAfterStaying(route, fromUrl, win = (typeof window !== 'undefined' ? window : undefined)) {
  if (!route || !win || !win.history) return undefined
  // a back/forward over entries this app wrote is UNDONE (history.go): pushing after a FORWARD left
  // the user "on B" with C behind them (historyIndex.mjs, libs/mateu historyIndex.ts)
  if (fromUrl && undoLastMove(win)) return undefined
  const url = urlOfRoute(route)
  if (fromUrl) win.history.pushState(null, '', url)
  else win.history.replaceState(null, '', url)
  return undefined
}

/** Is any overlay (drawer, dialog, selector) open in the registry? */
export function hasOpenOverlays(reg) {
  return !!(reg && reg.stack && reg.stack.length)
}

/**
 * The registry with EVERY open overlay gone (their contexts too): another screen is loading, and a
 * drawer opened over the previous one must not stay, orphaned, over the new one. The web gets this
 * for free (its overlays are children of the page component the navigation replaces).
 */
export function withoutOverlays(reg) {
  if (!hasOpenOverlays(reg)) return reg
  const contexts = { ...reg.contexts }
  for (const id of reg.stack) delete contexts[id]
  return { ...reg, contexts, stack: [] }
}

/**
 * Does a context ask before it is left (@ConfirmOnNavigationIfDirty — crud create/edit views opt in)?
 * Any ServerSide in its tree may carry it: the edited field's owner can sit below the context's root
 * (a crud mediator wrapping its form).
 */
export function tracksUnsavedChanges(ctx) {
  // …or inside an OVERLAY's content: a Drawer/Dialog carries its form in `metadata.content` (the
  // crud's create/edit drawer — CrudDrawerBuilder marks that form), not in its children
  const walk = (node) => !!node && typeof node === 'object'
    && (node.confirmOnNavigationIfDirty === true || (node.children || []).some(walk)
      || walk(node.metadata && node.metadata.content))
  return !!(ctx && (walk(ctx.tree) || walk(ctx.surface)))
}

/**
 * Did a select empty itself, rather than the user emptying it? oj-select-one drops a value that is not
 * among its options and announces it like any other change (`updatedFrom: internal`): a loan's closed
 * exhibition, which the open-and-planned choices leave out. Taken for an edit, saving the record, untouched,
 * wiped the field. Whoever empties a select has focus in it.
 */
export function selectDroppedItsValue(event) {
  const target = event && event.target
  if (!target || target.tagName !== 'OJ-SELECT-ONE' || !event.detail || event.detail.value != null) return false
  const active = target.ownerDocument && target.ownerDocument.activeElement
  return !(active && (active === target || target.contains(active)))
}

/**
 * THE rule for «an edit leaves unsaved changes» (mateuDirty), the same as Vaadin's: mateu-component
 * dispatches `dirty` only when the component owning the field asks before it is left
 * (`confirmOnNavigationIfDirty`). A search box, a filter or a plain form never makes the menu, back,
 * reload or a Cancel ask. Which context owns the edited field: the open island (`islandId`), the
 * top overlay (`overlay`: a drawer/dialog form), else the host. Used by every field-edit chain
 * (mateuFieldEdited, hostInputChanged, islandFieldEdited).
 */
/**
 * A value edited in a field of a SURFACE of its own (an inline island — a Java example embedded in a
 * page —, a MicroFrontend): its painted fields sit among the host's atoms, so the host's draft took
 * the value and the island's next request went out without it (`name: null`, a wizard refusing its
 * step). The value goes to the SURFACE's state instead — the state runSurfaceAction posts — and the
 * surface's own triggers follow it: its @Trigger(OnValueChange) for that field, else its @AutoSave.
 * `typing` = a keystroke (rawValue): only the auto-save (debounced by the caller) listens to it.
 * Returns null when the surface is not in the registry (the caller falls back to the host's draft),
 * else { registry, actionId, debounceMillis, changed }.
 */
export function surfaceFieldEditOf(reg, surfaceId, fieldId, value, { typing = false } = {}) {
  const ctx = surfaceId && reg && reg.contexts ? reg.contexts[surfaceId] : null
  if (!ctx || !fieldId || surfaceId === HOST_ID) return null
  const state = ctx.state || {}
  // one END of a date range (`<field>#from|to`): the field's value is the whole {from, to}
  const range = rangeEditOf(fieldId, state, state, value)
  const id = range ? range.fieldId : fieldId
  const next = range ? range.value : value
  const changed = JSON.stringify(state[id] === undefined ? null : state[id]) !== JSON.stringify(next === undefined ? null : next)
  const nextState = { ...state, [id]: next }
  const registry = changed
    ? { ...reg, contexts: { ...reg.contexts, [surfaceId]: { ...ctx, state: nextState } } }
    : reg
  const auto = autoSaveOf(ctx)
  // a keystroke only matters to an auto-save (the value lands on blur/Enter anyway)
  if (typing) return auto ? { registry, changed, actionId: changed ? auto.actionId : '', debounceMillis: auto.debounceMillis } : { registry: reg, changed: false, actionId: '', debounceMillis: 0 }
  // the OnValueChange trigger fires on every committed change, like the host's (hostInputChanged)
  const vc = valueChangeActionOf(ctx, id, nextState)
  return { registry, changed, actionId: vc || (changed && auto ? auto.actionId : ''), debounceMillis: 0 }
}

export function fieldEditLeavesUnsavedChanges(reg, { overlay = false, islandId = '' } = {}) {
  const contexts = (reg && reg.contexts) || {}
  const stack = (reg && reg.stack) || []
  const ctx = islandId ? contexts[islandId]
    : overlay ? (stack.length ? contexts[stack[stack.length - 1]] : undefined)
      : contexts[HOST_ID]
  return tracksUnsavedChanges(ctx)
}
