// REFRESCO PERIÓDICO (triggers con espera): el patrón del web — un OnLoad con timeoutMillis
// arranca la primera vuelta y un OnSuccess(actionId = la misma, calledActionId = la misma,
// timeoutMillis) cierra el bucle: cada refresco que termina bien programa el siguiente. Antes
// la shell VB disparaba todos los OnLoad al momento, sin espera, y no conocía OnSuccess.
//
// Una GENERACIÓN por pantalla: navegar arranca una nueva y todo lo programado para la anterior
// se descarta al vencer (como el callbackToken del web) — un panel de pisos que se deja de ver
// deja de preguntar.

let runner = null
/** Quién ejecuta la acción programada (la shell: el mismo camino que los Element). */
export function setPollingRunner(fn) { runner = typeof fn === 'function' ? fn : null }

let generation = 0
let screenTree = null
const timers = new Set()

const triggersOf = (ctx) => (ctx && ctx.tree && ctx.tree.triggers) || []

/** Los OnLoad CON espera (los inmediatos siguen el camino de siempre: onLoadTriggers). */
export function timedOnLoadTriggers(ctx) {
  return triggersOf(ctx).filter((t) => t.type === 'OnLoad' && t.actionId && t.timeoutMillis > 0)
}

/** Los OnSuccess que siguen a `actionId`. */
export function onSuccessTriggers(ctx, actionId) {
  return triggersOf(ctx).filter((t) => t.type === 'OnSuccess' && t.actionId && t.calledActionId === actionId)
}

const schedule = (trigger, gen, timer = setTimeout) => {
  const fire = () => {
    if (gen !== generation || !runner) return
    runner(trigger.actionId, {}, { background: !!trigger.background, polling: true })
  }
  if (!(trigger.timeoutMillis > 0)) { fire(); return }
  const handle = timer(() => { timers.delete(handle); fire() }, trigger.timeoutMillis)
  timers.add(handle)
}

/** Pantalla nueva: descarta lo programado y arma sus OnLoad con espera. */
export function startPolling(hostCtx, timer = setTimeout) {
  generation++
  for (const h of timers) clearTimeout(h)
  timers.clear()
  screenTree = hostCtx && hostCtx.tree
  for (const t of timedOnLoadTriggers(hostCtx)) schedule(t, generation, timer)
  return generation
}

/** Una acción terminó bien (hook del transporte): sus OnSuccess, si son de la pantalla en curso. */
export function actionSucceeded(ctx, actionId, timer = setTimeout) {
  if (!ctx || !ctx.tree) return 0
  // sólo la pantalla en curso (misma clase servidora que la que se armó al navegar): la isla de
  // otro ServerSide o una respuesta de la pantalla anterior no reprograman nada
  if (!screenTree || ctx.tree.serverSideType !== screenTree.serverSideType) return 0
  const next = onSuccessTriggers(ctx, actionId)
  for (const t of next) schedule(t, generation, timer)
  return next.length
}

export const pollingGeneration = () => generation
