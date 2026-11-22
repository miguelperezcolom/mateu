import React, { useEffect, useMemo, useRef } from 'react'
import { islandSession } from '@rn/core/MateuSession'
import { resolvedPreviewOf } from '@rn/core/resolvedMicroFrontends'
import { interpolate } from '@rn/core/expressions'
import { elementAttributeValue } from '@infra/ui/renderers/elementAttributes.ts'
import { useController, ViewHost } from './ViewHost'
import { sanitizeHtml } from './safeHtml'
import { BOX_STYLE, styleOf } from './styleOf'

type Dict = Record<string, unknown>

/**
 * A MicroFrontend: another Mateu UI (often another backend) hosted in its own view. Its own
 * session when it names a base url (the RN core's islandSession: the host's token only when the
 * remote is trusted), its declared chrome (NONE / COMPACT / PAGE) for the page inside, and — when
 * the host resolved it (resolve = SERVER) — painted from what the host embedded, without asking.
 */
export function MicroFrontend({ component, metadata }: { component: Dict; metadata: Dict }) {
  const { session } = useController()
  const baseUrl = typeof metadata['baseUrl'] === 'string' ? metadata['baseUrl'] : ''
  const remote = useMemo(() => islandSession(session, baseUrl), [session, baseUrl])
  const chrome = typeof metadata['chrome'] === 'string' && metadata['chrome'] ? String(metadata['chrome']).toUpperCase() : null
  const target = {
    label: '',
    route: String(metadata['route'] ?? ''),
    consumedRoute: String(metadata['consumedRoute'] ?? ''),
    serverSideType: String(metadata['serverSideType'] ?? ''),
  }
  return (
    <div style={styleOf(component, BOX_STYLE)} data-mateu-micro-frontend={baseUrl || undefined}>
      <ViewHost
        key={`${baseUrl}|${target.route}|${target.serverSideType}`}
        session={remote}
        target={target}
        preview={resolvedPreviewOf(metadata) ?? undefined}
        chrome={chrome}
        embedded
      />
    </div>
  )
}

const TAG = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/i
// never from a definition: these run or load code in the page's origin
const REFUSED_TAGS = new Set(['script', 'style', 'base', 'meta', 'link', 'object', 'embed', 'applet', 'frame', 'frameset'])

/**
 * An Element: a raw element of the page (an iframe, a third-party custom element). Attributes go
 * through the web renderers' rule (libs/mateu elementAttributes: data never chooses code — no
 * srcdoc, no handler with data in it, data URLs only as safe links); an `import` module defines a
 * custom element the first time its tag is used; `on:` events run the named action with the
 * event's plain fields.
 */
export function Element({ metadata, state, data }: { metadata: Dict; state: Dict; data?: unknown }) {
  const controller = useController()
  const name = String(metadata['name'] ?? '')
  const ref = useRef<HTMLElement | null>(null)
  const ctx = { state, data, appState: controller.session.appState }
  const declared = (metadata['attributes'] as Record<string, string> | undefined) ?? {}
  const on = (metadata['on'] as Record<string, string> | undefined) ?? {}

  const attributes: Record<string, string> = {}
  for (const [k, v] of Object.entries(declared)) {
    if (k === 'import') continue
    const value = elementAttributeValue(name, k, v, v?.includes('${') ? interpolate(String(v), ctx) : v)
    if (value !== undefined) attributes[k === 'class' ? 'className' : k] = value
  }

  const moduleUrl = declared['import']
  useEffect(() => {
    if (moduleUrl && name.includes('-') && !customElements.get(name)) void import(/* @vite-ignore */ moduleUrl)
  }, [moduleUrl, name])

  // `on:` — one listener per event, reading the action off the CURRENT definition
  const onRef = useRef(on)
  onRef.current = on
  const events = Object.keys(on).sort((a, b) => a.localeCompare(b)).join(',')
  useEffect(() => {
    const el = ref.current
    if (!el || !events) return
    const listeners = events.split(',').map((ev) => {
      const listener = (e: Event) => {
        const actionId = onRef.current[ev]
        if (actionId) void controller.runAction(actionId, { event: plainFieldsOf(e) })
      }
      el.addEventListener(ev, listener)
      return () => el.removeEventListener(ev, listener)
    })
    return () => listeners.forEach((off) => off())
  }, [events, controller])

  if (!TAG.test(name) || REFUSED_TAGS.has(name.toLowerCase())) return null
  const content = String(metadata['content'] ?? '')
  const props: Dict = { ...attributes, ref }
  if (name.toLowerCase() === 'iframe' && !('style' in declared)) props['style'] = { width: '100%', minHeight: '24rem', border: 'var(--borderWidth-thin) solid var(--borderColor-muted)', borderRadius: 'var(--borderRadius-medium)' }
  else if (typeof attributes['style'] === 'string') props['style'] = styleOf({ style: attributes['style'] }, BOX_STYLE)
  if (metadata['html'] === true) {
    // written in the definition: the author's markup; once `${…}` put data in it, sanitized
    const html = content.includes('${') ? sanitizeHtml(interpolate(content, ctx)) : content
    return React.createElement(name, { ...props, dangerouslySetInnerHTML: { __html: html } })
  }
  return React.createElement(name, props, content ? interpolate(content, ctx) : null)
}

/** What an event carries that is data: its own primitive fields and `detail` (never DOM nodes). */
function plainFieldsOf(e: Event): Dict {
  const out: Dict = { type: e.type }
  const detail = (e as CustomEvent).detail
  if (detail !== undefined) {
    try { out['detail'] = JSON.parse(JSON.stringify(detail)) } catch { /* not data */ }
  }
  for (const k of ['key', 'code', 'value', 'checked']) {
    const v = (e as unknown as Dict)[k] ?? ((e.target as unknown as Dict | null)?.[k])
    if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') out[k] = v
  }
  return out
}
