import React, { useEffect, useRef, useState } from 'react'
import { Button, IconButton, ProgressBar, Stack, Text } from '@primer/react'
import { DeviceCameraIcon, FileIcon, PencilIcon, TrashIcon, UploadIcon, XIcon } from '@primer/octicons-react'
import {
  fallbackMaxBytes, fileRefLabel, isHttpUrl, isUploadMode, parseFileRef, tooLargeMessage, valuesOf, withFile, withoutFile,
  type UploadConfig,
} from '@rn/core/fileUploads'
import { UploadCancelled, UploadError, uploadFile, xhrTransport, type UploadApi } from '@rn/core/fileUploader'
import { fileValueSummary } from '@rn/renderer/fileUpload'
import { safeHref } from '@infra/ui/safeNavigate.ts'
import { tx } from '@mr/i18n/texts'

type A11y = { 'aria-labelledby'?: string; 'aria-describedby'?: string; 'aria-invalid'?: boolean }

/** An image a value names (a data URI or a url): never anything but data:image / http(s) / relative. */
/**
 * What an <img> may load: a data:image URI or a safe url — passed through encodeURI(decodeURI())
 * so no quote or angle bracket ever reaches the attribute (a well-formed uri is unchanged).
 */
const imageSrc = (value: string): string | undefined => {
  const src = /^data:image\//i.test(value) ? value : safeHref(value) ?? undefined
  if (!src) return undefined
  try { return encodeURI(decodeURI(src)) } catch { return undefined }
}

const readDataUri = (file: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })

const dataUriBytes = (uri: string): number => {
  const comma = uri.indexOf(',')
  const body = uri.slice(comma + 1)
  return /;base64,$/.test(uri.slice(0, comma + 1)) ? Math.floor((body.length * 3) / 4) : body.length
}

/** The hidden file input every picker clicks (a real input: keyboard and screen readers reach the button). */
function useFilePicker(accept: string | undefined, multiple: boolean, capture: boolean, onFiles: (files: File[]) => void) {
  const input = useRef<HTMLInputElement | null>(null)
  const element = (
    <input
      ref={input}
      type="file"
      hidden
      accept={accept}
      multiple={multiple || undefined}
      {...(capture ? { capture: 'environment' } : {})}
      onChange={(e) => {
        const files = Array.from(e.target.files ?? [])
        e.target.value = ''
        if (files.length) onFiles(files)
      }}
    />
  )
  return { element, open: () => input.current?.click() }
}

/** @Stereotype(image): the picture, read-only. */
export function ImageValue({ value, alt }: { value: string; alt: string }) {
  const src = value ? imageSrc(value) : undefined
  return src ? <img className="mateu-image-preview" src={src} alt={alt} /> : <Text>—</Text>
}

/** @UploadableImage: the picture, Upload / Replace and Delete; the value is a data URI (or a url). */
export function UploadableImage({ value, label, editable, onChange, buttonRef }: {
  value: string; label: string; editable: boolean; onChange: (v: string) => void; buttonRef?: React.Ref<HTMLButtonElement>
}) {
  const picker = useFilePicker('image/*', false, false, (files) => void readDataUri(files[0]).then(onChange))
  return (
    <Stack gap="condensed">
      {(value || !editable) && <ImageValue value={value} alt={label} />}
      {editable && (
        <Stack direction="horizontal" gap="condensed">
          {picker.element}
          <Button ref={buttonRef} leadingVisual={UploadIcon} onClick={picker.open}>{value ? tx('replace') : tx('upload')}</Button>
          {value && <Button variant="danger" leadingVisual={TrashIcon} onClick={() => onChange('')}>{tx('delete')}</Button>}
        </Stack>
      )}
    </Stack>
  )
}

/** What one entry of a file field shows: a stored file's name and size, a data URI's kind and size. */
function entryLabel(value: string): { text: string; href?: string } {
  const ref = parseFileRef(value)
  if (ref) return { text: fileRefLabel(ref), href: ref.url && isHttpUrl(ref.url) ? ref.url : undefined }
  const name = /^data:[^,]*;name=([^;,]*)/i.exec(value)?.[1]
  return { text: fileValueSummary(value, name ? decodeURIComponent(name) : undefined) }
}

/**
 * @FileUpload: pick, the chosen files, remove. Through the app's storage port when the server issued
 * a ticket (the RN core's uploader: streamed or pre-signed, with progress and cancel), else read into
 * a data URI carrying the file name (`data:<mime>;name=<n>;base64,…`), refused over the size limit.
 */
export function FileUpload({ value, config, editable, api, onChange, buttonRef }: {
  value: unknown; config: UploadConfig; editable: boolean; api: UploadApi; onChange: (v: unknown) => void; buttonRef?: React.Ref<HTMLButtonElement>
}) {
  const [progress, setProgress] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const abort = useRef<AbortController | null>(null)
  const entries = valuesOf(value)

  const take = async (files: File[]) => {
    setError(null)
    let current: unknown = value
    for (const f of files) {
      try {
        let committed: string
        if (isUploadMode(config)) {
          abort.current = new AbortController()
          setProgress(0)
          committed = await uploadFile(api, config, { name: f.name, contentType: f.type || undefined, size: f.size, body: f }, xhrTransport, setProgress, abort.current.signal)
        } else {
          const max = fallbackMaxBytes(config)
          if (f.size > max) { setError(tooLargeMessage(max)); continue }
          const uri = await readDataUri(f)
          if (dataUriBytes(uri) > max) { setError(tooLargeMessage(max)); continue }
          const comma = uri.indexOf(',')
          committed = uri.slice(0, comma).replace(';base64', `;name=${encodeURIComponent(f.name)};base64`) + uri.slice(comma)
        }
        current = withFile(current, committed, config.multiple)
        onChange(current)
      } catch (e) {
        if (e instanceof UploadCancelled) break
        setError(e instanceof UploadError ? e.message : tx('uploadFailed'))
        break
      } finally {
        abort.current = null
        setProgress(null)
      }
    }
  }
  const picker = useFilePicker(config.accept, config.multiple, false, (files) => void take(files))

  return (
    <Stack gap="condensed">
      {entries.length > 0 ? (
        <ul className="mateu-files">
          {entries.map((e, i) => {
            const { text, href } = entryLabel(e)
            return (
              <li key={i}>
                <FileIcon />
                {href ? <a href={href} target="_blank" rel="noopener noreferrer">{text}</a> : <Text>{text}</Text>}
                {editable && <IconButton icon={XIcon} size="small" variant="invisible" aria-label={tx('removeNamed', { name: text })} onClick={() => onChange(withoutFile(value, i, config.multiple))} />}
              </li>
            )
          })}
        </ul>
      ) : !editable ? <Text>—</Text> : null}
      {progress !== null && (
        <Stack direction="horizontal" gap="condensed" align="center">
          <ProgressBar progress={Math.round(progress * 100)} aria-label={tx('uploadProgress')} style={{ flex: 1 }} />
          <Button size="small" onClick={() => abort.current?.abort()}>{tx('cancel')}</Button>
        </Stack>
      )}
      {editable && (config.multiple || entries.length === 0) && progress === null && (
        <div>
          {picker.element}
          <Button ref={buttonRef} leadingVisual={UploadIcon} onClick={picker.open}>{config.multiple ? tx('chooseFiles') : tx('chooseFile')}</Button>
        </div>
      )}
      {error && <Text size="small" style={{ color: 'var(--fgColor-danger)' }} role="alert">{error}</Text>}
    </Stack>
  )
}

/**
 * @Signature: a drawing surface (pointer events: mouse, pen, touch); Accept commits it as a PNG
 * data URI; a signed value shows the image with Sign again / Delete.
 */
export function Signature({ value, label, editable, onChange, buttonRef }: {
  value: string; label: string; editable: boolean; onChange: (v: string) => void; buttonRef?: React.Ref<HTMLButtonElement>
}) {
  const canvas = useRef<HTMLCanvasElement | null>(null)
  const [drawing, setDrawing] = useState(!value)
  const [inked, setInked] = useState(false)
  const last = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const c = canvas.current
    if (!drawing || !c) return
    const ratio = window.devicePixelRatio || 1
    c.width = c.clientWidth * ratio
    c.height = c.clientHeight * ratio
    const ctx = c.getContext('2d')
    if (!ctx) return
    ctx.scale(ratio, ratio)
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    // the ink is the theme's text colour (a black stroke vanishes in dark mode)
    ctx.strokeStyle = getComputedStyle(c).color
  }, [drawing])

  if (!editable || (!drawing && value)) {
    return (
      <Stack gap="condensed">
        <ImageValue value={value} alt={`${label} (signature)`} />
        {editable && (
          <Stack direction="horizontal" gap="condensed">
            <Button ref={buttonRef} leadingVisual={PencilIcon} onClick={() => { setDrawing(true); setInked(false) }}>{tx('signAgain')}</Button>
            <Button variant="danger" leadingVisual={TrashIcon} onClick={() => { onChange(''); setDrawing(true); setInked(false) }}>{tx('delete')}</Button>
          </Stack>
        )}
      </Stack>
    )
  }
  const point = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }
  const clear = () => {
    const c = canvas.current
    c?.getContext('2d')?.clearRect(0, 0, c.width, c.height)
    setInked(false)
  }
  return (
    <Stack gap="condensed">
      <canvas
        ref={canvas}
        className="mateu-capture-surface"
        style={{ color: 'var(--fgColor-default)' }}
        role="img"
        aria-label={`${label}: draw your signature with a mouse, pen or finger`}
        onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); last.current = point(e) }}
        onPointerMove={(e) => {
          if (!last.current) return
          const ctx = e.currentTarget.getContext('2d')
          const p = point(e)
          if (ctx) { ctx.beginPath(); ctx.moveTo(last.current.x, last.current.y); ctx.lineTo(p.x, p.y); ctx.stroke() }
          last.current = p
          if (!inked) setInked(true)
        }}
        onPointerUp={() => { last.current = null }}
        onPointerCancel={() => { last.current = null }}
      />
      <Stack direction="horizontal" gap="condensed">
        <Button ref={buttonRef} variant="primary" disabled={!inked} onClick={() => { const c = canvas.current; if (c) { onChange(c.toDataURL('image/png')); setDrawing(false) } }}>{tx('accept')}</Button>
        <Button onClick={clear} disabled={!inked}>{tx('clear')}</Button>
        {value && <Button variant="invisible" onClick={() => setDrawing(false)}>{tx('cancel')}</Button>}
      </Stack>
    </Stack>
  )
}

/**
 * @PhotoCapture: the camera's live preview and a shutter (a JPEG data URI); where there is no
 * camera (or it is refused), the file picker with `capture` — a phone opens its own camera.
 */
export function PhotoCapture({ value, label, editable, onChange, buttonRef }: {
  value: string; label: string; editable: boolean; onChange: (v: string) => void; buttonRef?: React.Ref<HTMLButtonElement>
}) {
  const video = useRef<HTMLVideoElement | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [failed, setFailed] = useState(false)
  const picker = useFilePicker('image/*', false, true, (files) => void readDataUri(files[0]).then(onChange))

  useEffect(() => () => stream?.getTracks().forEach((t) => t.stop()), [stream])
  useEffect(() => {
    if (video.current && stream) { video.current.srcObject = stream; void video.current.play().catch(() => {}) }
  }, [stream])

  const start = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('no camera')
      setStream(await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false }))
    } catch {
      setFailed(true)
      picker.open()
    }
  }
  const stop = () => { stream?.getTracks().forEach((t) => t.stop()); setStream(null) }
  const shoot = () => {
    const v = video.current
    if (!v) return
    const c = document.createElement('canvas')
    c.width = v.videoWidth
    c.height = v.videoHeight
    c.getContext('2d')?.drawImage(v, 0, 0)
    onChange(c.toDataURL('image/jpeg', 0.85))
    stop()
  }

  return (
    <Stack gap="condensed">
      {stream ? (
        <video ref={video} className="mateu-camera-video" muted playsInline aria-label={`${label}: camera preview`} />
      ) : (value || !editable) ? (
        <ImageValue value={value} alt={label} />
      ) : null}
      {editable && (
        <Stack direction="horizontal" gap="condensed">
          {picker.element}
          {stream ? (
            <>
              <Button variant="primary" leadingVisual={DeviceCameraIcon} onClick={shoot}>{tx('takePhoto')}</Button>
              <Button onClick={stop}>{tx('cancel')}</Button>
            </>
          ) : (
            <>
              <Button ref={buttonRef} leadingVisual={DeviceCameraIcon} onClick={() => void start()}>{value ? tx('retake') : tx('takeAPhoto')}</Button>
              <Button leadingVisual={UploadIcon} onClick={picker.open}>{tx('chooseFile')}</Button>
              {value && <Button variant="danger" leadingVisual={TrashIcon} onClick={() => onChange('')}>{tx('delete')}</Button>}
            </>
          )}
        </Stack>
      )}
      {failed && !stream && <Text size="small" style={{ color: 'var(--fgColor-muted)' }}>The camera is not available here — choose a picture instead.</Text>}
    </Stack>
  )
}
