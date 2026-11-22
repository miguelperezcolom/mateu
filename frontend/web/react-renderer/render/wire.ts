import type React from 'react'
import { safeHref as libSafeHref } from '@infra/ui/safeNavigate.ts'
import { useController } from './ViewHost'

/**
 * Small readers of the wire every renderer's catalogue uses: a node's metadata, children, slot; a
 * value as text or a list; the URLs and colours the server may name, checked; the view's actions.
 */
export type Dict = Record<string, unknown>

/** What every catalogue component gets: the wire node, its metadata, and the view's state/data. */
export interface CatalogueProps {
  component: Dict
  metadata: Dict
  state: Dict
  data?: unknown
}

/** A renderer's catalogue: wire type → the component that draws it. */
export type Catalogue = Record<string, React.ComponentType<CatalogueProps>>

export const str = (v: unknown): string => (v == null ? '' : String(v))
export const list = <T = Dict>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : [])
export const childrenOf = (c: unknown): unknown[] => list<unknown>((c as Dict | null)?.['children'])
export const metaOf = (c: unknown): Dict => (((c as Dict | null)?.['metadata'] as Dict | undefined) ?? {})
export const slotOf = (c: unknown): string => str((c as Dict | null)?.['slot'])
export const isNode = (v: unknown): v is Dict => !!v && typeof v === 'object'

/** A server-sent URL: relative, http(s), mailto, tel (libs/mateu's rule); undefined otherwise. */
export const safeHref = (url: unknown): string | undefined => (url ? libSafeHref(String(url)) : undefined)

/** A server colour (a timeline dot) only when it is plainly a colour: hex, rgb()/hsl(), a name. */
export const safeColor = (c: unknown): string | undefined => {
  const v = str(c).trim()
  return /^(#[0-9a-f]{3,8}|(rgb|rgba|hsl|hsla)\([\d\s.,%]+\)|[a-z]+)$/i.test(v) ? v : undefined
}

/** Initials of a name (max two), for an avatar without an image. */
export const initialsOf = (name: string): string =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join('') || '?'

/** A wire icon: an emoji / short glyph is drawn as is; a design-system token (`vaadin:plus`) is not text to draw. */
export function glyph(icon?: unknown): string {
  const s = str(icon)
  if (!s || /^[a-z0-9-]+:[a-z0-9-]+$/i.test(s) || /^[a-z0-9-]+$/i.test(s)) return ''
  return s.length <= 4 ? s : ''
}

/** Enter / Space activate a non-button element, like a native button. */
export const activate = (fn: () => void) => ({
  role: 'button',
  tabIndex: 0,
  onClick: fn,
  onKeyDown: (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      fn()
    }
  },
})

/** Runs a wire action id, if any, on the view's controller. */
export function useRun() {
  const controller = useController()
  return (actionId: unknown, parameters?: Dict) => {
    const id = str(actionId)
    if (id) void controller.runAction(id, parameters)
  }
}

/** Opens a mount-relative route the way a breadcrumb or a menu entry does. */
export function useOpenRoute() {
  const controller = useController()
  return (route: string, label = '') => {
    if (route) controller.session.openView({ label, route: route.replace(/^\/+/, ''), consumedRoute: '', serverSideType: '' })
  }
}
