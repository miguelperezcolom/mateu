import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Text } from '@primer/react'
import { elementAttributeValue } from '@infra/ui/renderers/elementAttributes.ts'
import { ComponentRenderer } from '../ComponentRenderer'
import type { CatalogueProps, Dict } from './types'

/**
 * CustomComponent — the per-renderer escape hatch for a rendering Mateu does not ship. The wire
 * carries `CustomComponent(name, props, children)`; this renderer draws it, in order:
 *
 *  1. with a React renderer the app REGISTERED for `name` (the React Native renderer's contract,
 *     `(props, children) => ReactNode`, @rn/renderer/customComponents). An app serving the prebuilt Primer jar
 *     registers from any script of its page, through the global this bundle publishes:
 *
 *       window.MateuPrimer.registerCustomComponent('acme-rating', (props, children) =>
 *         window.MateuPrimer.React.createElement('div', null, `★ ${props.value}`, children))
 *
 *     (registered before or after the screen arrives: a later registration redraws it);
 *
 *  2. as a CUSTOM ELEMENT when `name` is a custom-element tag the page defines (`customElements`,
 *     waited for with `whenDefined`): string / number / boolean props become attributes through the
 *     Element rules (no handler attribute, no srcdoc, no unsafe url), any other prop is set as a
 *     PROPERTY (data, never code), and the children are drawn inside it;
 *
 *  3. otherwise a visible placeholder that still draws the children — never a broken screen.
 */
export function CustomComponent({ component, metadata: m, state, data }: CatalogueProps) {
  const name = typeof m['name'] === 'string' ? m['name'] : ''
  const props = (m['props'] && typeof m['props'] === 'object' ? m['props'] : {}) as Dict
  // re-drawn when an app registers a renderer after the screen arrived
  useRegistrations()
  const kids = ((component['children'] as unknown[] | undefined) ?? []).map((c, i) => <ComponentRenderer key={i} component={c} state={state} data={data} />)
  const custom = resolveCustomComponent(name)
  if (custom) return <>{custom(props, kids)}</>
  if (CUSTOM_TAG.test(name)) return <CustomElement name={name} props={props}>{kids}</CustomElement>
  return (
    <div className="mv-box" data-mateu-custom-component={name} style={{ padding: 'var(--base-size-12)', borderStyle: 'dashed', display: 'grid', gap: 'var(--base-size-8)' }}>
      <Text size="small" className="mv-muted">Custom component “{name}” is not registered on this renderer</Text>
      {kids}
    </div>
  )
}

// a valid custom element name: lower-case, starts with a letter, has a hyphen
const CUSTOM_TAG = /^[a-z][a-z0-9._]*-[a-z0-9._-]*$/

function CustomElement({ name, props, children }: { name: string; props: Dict; children: React.ReactNode }) {
  const ref = useRef<HTMLElement | null>(null)
  const [defined, setDefined] = useState(() => !!customElements.get(name))
  useEffect(() => {
    if (defined) return
    let alive = true
    void customElements.whenDefined(name).then(() => alive && setDefined(true))
    return () => { alive = false }
  }, [name, defined])

  const attributes: Record<string, string> = {}
  const properties: Dict = {}
  for (const [k, v] of Object.entries(props)) {
    if (v === null || v === undefined) continue
    if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') {
      const value = elementAttributeValue(name, k, String(v), String(v))
      if (value !== undefined) attributes[k === 'class' ? 'className' : k] = value
    } else if (!/^on/i.test(k)) {
      properties[k] = v
    }
  }
  useLayoutEffect(() => {
    const el = ref.current as unknown as Dict | null
    if (!el) return
    for (const [k, v] of Object.entries(properties)) el[k] = v
  })

  if (!defined) {
    // not defined (yet): the placeholder, the children still drawn
    return (
      <div className="mv-box" data-mateu-custom-component={name} style={{ padding: 'var(--base-size-12)', borderStyle: 'dashed', display: 'grid', gap: 'var(--base-size-8)' }}>
        <Text size="small" className="mv-muted">Custom component “{name}” is not registered on this renderer</Text>
        {children}
      </div>
    )
  }
  return React.createElement(name, { ...attributes, ref }, children)
}

// ── the registry, reachable from a page that only loads the prebuilt bundle ────────────────────────

/** The React Native renderer's contract: the declared props and the already-drawn children. */
export type CustomComponentRenderer = (props: Record<string, unknown>, children: React.ReactNode) => React.ReactNode

const registry = new Map<string, CustomComponentRenderer>()
const resolveCustomComponent = (name: string) => registry.get(name)
const listeners = new Set<() => void>()

/** Redraws the custom components when an app registers one after the screen arrived. */
function useRegistrations(): number {
  const [n, setN] = useState(0)
  useEffect(() => {
    const listener = () => setN((x) => x + 1)
    listeners.add(listener)
    return () => { listeners.delete(listener) }
  }, [])
  return n
}

/** Registers a React renderer for a custom component `name` (a later registration replaces it). */
export function registerPrimerCustomComponent(name: string, renderer: CustomComponentRenderer): void {
  registry.set(name, renderer)
  listeners.forEach((l) => l())
}

declare global {
  interface Window {
    MateuPrimer?: { registerCustomComponent: typeof registerPrimerCustomComponent; React: typeof React; [k: string]: unknown }
  }
}

if (typeof window !== 'undefined') {
  window.MateuPrimer = { ...(window.MateuPrimer ?? {}), registerCustomComponent: registerPrimerCustomComponent, React }
  // an app that registered BEFORE this bundle ran queued its calls: `(window.MateuPrimerQueue ||= []).push([name, renderer])`
  const queued = (window as unknown as { MateuPrimerQueue?: [string, CustomComponentRenderer][] }).MateuPrimerQueue
  if (Array.isArray(queued)) queued.forEach(([n, r]) => registerPrimerCustomComponent(n, r))
}
