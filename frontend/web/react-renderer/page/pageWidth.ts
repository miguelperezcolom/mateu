import { pageTypeOf, resolvePageWidth, type ResolvedPageWidth } from '@infra/ui/layout/pageWidth.ts'

/**
 * The width a routed view takes (the first parameter of the Redwood page templates, the web
 * renderers' rule): libs/mateu's resolvePageWidth chain, as is — declared > app shell > full-bleed
 * content > page type > dense datagrid > fixed. Only the TOP view of the content area applies it;
 * an island or an overlay is sized by its host.
 */
export function pageWidthOf(component: unknown): { width: ResolvedPageWidth; type: string | undefined } {
  const c = component as Parameters<typeof resolvePageWidth>[0]
  if (!c) return { width: 'fixed', type: undefined }
  return { width: resolvePageWidth(c), type: pageTypeOf(c as never) }
}
