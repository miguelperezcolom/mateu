import { html, nothing, type TemplateResult } from 'lit'
import { interpolate } from '../../core/expressions'
import type { Json, RenderCtx } from '../renderComponent'
import { ctxScope, renderChildren } from '../renderComponent'

const scope = (ctx: RenderCtx) => ctxScope(ctx)
const t = (v: unknown, ctx: RenderCtx) => interpolate(String(v ?? ''), scope(ctx))

/** Markdown → HTML (a small subset: headings, bold/italic/code, tables, lists, paragraphs). */
export function renderMarkdown(m: Json, ctx: RenderCtx): TemplateResult {
  const src = t(m['markdown'] ?? m['text'], ctx)
  return html`<div class="mateu-markdown">${mdToTemplate(src)}</div>`
}

/** Page/inline banner (Notice) — a tinted strip with an optional action. */
export function renderNotice(m: Json, ctx: RenderCtx): TemplateResult {
  const theme = String(m['theme'] ?? 'info')
  const text = t(m['text'] ?? m['message'], ctx)
  if (!text && !m['content']) return html``
  const icon = String(m['icon'] ?? (theme === 'success' ? '✓' : theme === 'warning' ? '!' : theme === 'danger' ? '!' : 'ℹ'))
  const actionLabel = String(m['actionLabel'] ?? '')
  const actionId = String(m['actionId'] ?? '')
  return html`<div class="mateu-notice mateu-notice-${theme}">
    <span class="mateu-notice-icon">${icon}</span>
    <span class="mateu-notice-text">${text}</span>
    ${actionLabel && actionId
      ? html`<button class="mateu-notice-action" @click=${() => void ctx.controller.runAction(actionId)}>${actionLabel}</button>`
      : nothing}
  </div>`
}

/** Badge → a Redwood chip (uses Oracle's oj-badge classes from the CDN CSS). */
export function renderBadge(m: Json, ctx: RenderCtx): TemplateResult {
  const text = t(m['text'] ?? m['label'] ?? m['value'], ctx)
  if (!text) return html``
  const theme = String(m['theme'] ?? m['color'] ?? 'neutral')
  const cls = { success: 'oj-badge-success', error: 'oj-badge-danger', danger: 'oj-badge-danger', warning: 'oj-badge-warning', info: 'oj-badge-info' }[theme] ?? ''
  return html`<span class="oj-badge mateu-badge ${cls}">${text}</span>`
}

/** ProgressBar → a Redwood-token track + fill (0–100). */
export function renderProgressBar(m: Json, _ctx: RenderCtx): TemplateResult {
  const value = Number(m['value'] ?? 0)
  const max = Number(m['max'] ?? 100) || 100
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  return html`<div class="mateu-progress"><div class="mateu-progress-fill" style="width:${pct}%"></div></div>`
}

/** Meter → a labelled Redwood meter bar. */
export function renderMeter(m: Json, ctx: RenderCtx): TemplateResult {
  const value = Number(m['value'] ?? 0)
  const max = Number(m['max'] ?? 100) || 100
  const label = t(m['label'], ctx)
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  return html`<div class="mateu-meter">
    ${label ? html`<span class="mateu-meter-label oj-typography-body-xs">${label}</span>` : nothing}
    <div class="mateu-meter-track"><div class="mateu-meter-fill" style="width:${pct}%"></div></div>
  </div>`
}

/** Avatar → a Redwood circle with initials or an image. */
export function renderAvatar(m: Json, ctx: RenderCtx): TemplateResult {
  const src = String(m['src'] ?? m['image'] ?? '')
  const initials = t(m['initials'] ?? m['label'], ctx).slice(0, 2).toUpperCase()
  return src
    ? html`<img class="mateu-avatar" src=${src} alt=${initials} />`
    : html`<span class="mateu-avatar mateu-avatar-initials">${initials}</span>`
}

/** HeroSection → a centered Redwood hero band (title, subtitle, background image, slotted CTAs). */
export function renderHero(node: unknown, m: Json, ctx: RenderCtx): TemplateResult {
  const title = t(m['title'], ctx)
  const subtitle = t(m['subtitle'], ctx)
  const image = String(m['image'] ?? '')
  const centered = m['centered'] !== false
  const style = image ? `background-image: linear-gradient(rgba(0,0,0,.35),rgba(0,0,0,.35)), url('${image}');` : ''
  return html`<div class="mateu-hero ${centered ? 'centered' : ''} ${image ? 'has-image' : ''}" style=${style}>
    ${title ? html`<h1 class="mateu-hero-title oj-typography-heading-xl">${title}</h1>` : nothing}
    ${subtitle ? html`<p class="mateu-hero-subtitle oj-typography-body-lg">${subtitle}</p>` : nothing}
    <div class="mateu-hero-actions">${renderChildren(node, ctx)}</div>
  </div>`
}

/** EmptyState → a centered icon + title + description + optional CTA. */
export function renderEmptyState(m: Json, ctx: RenderCtx): TemplateResult {
  const icon = String(m['icon'] ?? '📭')
  const title = t(m['title'], ctx)
  const description = t(m['description'], ctx)
  const actionLabel = String(m['actionLabel'] ?? '')
  const actionId = String(m['actionId'] ?? '')
  return html`<div class="mateu-empty-state">
    <div class="mateu-empty-icon">${icon}</div>
    ${title ? html`<div class="mateu-empty-title oj-typography-heading-sm">${title}</div>` : nothing}
    ${description ? html`<div class="mateu-empty-desc oj-typography-body-md oj-text-color-secondary">${description}</div>` : nothing}
    ${actionLabel && actionId
      ? html`<button class="mateu-native-button callToAction" @click=${() => void ctx.controller.runAction(actionId)}>${actionLabel}</button>`
      : nothing}
  </div>`
}

/** Separator → a full-width rule. */
export function renderSeparator(m: Json): TemplateResult {
  const colspan = Number((m['attributes'] as Json)?.['data-colspan'] ?? 1)
  return html`<hr class="mateu-separator" style="grid-column: span ${colspan};" />`
}

/** EntityHeader → a record header: title, subtitle, badges, key facts, a metric. */
export function renderEntityHeader(node: unknown, m: Json, ctx: RenderCtx): TemplateResult {
  const title = t(m['title'], ctx)
  const subtitle = t(m['subtitle'], ctx)
  const facts = (m['facts'] as Json[]) ?? []
  const badges = (m['badges'] as Json[]) ?? []
  return html`<div class="mateu-entity-header">
    <div class="mateu-entity-head-row">
      <div>
        ${title ? html`<h1 class="oj-typography-heading-lg" style="margin:0">${title}</h1>` : nothing}
        ${subtitle ? html`<div class="oj-typography-body-md oj-text-color-secondary">${subtitle}</div>` : nothing}
      </div>
      <div class="mateu-entity-badges">${badges.map((b) => renderBadge((b['metadata'] as Json) ?? b, ctx))}</div>
    </div>
    ${facts.length
      ? html`<div class="mateu-entity-facts">
          ${facts.map((f) => {
            const fm = (f['metadata'] as Json) ?? f
            return html`<div class="mateu-fact">
              <span class="mateu-fact-label oj-typography-body-xs oj-text-color-secondary">${t(fm['label'], ctx)}</span>
              <span class="mateu-fact-value oj-typography-body-md">${t(fm['value'], ctx)}</span>
            </div>`
          })}
        </div>`
      : nothing}
    ${renderChildren(node, ctx)}
  </div>`
}

/** StatusList → a list of status rows (label + status chip). */
export function renderStatusList(m: Json, ctx: RenderCtx): TemplateResult {
  const items = (m['items'] as Json[]) ?? []
  return html`<ul class="mateu-status-list">
    ${items.map((it) => {
      const im = (it['metadata'] as Json) ?? it
      return html`<li class="mateu-status-row">
        <span>${t(im['label'] ?? im['text'], ctx)}</span>
        ${im['status'] ? renderBadge({ text: im['status'], theme: im['theme'] ?? im['color'] }, ctx) : nothing}
      </li>`
    })}
  </ul>`
}

/** BulletedList → a plain <ul> of text items. */
export function renderBulletedList(m: Json, ctx: RenderCtx): TemplateResult {
  const raw = m['items'] ?? m['value']
  const items = Array.isArray(raw) ? raw : raw != null ? [raw] : []
  return html`<ul class="mateu-bulleted-list">
    ${items.map((i) => html`<li>${t(i, ctx)}</li>`)}
  </ul>`
}

// ── minimal markdown ──────────────────────────────────────────────────────────────────

function mdToTemplate(src: string): TemplateResult {
  const lines = src.split('\n')
  const out: TemplateResult[] = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    if (/^\s*\|/.test(line)) {
      const table: string[] = []
      while (i < lines.length && /^\s*\|/.test(lines[i])) table.push(lines[i++])
      out.push(renderMdTable(table))
      continue
    }
    if (/^#{1,6}\s/.test(line)) {
      const level = line.match(/^#+/)![0].length
      out.push(html`<div class="oj-typography-heading-${level <= 2 ? 'sm' : 'xs'}">${inlineMd(line.replace(/^#+\s/, ''))}</div>`)
    } else if (line.trim() === '') {
      // skip
    } else if (/^\s*[-*]\s/.test(line)) {
      out.push(html`<li>${inlineMd(line.replace(/^\s*[-*]\s/, ''))}</li>`)
    } else {
      out.push(html`<p>${inlineMd(line)}</p>`)
    }
    i++
  }
  return html`${out}`
}

function renderMdTable(rows: string[]): TemplateResult {
  const cells = (r: string) => r.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim())
  const header = cells(rows[0])
  const body = rows.slice(2).map(cells)
  return html`<table class="mateu-md-table">
    <thead><tr>${header.map((h) => html`<th>${inlineMd(h)}</th>`)}</tr></thead>
    <tbody>${body.map((r) => html`<tr>${r.map((c) => html`<td>${inlineMd(c)}</td>`)}</tr>`)}</tbody>
  </table>`
}

function inlineMd(s: string): TemplateResult {
  // bold **x**, code `x` — rendered as text with minimal emphasis (kept simple + safe).
  const parts: (string | TemplateResult)[] = []
  const re = /\*\*([^*]+)\*\*|`([^`]+)`/g
  let last = 0
  let mm: RegExpExecArray | null
  while ((mm = re.exec(s))) {
    if (mm.index > last) parts.push(s.slice(last, mm.index))
    if (mm[1] != null) parts.push(html`<strong>${mm[1]}</strong>`)
    else if (mm[2] != null) parts.push(html`<code>${mm[2]}</code>`)
    last = mm.index + mm[0].length
  }
  if (last < s.length) parts.push(s.slice(last))
  return html`${parts}`
}
