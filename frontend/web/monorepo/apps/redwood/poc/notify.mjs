import { callMateu } from './transport.mjs'
// BANDEJA DE NOTIFICACIONES y TOASTS CON DESHACER en la shell VB.
//
// Bandeja (NotificationsSupplier del App): la campana de la cabecera con el número de no leídas
// abre un oj-popup con un oj-list-view; activar una entrada la marca leída y navega a su ruta, y
// «Mark all read» las marca todas. Habla con las acciones app-level de siempre
// (_notifications-list / _notifications-read, route '' + serverSideType del App).
//
// Deshacer (Message.undoable → MessageDto.undo*): oj-sp-messages-toast no admite acciones, así que
// esos mensajes salen por el oj-messages de JET (display="notification") con un oj-message cuyo
// slot «detail» — el que JET reserva para enlaces y botones — lleva el oj-button «Undo». Se monta
// desde applyDomEffects (fuera de Knockout: data-oj-binding-provider="none") y se quita de la
// lista de toasts normales, así que ninguna chain lo pinta dos veces.

/** La lista _notifications de la respuesta (Data del servidor), o null. */
export function notificationListOf(increment) {
  for (const fr of (increment && increment.fragments) || []) {
    if (fr && fr.data && Array.isArray(fr.data._notifications)) return fr.data._notifications
  }
  return null
}

let notificationsProviderFactory = null
export function setNotificationsProviderFactory(f) { notificationsProviderFactory = f }

/** El modelo de la campana: no leídas (y su insignia), y las entradas listas para la lista. */
export function notificationsOf(list) {
  const items = (list || []).map((n, i) => ({
    _rowNumber: i,
    id: String(n.id),
    title: n.title || '',
    text: n.text || '',
    when: n.when || '',
    route: n.route || '',
    unread: n.unread !== false,
    titleClass: 'oj-typography-body-md' + (n.unread !== false ? ' oj-typography-bold' : ''),
  }))
  const unread = items.filter((n) => n.unread).length
  return {
    enabled: true,
    unread,
    badge: unread > 9 ? '9+' : String(unread),
    hasUnread: unread > 0,
    label: unread ? 'Notifications, ' + unread + ' unread' : 'Notifications',
    empty: items.length === 0,
    items,
    provider: notificationsProviderFactory ? notificationsProviderFactory(items) : null,
  }
}

/** Pide la lista (o marca leídas `ids` — una lista, o 'all' — y pide la lista). */
export async function fetchNotifications(base, serverSideType, appState, ids) {
  const increment = await callMateu(base, {
    route: '',
    actionId: ids ? '_notifications-read' : '_notifications-list',
    componentState: {},
    parameters: ids ? { ids } : {},
    serverSideType: serverSideType || undefined,
    appState: appState || {},
  })
  return notificationsOf(notificationListOf(increment) || [])
}

// ── toasts con «Undo» ─────────────────────────────────────────────────────────────────────────
let undoSink = null
export function setUndoSink(fn) { undoSink = typeof fn === 'function' ? fn : null }

/** Separa de los toasts los que se pueden deshacer (in situ: las chains leen la misma lista). */
export function takeUndoToasts(effects) {
  if (!effects || !Array.isArray(effects.toasts)) return []
  const undo = effects.toasts.filter((t) => t && t.undoActionId)
  if (undo.length) {
    const rest = effects.toasts.filter((t) => !(t && t.undoActionId))
    effects.toasts.splice(0, effects.toasts.length, ...rest)
  }
  return undo
}

/** Un Message de error o aviso NO es un toast en Redwood: oj-sp-messages-toast sólo admite
 *  type="acknowledgement" (confirmaciones). Va al oj-sp-messages-banner de la shell como
 *  notificación de VB (Actions.fireNotificationEvent → vbNotification → showNotificationMessage),
 *  persistente hasta que se cierra. null para el resto, que siguen siendo toasts. */
export function bannerNotificationOf(toast) {
  if (!toast || (toast.variant !== 'error' && toast.variant !== 'warning')) return null
  return { summary: toast.text || '', type: toast.variant, displayMode: 'persist' }
}

/** El objeto message de oj-message para un toast con deshacer. */
export function undoMessageOf(toast) {
  return {
    severity: toast.variant === 'error' ? 'error' : toast.variant === 'warning' ? 'warning' : 'confirmation',
    summary: toast.text || '',
    autoTimeout: 10000,
    closeAffordance: 'defaults',
  }
}

export function showUndoToasts(toasts, doc = typeof document !== 'undefined' ? document : null) {
  if (!doc || !toasts || !toasts.length) return
  let host = doc.getElementById('mateuUndoMessages')
  if (!host) {
    const wrap = doc.createElement('div')
    wrap.setAttribute('data-oj-binding-provider', 'none')
    host = doc.createElement('oj-messages')
    host.id = 'mateuUndoMessages'
    host.setAttribute('display', 'notification')
    host.setAttribute('position', '{"my": {"vertical": "bottom", "horizontal": "center"}, "at": {"vertical": "bottom", "horizontal": "center"}, "of": "window"}')
    wrap.appendChild(host)
    doc.body.appendChild(wrap)
  }
  for (const toast of toasts) {
    const msg = doc.createElement('oj-message')
    msg.message = undoMessageOf(toast)
    const detail = doc.createElement('div')
    detail.setAttribute('slot', 'detail')
    const button = doc.createElement('oj-button')
    button.setAttribute('chroming', 'borderless')
    button.className = 'mateu-undo-button'
    button.textContent = toast.undoLabel || 'Undo'
    button.addEventListener('ojAction', () => {
      if (undoSink) undoSink(toast.undoActionId, toast.undoParameters || {}, {})
      if (typeof msg.close === 'function') msg.close()
    })
    detail.appendChild(button)
    msg.appendChild(detail)
    // cerrado (por el usuario o por tiempo), fuera del DOM
    msg.addEventListener('ojClose', () => { if (msg.parentNode) msg.parentNode.removeChild(msg) })
    host.appendChild(msg)
  }
}
