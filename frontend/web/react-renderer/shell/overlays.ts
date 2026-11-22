import { useCallback, useEffect, useState } from 'react'
import type { MateuSession, OverlayOpenerContext } from '@rn/core/MateuSession'
import { upsertOverlay, withOverlayState } from '@rn/renderer/patternGaps'

type Dict = Record<string, unknown>

export interface OverlayEntry {
  component: unknown
  title: string
  opener?: OverlayOpenerContext
  revision: number
  state: Dict
}

export interface OverlaysState {
  entries: OverlayEntry[]
  session: MateuSession
  open: (component: unknown, state: unknown, data: unknown, opener?: OverlayOpenerContext) => void
  closeTop: () => void
}

/**
 * The session's overlay hooks: a Dialog / Drawer fragment (Add) opens a layer, `CloseModal` closes
 * the top one. The stacking rules (an overlay re-sent by id replaces itself, a state update aimed
 * at an open one) are the React Native renderer's, reused as they are (patternGaps.ts).
 */
export function useOverlays(session: MateuSession): OverlaysState {
  const [entries, setEntries] = useState<OverlayEntry[]>([])
  const open = useCallback((component: unknown, _state: unknown, _data: unknown, opener?: OverlayOpenerContext) => {
    const meta = ((component as Dict)?.['metadata'] as Dict) ?? {}
    const title = String(meta['headerTitle'] ?? meta['title'] ?? '')
    const state = { ...((meta['initialData'] as Dict) ?? {}) }
    setEntries((o) => upsertOverlay(o, { component, title, opener, revision: 0, state }))
  }, [])
  const closeTop = useCallback(() => setEntries((o) => o.slice(0, -1)), [])
  useEffect(() => {
    session.updateOverlayState = (id, state) => {
      let took = false
      setEntries((o) => {
        const next = withOverlayState(o, id, state)
        took = !!next
        return next ?? o
      })
      return took
    }
  }, [session])
  return { entries, session, open, closeTop }
}

