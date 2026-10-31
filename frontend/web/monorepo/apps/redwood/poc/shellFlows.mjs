import { reduceContexts, HOST_ID, MENU_RULE_PREFIX, menuNodeIdOf } from './reduceContexts.mjs'
import { chromeText } from './i18n.mjs'
import { urlOfRoute } from './mount.mjs'
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
export function pageFlowOf(reg, actionId, scope) {
  const host = reg && reg.contexts ? reg.contexts[HOST_ID] : null
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
  const dirty = top ? !!top.dirty : !!vars.mateuDirty
  if (!dirty) return true
  if (!isLeaveAction(actionId, screenActionIdsOf(vars.mateuRegistry))) return true
  // the conflict dialog's Reload already said it drops the edits: no second question
  if (isConflictDialogAnswer(parameters)) return true
  if (!win || typeof win.confirm !== 'function' || !win.confirm(chromeText('unsavedLeave'))) return false
  if (top) vars.mateuRegistry = withOverlayDirty(vars.mateuRegistry, false)
  else vars.mateuDirty = false
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
  return !!vars && (!!vars.mateuDirty || overlaysHoldUnsavedChanges(vars.mateuRegistry))
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
  vars.mateuRegistry = withoutOverlays(vars.mateuRegistry)
  return true
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
 * THE rule for «an edit leaves unsaved changes» (mateuDirty), the same as Vaadin's: mateu-component
 * dispatches `dirty` only when the component owning the field asks before it is left
 * (`confirmOnNavigationIfDirty`). A search box, a filter or a plain form never makes the menu, back,
 * reload or a Cancel ask. Which context owns the edited field: the open island (`islandId`), the
 * top overlay (`overlay`: a drawer/dialog form), else the host. Used by every field-edit chain
 * (mateuFieldEdited, hostInputChanged, islandFieldEdited).
 */
export function fieldEditLeavesUnsavedChanges(reg, { overlay = false, islandId = '' } = {}) {
  const contexts = (reg && reg.contexts) || {}
  const stack = (reg && reg.stack) || []
  const ctx = islandId ? contexts[islandId]
    : overlay ? (stack.length ? contexts[stack[stack.length - 1]] : undefined)
      : contexts[HOST_ID]
  return tracksUnsavedChanges(ctx)
}
