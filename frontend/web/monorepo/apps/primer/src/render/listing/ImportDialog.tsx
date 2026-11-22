import React, { useState } from 'react'
import { Dialog, Flash, FormControl, Text } from '@primer/react'
import { tx } from '@mr/i18n/texts'

/** The file id an import upload answered: the raw body, or a JSON string / {fileId} / {id} (the web's importFileIdOf). */
export function importFileIdOf(responseText: unknown): string | undefined {
  if (typeof responseText !== 'string') return undefined
  const text = responseText.trim()
  try {
    const parsed = JSON.parse(text)
    if (typeof parsed === 'string') return parsed
    if (parsed && typeof parsed === 'object') {
      const id = (parsed as { fileId?: unknown; id?: unknown }).fileId ?? (parsed as { id?: unknown }).id
      if (id !== undefined && id !== null) return String(id)
    }
  } catch { /* not JSON: the body is the id */ }
  return text
}

/**
 * A listing's Import (`UploadEnabled`: the toolbar's `import` action) — the web renderer's contract:
 * the picked file goes to the app's `/upload` endpoint, and its answer (the file id) is handed to the
 * listing's `process-import` action as `{fileId}`.
 */
export function ImportDialog({ onClose, onUploaded }: { onClose: () => void; onUploaded: (fileId: string | undefined) => void }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const upload = (file: File) => {
    const fd = new FormData()
    fd.append('file', file)
    setBusy(true)
    setError(null)
    fetch('/upload', { method: 'POST', body: fd })
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.text() })
      .then((text) => onUploaded(importFileIdOf(text)))
      .catch(() => setError(tx('uploadFailed')))
      .finally(() => setBusy(false))
  }
  return (
    <Dialog title={tx('import')} onClose={onClose} footerButtons={[{ buttonType: 'default', content: tx('cancel'), onClick: onClose }]}>
      {error && <Flash variant="danger" style={{ marginBottom: 'var(--base-size-8)' }}>{error}</Flash>}
      <FormControl disabled={busy}>
        <FormControl.Label>{tx('fileToImport')}</FormControl.Label>
        <input type="file" disabled={busy} onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f) }} />
        {busy && <FormControl.Caption><Text>{tx('uploading')}</Text></FormControl.Caption>}
      </FormControl>
    </Dialog>
  )
}
