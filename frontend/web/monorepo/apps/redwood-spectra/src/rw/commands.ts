import type UICommand from '@mateu/shared/apiClients/dtos/UICommand'

/**
 * The UICommand switch (clean-room port of ConnectedElement.applyCommand — NO Vaadin). Both
 * <rw-root> and <rw-host> route their addressed commands through here; the host supplies the few
 * callbacks that need its context (RunAction, CloseModal).
 */
export interface CommandHost {
  requestAction(actionId: string, parameters: Record<string, unknown>): void
  closeOverlay(): void
}

export function runCommand(command: UICommand, host: CommandHost): void {
  const data = command.data
  switch (command.type) {
    case 'SetWindowTitle':
      document.title = String(data ?? '')
      break
    case 'NavigateTo':
      navigateTo(String(data ?? ''))
      break
    case 'PushStateToHistory':
      window.history.pushState({}, '', String(data ?? ''))
      break
    case 'DispatchEvent':
      dispatchNamed(data)
      break
    case 'CloseModal':
      host.closeOverlay()
      dispatchNamed(data)
      break
    case 'RunAction': {
      const d = (data ?? {}) as { actionId?: string }
      if (d.actionId) host.requestAction(d.actionId, {})
      break
    }
    case 'MarkAsDirty':
      document.dispatchEvent(new CustomEvent('dirty'))
      break
    case 'MarkAsClean':
      document.dispatchEvent(new CustomEvent('clean'))
      break
    case 'DownloadFile':
      downloadFile(data)
      break
    default:
      // SetFavicon / AddContentToHead / AddContentToBody — not needed yet
      break
  }
}

/** Each explorer route is served as its own page (baseUrl per route), so navigation is a full load. */
function navigateTo(dest: string): void {
  if (!dest) return
  if (/^https?:\/\//i.test(dest)) window.open(dest, '_blank')
  else window.location.href = dest
}

function dispatchNamed(data: unknown): void {
  const d = (data ?? {}) as { eventName?: string; payload?: unknown; detail?: unknown }
  if (!d.eventName) return
  document.dispatchEvent(
    new CustomEvent(d.eventName, { detail: d.detail ?? d.payload ?? {}, bubbles: true, composed: true }),
  )
}

function downloadFile(data: unknown): void {
  const d = (data ?? {}) as { filename?: string; mimeType?: string; base64Content?: string }
  if (!d.base64Content) return
  const bytes = Uint8Array.from(atob(d.base64Content), (c) => c.charCodeAt(0))
  const url = URL.createObjectURL(new Blob([bytes], { type: d.mimeType || 'application/octet-stream' }))
  const a = document.createElement('a')
  a.href = url
  a.download = d.filename || 'download'
  a.click()
  URL.revokeObjectURL(url)
}
