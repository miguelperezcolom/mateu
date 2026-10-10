import { reduceContexts, HOST_ID, MENU_RULE_PREFIX, menuNodeIdOf } from './reduceContexts.mjs'

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

/** The lowered commands of the shell action `actionId`, or null when it declares no flow. */
export function shellFlowOf(shell, actionId) {
  const action = ((shell && shell.actions) || []).find((a) => a && a.id === actionId)
  return action && Array.isArray(action.commands) && action.commands.length ? action.commands : null
}

/**
 * What clicking a rule leaf does, as data the shell chain applies: `reg` (the registry after the
 * flows' commands — a CloseOverlay closes the top overlay), `navigate` ({route} in-app, or {url}),
 * the bus `events` ({name, detail}), the `serverActions` to dispatch app-level (a RunAction rule
 * with no declared flow, or a flow's RunAction step) and `dirty` (true/false when a flow marked the
 * screen, null otherwise). RunJS rules are not run (the VB CSP forbids eval) — they are reported
 * in `skipped`.
 */
export function menuRulePlanOf(reg, rules) {
  const plan = { reg, navigate: null, events: [], serverActions: [], dirty: null, skipped: [] }
  for (const rule of rules || []) {
    if (!rule) continue
    if (rule.action !== 'RunAction' || !rule.actionId) {
      plan.skipped.push(rule)
      continue
    }
    const commands = shellFlowOf(plan.reg && plan.reg.shell, rule.actionId)
    if (!commands) {
      plan.serverActions.push(rule.actionId)
      continue
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
    for (const run of effects.runActions || []) {
      if (run && run.actionId) plan.serverActions.push(run.actionId)
    }
    for (const c of commands) {
      if (c.type === 'MarkAsClean') plan.dirty = false
      if (c.type === 'MarkAsDirty') plan.dirty = true
    }
  }
  return plan
}
