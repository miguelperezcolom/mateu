import { chromeText } from './i18n.mjs'

// COMPARE AND MERGE (RecordMerge on the wire): the records side by side, a pick per field, the
// resulting record and a merge action. Same rules as the web renderer (libs/mateu recordMerge.ts):
// the picks start from what the server chose (else the first record with a value), a pick is a
// record id or CUSTOM (typed by hand), and the merge sends {...parameters, _merged, _choices}.
// The atom is painted from the template (atoms.html, isRecordMerge); the picks, the custom values,
// the «only differences» switch, the result and the summary are DOM state (installRecordMerges):
// no round trip until the merge button.

export const MERGE_CUSTOM = 'custom'

export const mergeValueText = (v) =>
  v === null || v === undefined ? '' : typeof v === 'object' ? JSON.stringify(v) : String(v)

/** The picks to begin with: the server's `chosen`, else the first record with a value. */
export function mergeInitialPicks(merge) {
  const picks = {}
  const ids = (merge.records || []).map((r) => r.id)
  for (const f of merge.fields || []) {
    let chosen = f.chosen && ids.includes(f.chosen) ? f.chosen : undefined
    if (!chosen) {
      const i = (f.values || []).findIndex((v) => mergeValueText(v).trim() !== '')
      chosen = ids[i >= 0 ? i : 0]
    }
    if (chosen) picks[f.fieldId] = chosen
  }
  return picks
}

/** The value a row ends up with, given its pick. */
export function mergedValueOf(merge, field, picks, custom) {
  const pick = picks[field.fieldId]
  if (pick === MERGE_CUSTOM) return (custom || {})[field.fieldId] ?? ''
  const i = (merge.records || []).findIndex((r) => r.id === pick)
  return i >= 0 ? ((field.values || [])[i] ?? null) : null
}

/** The merge action's parameters: the component's own, `_merged` and `_choices`. */
export function mergeParametersOf(merge, picks, custom) {
  const merged = {}
  const choices = {}
  for (const f of merge.fields || []) {
    merged[f.fieldId] = mergedValueOf(merge, f, picks, custom)
    choices[f.fieldId] = picks[f.fieldId] || ''
  }
  return { ...(merge.parameters || {}), _merged: merged, _choices: choices }
}

/** The numbers of the summary line. */
export const mergeSummaryOf = (merge, picks) => ({
  fields: (merge.fields || []).length,
  differ: (merge.fields || []).filter((f) => f.differs).length,
  custom: Object.values(picks || {}).filter((p) => p === MERGE_CUSTOM).length,
})

const recordLabelOf = (merge, id) =>
  id === MERGE_CUSTOM ? chromeText('mergeCustom') : ((merge.records || []).find((r) => r.id === id) || {}).label || ''

/** The result rows ({fieldId, label, text, from}) for picks + custom values. */
export function mergeResultOf(merge, picks, custom) {
  return (merge.fields || []).map((f) => {
    const text = mergeValueText(mergedValueOf(merge, f, picks, custom))
    return {
      fieldId: f.fieldId,
      label: f.label,
      text: text || chromeText('mergeEmpty'),
      from: chromeText('mergeFrom', { record: recordLabelOf(merge, picks[f.fieldId]) }),
      entryClass: 'mateu-rm-entry' + (f.differs ? ' mateu-rm-entry-differs' : ''),
    }
  })
}

/** The atom the template paints. `key` scopes the radio groups (two merges on a page). */
export function recordMergeAtomOf(m, id, interp = (x) => x) {
  const key = 'rm-' + String(id || 'merge').replace(/[^A-Za-z0-9_-]/g, '_')
  const merge = { ...m, records: m.records || [], fields: m.fields || [] }
  const picks = mergeInitialPicks(merge)
  const anyEditable = merge.fields.some((f) => f.editable)
  const records = merge.records.map((r) => ({ id: r.id, label: interp(r.label || ''), caption: interp(r.caption || ''), hasCaption: !!r.caption }))
  const rows = merge.fields.map((f) => {
    const label = interp(f.label || f.fieldId)
    const name = key + '-' + f.fieldId
    return {
      key: name,
      fieldId: f.fieldId,
      label,
      differs: !!f.differs,
      differsText: chromeText('mergeDiffers'),
      rowClass: 'mateu-rm-row' + (f.differs ? ' mateu-rm-differs' : ' mateu-rm-same'),
      cells: records.map((r, i) => {
        const text = mergeValueText((f.values || [])[i])
        return {
          key: name + '-' + r.id,
          name,
          value: r.id,
          checked: picks[f.fieldId] === r.id,
          text: text || chromeText('mergeEmpty'),
          textClass: text ? 'mateu-rm-value' : 'mateu-rm-value mateu-rm-empty',
          ariaLabel: chromeText('mergeUseValue', { record: r.label, field: label }),
        }
      }),
      hasCustomColumn: anyEditable,
      editable: !!f.editable,
      customName: name,
      customAria: chromeText('mergeCustomValue', { field: label }),
    }
  })
  return {
    isRecordMerge: true,
    mergeKey: key,
    title: interp(merge.title || ''),
    hasTitle: !!merge.title,
    records,
    rows,
    anyEditable,
    differencesOnly: !!merge.differencesOnly,
    containerClass: 'mateu-record-merge' + (merge.differencesOnly ? ' mateu-rm-diff-only' : ''),
    result: mergeResultOf(merge, picks, {}),
    summary: chromeText('mergeSummary', mergeSummaryOf(merge, picks)),
    hasMerge: !!merge.mergeActionId,
    mergeLabel: interp(merge.mergeLabel || chromeText('mergeAction')),
    // the spec the DOM installer recomputes the result from (picks + custom values)
    spec: JSON.stringify({ records: merge.records, fields: merge.fields, parameters: merge.parameters || {}, mergeActionId: merge.mergeActionId || '' }),
    texts: {
      field: chromeText('mergeField'), custom: chromeText('mergeCustom'), differs: chromeText('mergeDiffers'),
      result: chromeText('mergeResult'), onlyDifferences: chromeText('mergeShowDifferences'),
    },
  }
}

// ── DOM: the picks are state of the page, not of the server ─────────────────────────────────
let recordMergeSink = null
/** Where the merge action goes (the shell's page-action runner). */
export function setRecordMergeSink(fn) { recordMergeSink = typeof fn === 'function' ? fn : null }

/** Reads the picks and custom values of one merge from its DOM. */
export function readMergeDom(root) {
  const picks = {}
  const custom = {}
  for (const input of root.querySelectorAll('input[type="radio"][data-rm-field]')) {
    if (input.checked) picks[input.getAttribute('data-rm-field')] = input.value
  }
  for (const input of root.querySelectorAll('input[type="text"][data-rm-custom]')) {
    custom[input.getAttribute('data-rm-custom')] = input.value
  }
  return { picks, custom }
}

function refreshMerge(root) {
  let spec
  try { spec = JSON.parse(root.getAttribute('data-rm-spec') || '{}') } catch (e) { return }
  const { picks, custom } = readMergeDom(root)
  for (const entry of mergeResultOf(spec, picks, custom)) {
    const el = root.querySelector('[data-rm-result="' + entry.fieldId + '"]')
    if (el) {
      const v = el.querySelector('.mateu-rm-result-value')
      const f = el.querySelector('.mateu-rm-result-from')
      if (v) v.textContent = entry.text
      if (f) f.textContent = entry.from
    }
  }
  for (const td of root.querySelectorAll('[data-rm-cell]')) {
    const radio = td.querySelector('input[type="radio"]')
    td.classList.toggle('mateu-rm-picked', !!(radio && radio.checked))
  }
  const summary = root.querySelector('[data-rm-summary]')
  if (summary) summary.textContent = chromeText('mergeSummary', mergeSummaryOf(spec, picks))
  return { spec, picks, custom }
}

/** Installs (once) the behaviour of the merges of the document. */
export function installRecordMerges(doc = typeof document !== 'undefined' ? document : null) {
  if (!doc || doc.__mateuRecordMerges) return
  doc.__mateuRecordMerges = true
  const rootOf = (el) => (el && el.closest ? el.closest('[data-rm-spec]') : null)
  doc.addEventListener('change', (e) => { const r = rootOf(e.target); if (r) refreshMerge(r) }, true)
  doc.addEventListener('input', (e) => {
    const t = e.target
    const r = rootOf(t)
    if (!r || !t.hasAttribute || !t.hasAttribute('data-rm-custom')) return
    // typing a custom value picks it
    const radio = r.querySelector('input[type="radio"][data-rm-field="' + t.getAttribute('data-rm-custom') + '"][value="' + MERGE_CUSTOM + '"]')
    if (radio) radio.checked = true
    refreshMerge(r)
  }, true)
  // «only differences»: the oj-switch does not bubble valueChanged, the capture phase sees it
  doc.addEventListener('valueChanged', (e) => {
    const sw = e.target
    if (!sw || !sw.hasAttribute || !sw.hasAttribute('data-rm-diff')) return
    const r = rootOf(sw)
    if (r) r.classList.toggle('mateu-rm-diff-only', !!(e.detail && e.detail.value))
  }, true)
  doc.addEventListener('ojAction', (e) => {
    const button = e.target && e.target.closest ? e.target.closest('[data-rm-merge]') : null
    const r = rootOf(button)
    if (!r) return
    const state = refreshMerge(r)
    if (state && state.spec.mergeActionId && recordMergeSink) {
      recordMergeSink(state.spec.mergeActionId, mergeParametersOf(state.spec, state.picks, state.custom))
    }
  }, true)
}
