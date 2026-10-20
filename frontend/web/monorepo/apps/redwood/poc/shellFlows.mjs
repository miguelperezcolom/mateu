import { reduceContexts, HOST_ID, MENU_RULE_PREFIX, menuNodeIdOf } from './reduceContexts.mjs'
import { chromeText } from './i18n.mjs'

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
 * The flow a PAGE button runs client-side, OWNER FIRST: the host page's own action of that id (its
 * declared flow, or null — its server action), else the app's action catalogue entry. Null: the
 * action goes to the server as before.
 */
export function pageFlowOf(reg, actionId) {
  const host = reg && reg.contexts ? reg.contexts[HOST_ID] : null
  const own = [...((host && host.declaredActions) || []), ...((host && host.tree && host.tree.actions) || [])]
    .find((a) => a && a.id === actionId)
  if (own) return flowCommandsOf(own)
  return flowCommandsOf(catalogueActionOf(reg && reg.shell, actionId))
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
export function isLeaveAction(actionId) {
  if (typeof actionId !== 'string' || !actionId) return false
  return actionId === 'cancel' || actionId.indexOf('cancel-') === 0 || actionId === 'back' || actionId === 'backToList'
}

/**
 * Before running a LEAVE action (isLeaveAction) on a screen with unsaved changes (`mateuDirty` in
 * VB's application variables `vars`): the same question a menu click or the browser's back button
 * asks (onMateuNavigate's dirtyGuard, `unsavedLeave`). False = the user stays: send nothing. True =
 * go on; when it asked, the flag is cleared so the navigation the action answers with does not ask
 * again. What the Vaadin renderer does in mateu-component (dirtyGuard.confirmLeave).
 */
export function confirmLeaveAction(actionId, vars, win = (typeof window !== 'undefined' ? window : undefined)) {
  if (!isLeaveAction(actionId) || !vars || !vars.mateuDirty) return true
  if (!win || typeof win.confirm !== 'function' || !win.confirm(chromeText('unsavedLeave'))) return false
  vars.mateuDirty = false
  return true
}

/**
 * Does editing a field of the HOST's display blocks (hostInputChanged: a crud's form rendered as
 * host content, a fluent FormField) leave unsaved changes? When the host is a form that asks before
 * it is left (@ConfirmOnNavigationIfDirty — crud create/edit views opt in): what Vaadin's
 * mateu-component tracks. A search box on a page that does not opt in is not «unsaved changes».
 */
export function tracksUnsavedChanges(ctx) {
  return !!(ctx && ctx.tree && ctx.tree.confirmOnNavigationIfDirty)
}
