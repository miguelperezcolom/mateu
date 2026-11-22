import React, { useState } from 'react'
import { Checkbox, Dialog, FormControl, Text } from '@primer/react'
import { keyLabel, setSingleKeyShortcuts, singleKeyShortcutsOn } from '@infra/ui/appShortcuts.ts'
import type { MateuSession } from '@rn/core/MateuSession'
import { registeredScreenShortcuts, type AppShortcutLike } from './shortcuts'

interface Listed { key: string; label: string }

const SHORTCUT_LIKE = /^((ctrl|alt|shift|meta)\+)*([a-z0-9]|f([1-9]|1[0-2])|enter|escape|delete|[/?.,])$/i

/** The shortcuts of the screen on show: every visible control naming one (`aria-keyshortcuts`, or a
 *  button whose tooltip is its key — how this renderer marks an `@Action(shortcut)` button). */
function screenShortcuts(session: MateuSession): Listed[] {
  const out: Listed[] = []
  const seen = new Set<string>()
  document.querySelectorAll<HTMLElement>('#mateu-main [aria-keyshortcuts], #mateu-main button[title], [role="dialog"] button[title]').forEach((el) => {
    const key = (el.getAttribute('aria-keyshortcuts') || el.getAttribute('title') || '').trim().toLowerCase()
    if (!key || !SHORTCUT_LIKE.test(key) || seen.has(key) || !el.getClientRects().length) return
    seen.add(key)
    out.push({ key, label: (el.getAttribute('aria-label') || el.textContent || key).replace(/\s+/g, ' ').trim() })
  })
  // an @Action(shortcut) with no button on screen still answers to its key
  for (const { key, label } of registeredScreenShortcuts(session)) {
    if (!seen.has(key)) { seen.add(key); out.push({ key, label }) }
  }
  return out
}

function Table({ rows }: { rows: Listed[] }) {
  return (
    <table className="mateu-shortcuts">
      <tbody>
        {rows.map((r) => (
          <tr key={r.key + r.label}>
            <td><span className="mateu-kbd">{keyLabel(r.key)}</span></td>
            <td>{r.label}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

/** `?` / Ctrl+/: the keys of this screen and of the app, and the switch for one-key shortcuts. */
export function ShortcutsHelp({ session, shortcuts, palette, onClose }: { session: MateuSession; shortcuts: AppShortcutLike[]; palette: boolean; onClose: () => void }) {
  const [singleKey, setSingleKey] = useState(singleKeyShortcutsOn())
  const screen = screenShortcuts(session)
  const app: Listed[] = shortcuts.filter((s) => s.key).map((s) => ({ key: s.key!, label: s.code ? `${s.label} (${s.code})` : s.label }))
  const general: Listed[] = [
    ...(palette ? [{ key: 'ctrl+k', label: 'Open the command palette' }] : []),
    { key: 'ctrl+/', label: 'Show this list' },
    ...(singleKey ? [{ key: '?', label: 'Show this list' }] : []),
  ]
  return (
    <Dialog title="Keyboard shortcuts" onClose={onClose} width="large">
      {screen.length > 0 && (<><Text as="h3" weight="semibold" size="medium">This screen</Text><Table rows={screen} /></>)}
      {app.length > 0 && (<><Text as="h3" weight="semibold" size="medium">App</Text><Table rows={app} /></>)}
      <Text as="h3" weight="semibold" size="medium">General</Text>
      <Table rows={general} />
      <FormControl>
        <Checkbox checked={singleKey} onChange={(e) => { setSingleKey(e.target.checked); setSingleKeyShortcuts(e.target.checked) }} />
        <FormControl.Label>One-key shortcuts</FormControl.Label>
        <FormControl.Caption>Turn them off if you use speech input: a word could press them.</FormControl.Caption>
      </FormControl>
    </Dialog>
  )
}
