import { html, type TemplateResult } from 'lit'
import { interpolate } from '../../core/expressions'
import type { Json, RenderCtx } from '../renderComponent'
import { ctxScope, renderComponent } from '../renderComponent'

/** Selected-tab index per TabLayout node (stable across re-renders until navigation replaces the
 *  node). A WeakMap so it's GC'd with the wire tree. */
const selectedTab = new WeakMap<object, number>()

/**
 * TabLayout → a Redwood tab strip (authentic look via oj typography + Redwood tokens) with the
 * active tab's content below. Client-side selection (no server round-trip), matching the shared
 * frontend's behaviour. Each child Tab node carries its label + content children.
 */
export function renderTabs(node: unknown, _m: Json, ctx: RenderCtx): TemplateResult {
  const tabs = ((node as Json)['children'] as Json[]) ?? []
  const initial = (() => {
    const idx = tabs.findIndex((t) => ((t['metadata'] as Json) ?? {})['active'] === true)
    return idx >= 0 ? idx : 0
  })()
  const current = selectedTab.get(node as object) ?? initial
  const active = Math.min(current, Math.max(0, tabs.length - 1))

  const select = (i: number) => {
    selectedTab.set(node as object, i)
    ctx.controller.onRender(ctx.controller.rendered)
  }

  return html`
    <div class="mateu-tabs">
      <div class="mateu-tab-strip" role="tablist">
        ${tabs.map((t, i) => {
          const tm = (t['metadata'] as Json) ?? {}
          const label = interpolate(String(tm['label'] ?? `Tab ${i + 1}`), ctxScope(ctx))
          return html`<button
            role="tab"
            class="mateu-tab ${i === active ? 'active' : ''}"
            aria-selected=${i === active}
            @click=${() => select(i)}
          >
            ${label}
          </button>`
        })}
      </div>
      <div class="mateu-tab-content" role="tabpanel">
        ${tabs[active] ? renderComponent(tabs[active], ctx) : ''}
      </div>
    </div>
  `
}
