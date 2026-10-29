// CLIENT RULES (@Hidden(expr), @Disabled(expr), RuleSupplier, @Rule) and dependent fields in the
// browser: with no round trip to the server, a field hides, disables itself or changes its value
// depending on another. Same contract as the web renderer (libs/mateu mateu-component.applyRules):
// each rule has a `filter` (an expression); when it holds, its action writes to the state
// (SetStateValue) or to data (SetDataValue: `field.hidden`, `field.disabled`, `field.required`…),
// runs an action (RunAction) or stops (result Stop).
//
// Why an evaluator of our own: VB hosted by Oracle runs under a CSP without 'unsafe-eval' (which
// is also why the bridge precomputes flags), so `eval`/`new Function` are out — the web renderer
// dropped `new Function` for the same reason and has its own sandboxed evaluator (libs/mateu
// infra/ui/expression.ts). This one is a SMALL JS expression parser with no eval: literals,
// state/data/appState/appData/component, property access (`.`, `[]`, `?.`, `?.[]`), regex
// literals (`/…/flags`, for the server's @Pattern conditions), ! - + * / % < <= > >= == != ===
// !== && || ?? ?: and a few string/array methods (plus a regex's `.test`). Anything it does not
// understand yields undefined (the rule does not hold) instead of breaking the screen.
//
// The four renderers' evaluators are held to one corpus: conformance/client/expressions.json
// (run by test-conformance.mjs here).

const METHODS = {
  includes: (t, a) => (t != null && t.includes ? t.includes(a[0]) : false),
  startsWith: (t, a) => String(t == null ? '' : t).startsWith(a[0]),
  endsWith: (t, a) => String(t == null ? '' : t).endsWith(a[0]),
  indexOf: (t, a) => (t != null && t.indexOf ? t.indexOf(a[0]) : -1),
  toLowerCase: (t) => String(t == null ? '' : t).toLowerCase(),
  toUpperCase: (t) => String(t == null ? '' : t).toUpperCase(),
  trim: (t) => String(t == null ? '' : t).trim(),
  toString: (t) => String(t),
  test: (t, a) => {
    if (!(t instanceof RegExp)) throw new TypeError('test is only a method of a regex')
    t.lastIndex = 0
    return t.test(String(a[0]))
  },
}

// Properties an expression may never read: the routes from a value back to `Function` (the same
// set as the web and React Native evaluators).
const RULE_BLOCKED_PROPERTIES = new Set([
  'constructor', '__proto__', 'prototype', '__defineGetter__', '__defineSetter__',
  '__lookupGetter__', '__lookupSetter__',
])

function ruleMember(v, name) {
  if (RULE_BLOCKED_PROPERTIES.has(String(name))) throw new TypeError('Access to ' + name + ' is not allowed')
  return v == null ? undefined : v[name]
}

// A `/` starts a regex literal where a VALUE is expected — at the start, or after an operator
// other than a closing bracket; after a value it is a division.
function ruleRegexAllowed(prev) {
  if (!prev) return true
  if (prev.t === 'num' || prev.t === 'str' || prev.t === 'id' || prev.t === 're') return false
  return !(prev.t === 'op' && (prev.v === ')' || prev.v === ']'))
}

function tokenize(src) {
  const tokens = []
  let i = 0
  while (i < src.length) {
    const c = src[i]
    if (/\s/.test(c)) { i++; continue }
    if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(src[i + 1]))) {
      let j = i
      while (j < src.length && /[0-9.]/.test(src[j])) j++
      tokens.push({ t: 'num', v: Number(src.slice(i, j)) }); i = j; continue
    }
    if (c === '"' || c === "'") {
      let j = i + 1; let s = ''
      while (j < src.length && src[j] !== c) { if (src[j] === '\\') { s += src[j + 1]; j += 2 } else s += src[j++] }
      if (j >= src.length) throw new Error('unterminated string')
      tokens.push({ t: 'str', v: s }); i = j + 1; continue
    }
    if (c === '/' && ruleRegexAllowed(tokens[tokens.length - 1])) {
      let j = i + 1; let inClass = false
      while (j < src.length && (inClass || src[j] !== '/')) {
        if (src[j] === '\\') j++
        else if (src[j] === '[') inClass = true
        else if (src[j] === ']') inClass = false
        j++
      }
      if (j >= src.length) throw new Error('unterminated regex')
      const body = src.slice(i + 1, j)
      let k = j + 1
      while (k < src.length && /[a-z]/.test(src[k])) k++
      tokens.push({ t: 're', v: new RegExp(body, src.slice(j + 1, k)) }); i = k; continue
    }
    if (/[A-Za-z_$]/.test(c)) {
      let j = i
      while (j < src.length && /[A-Za-z0-9_$]/.test(src[j])) j++
      tokens.push({ t: 'id', v: src.slice(i, j) }); i = j; continue
    }
    const three = src.slice(i, i + 3); const two = src.slice(i, i + 2)
    if (three === '===' || three === '!==') { tokens.push({ t: 'op', v: three }); i += 3; continue }
    // `?.` is optional chaining unless a digit follows (`a?.5:1` is a ternary)
    if (two === '?.' && !/[0-9]/.test(src[i + 2] || '')) { tokens.push({ t: 'op', v: '?.' }); i += 2; continue }
    if (['==', '!=', '<=', '>=', '&&', '||', '??'].includes(two)) { tokens.push({ t: 'op', v: two }); i += 2; continue }
    if ('+-*/%<>!?:.,()[]'.includes(c)) { tokens.push({ t: 'op', v: c }); i++; continue }
    throw new Error('unexpected character ' + c)
  }
  return tokens
}

// The pure global functions an expression may CALL by name — the subset of libs/mateu's GLOBALS
// that a REST url template needs (`${encodeURIComponent(state.searchText ?? '')}`). Values only: no
// constructor, nothing that reaches Function.
const RULE_GLOBAL_FUNCTIONS = {
  encodeURIComponent, decodeURIComponent, encodeURI, decodeURI,
  parseInt, parseFloat, isNaN, isFinite,
  String: (v) => String(v), Number: (v) => Number(v), Boolean: (v) => Boolean(v),
}

/** Evaluates a rule expression against `scope` ({ state, data, appState, appData, component }).
 *  Never throws: what it does not understand yields undefined. */
export function evaluateExpression(expr, scope = {}) {
  if (expr == null) return undefined
  const src = String(expr).trim()
  if (src === '') return undefined
  let tokens
  try { tokens = tokenize(src) } catch (e) { return undefined }
  let p = 0
  const peek = (v) => tokens[p] && tokens[p].v === v && tokens[p].t === 'op'
  const take = (v) => { if (peek(v)) { p++; return true } return false }
  const expect = (v) => { if (!take(v)) throw new SyntaxError('expected ' + v) }
  const ternary = () => {
    const c = or()
    if (take('?')) { const a = ternary(); expect(':'); const b = ternary(); return c ? a : b }
    return c
  }
  const or = () => {
    let l = and()
    for (;;) {
      if (take('||')) { const r = and(); l = l || r } else if (take('??')) { const r = and(); l = l ?? r } else return l
    }
  }
  const and = () => { let l = eq(); while (take('&&')) { const r = eq(); l = l && r } return l }
  const eq = () => {
    let l = rel()
    for (;;) {
      // eslint-disable-next-line eqeqeq
      if (take('===')) l = l === rel(); else if (take('!==')) l = l !== rel()
      // eslint-disable-next-line eqeqeq
      else if (take('==')) l = l == rel(); else if (take('!=')) l = l != rel()
      else return l
    }
  }
  const rel = () => {
    let l = add()
    for (;;) {
      if (take('<=')) l = l <= add(); else if (take('>=')) l = l >= add()
      else if (take('<')) l = l < add(); else if (take('>')) l = l > add()
      else return l
    }
  }
  const add = () => {
    let l = mul()
    for (;;) { if (take('+')) l = l + mul(); else if (take('-')) l = l - mul(); else return l }
  }
  const mul = () => {
    let l = unary()
    for (;;) {
      if (take('*')) l = l * unary(); else if (take('/')) l = l / unary(); else if (take('%')) l = l % unary()
      else return l
    }
  }
  const unary = () => {
    if (take('!')) return !unary()
    if (take('-')) return -unary()
    if (take('+')) return +unary()
    return postfix()
  }
  const args = () => {
    const out = []
    while (!peek(')')) {
      out.push(ternary())
      if (!take(',')) break
    }
    expect(')')
    return out
  }
  const postfix = () => {
    let v = primary()
    // once a `?.` met null/undefined the rest of the chain is skipped (parsed, not evaluated)
    let short = false
    for (;;) {
      const optional = take('?.')
      if (optional && v == null) short = true
      if (take('.') || (optional && tokens[p] && tokens[p].t === 'id')) {
        const tok = tokens[p++]
        if (!tok || tok.t !== 'id') throw new SyntaxError('expected a property name')
        const name = tok.v
        if (take('(')) {
          const a = args()
          if (short) continue
          // only known string/array methods: nothing the state carries is ever called
          if (!Object.prototype.hasOwnProperty.call(METHODS, name)) throw new TypeError(name + ' is not callable here')
          v = METHODS[name](v, a)
        } else {
          v = short ? undefined : ruleMember(v, name)
        }
      } else if (take('[')) {
        const k = ternary(); expect(']')
        v = short ? undefined : ruleMember(v, k)
      } else if (optional) {
        throw new SyntaxError('unexpected ?.')
      } else return short ? undefined : v
    }
  }
  const primary = () => {
    const tok = tokens[p++]
    if (!tok) throw new SyntaxError('unexpected end')
    if (tok.t === 'num' || tok.t === 'str' || tok.t === 're') return tok.v
    if (tok.t === 'op' && tok.v === '(') {
      const v = ternary()
      // a parenthesis left open at the very END is forgiven (a rule half-typed still evaluates)
      if (!take(')') && p < tokens.length) throw new SyntaxError('expected )')
      return v
    }
    if (tok.t === 'op' && tok.v === '[') {
      const arr = []
      while (!peek(']')) {
        arr.push(ternary())
        if (!take(',')) break
      }
      expect(']'); return arr
    }
    if (tok.t === 'id') {
      if (tok.v === 'true') return true
      if (tok.v === 'false') return false
      if (tok.v === 'null') return null
      if (tok.v === 'undefined') return undefined
      // only the scope's OWN names: `constructor`, `toString`… must not reach Object.prototype
      if (Object.prototype.hasOwnProperty.call(scope, tok.v)) return scope[tok.v]
      // a call of an allowed global function (encodeURIComponent(…))
      if (Object.prototype.hasOwnProperty.call(RULE_GLOBAL_FUNCTIONS, tok.v) && take('(')) {
        return RULE_GLOBAL_FUNCTIONS[tok.v](...args())
      }
      return undefined
    }
    throw new SyntaxError('unexpected ' + tok.v)
  }
  try {
    const v = ternary()
    return p === tokens.length ? v : undefined
  } catch (e) {
    return undefined
  }
}

/** A `${…}` template: when it is ONE whole expression its value comes back typed; when it mixes
 *  text, the text with each `${…}` replaced; without `${` it is an expression. */
export function evaluateTemplate(tmpl, scope = {}) {
  const s = String(tmpl == null ? '' : tmpl)
  if (s.indexOf('${') < 0) return evaluateExpression(s, scope)
  const whole = s.match(/^\$\{([^}]*)\}$/)
  if (whole) return evaluateExpression(whole[1], scope)
  return s.replace(/\$\{([^}]*)\}/g, (_, e) => { const v = evaluateExpression(e, scope); return v == null ? '' : String(v) })
}

/**
 * Runs the rules over `scope` → { state, data, actions }: the VALUES each rule leaves in the state
 * / in data (`field` or `field.attribute`) and the actions to run. Pure: touches nothing.
 */
export function computeRules(rules, scope = {}) {
  const state = {}
  const data = {}
  const actions = []
  const view = () => ({ ...scope, state: { ...(scope.state || {}), ...state }, data: { ...(scope.data || {}), ...data } })
  for (const rule of rules || []) {
    if (!rule) continue
    const filter = rule.filter == null || rule.filter === '' ? true : evaluateExpression(rule.filter, view())
    if (!filter) continue
    const action = rule.action
    if (action === 'SetStateValue' || action === 'SetDataValue') {
      const target = action === 'SetStateValue' ? state : data
      const value = rule.expression ? evaluateTemplate(rule.expression, view()) : rule.value
      for (const name of String(rule.fieldName || '').split(',').map((x) => x.trim()).filter(Boolean)) {
        const attr = rule.fieldAttribute && rule.fieldAttribute !== 'none' ? rule.fieldAttribute : null
        target[attr ? name + '.' + attr : name] = value
      }
    } else if (action === 'RunAction' && rule.actionId) {
      actions.push(rule.actionId)
    }
    if (rule.result === 'Stop') break
  }
  return { state, data, actions }
}

/** The field attributes the template has to reflect: { fieldId: { hidden, disabled… } }. */
export function fieldFlagsOf(data) {
  const out = {}
  for (const key of Object.keys(data || {})) {
    const m = key.match(/^(.+)\.(hidden|disabled|required|readonly|readOnly)$/)
    if (!m) continue
    const attr = m[2] === 'readOnly' ? 'readonly' : m[2]
    out[m[1]] = { ...(out[m[1]] || {}), [attr]: !!data[key] }
  }
  return out
}

/** The action that changing `fieldId` fires (@Trigger OnValueChange with its condition), or null. */
export function valueChangeActionOf(ctx, fieldId, state) {
  const triggers = (ctx && ctx.tree && ctx.tree.triggers) || []
  const t = triggers.find((x) => x && x.type === 'OnValueChange' && x.actionId
    && (!x.propertyName || x.propertyName === fieldId))
  if (!t) return null
  if (t.condition && !evaluateExpression(t.condition, { state: state || {}, data: (ctx && ctx.data) || {} })) return null
  return t.actionId
}

// ── in the browser: applying the rules to the painted fields ──────────────────────────────────
//
// Fields are painted from 22 template copies (atoms, generic form, drawer, island…): instead of one
// more flag in each, the rules act on the DOM through `data-field-id`, which all of them carry. The
// context (rules + state) is set by every reduction (setRulesContext); field changes (JET's
// `valueChanged`, internal) update the live state and re-evaluate; and, since VB repaints
// asynchronously, the rules are re-applied for a few frames after every render.

// Rules live on every SURFACE, not only the host: an island (an embedded mediator), the open
// drawer or dialog. Each surface's rules act on the fields painted in that surface — the DOM
// tells them apart (surfaceOfElement): the overlay panels by their ids, the island by its
// data-mateu-surface wrapper, the rest is the host. A field of the same name in the drawer is not
// hidden by the host's rule.
let surfaces = [] // [{ surface: 'host'|'island'|'overlay', ctx, appState, liveState }]
let runActionSink = null

/** Who runs a rule's RunAction (the shell reuses the Elements' sink). */
export function setRuleActionSink(fn) { runActionSink = typeof fn === 'function' ? fn : null }

const hasRules = (ctx) => !!(ctx && ctx.tree && (ctx.tree.rules || []).length)

/** The surfaces whose rules apply, from a reduced registry: the host, its islands and the
 *  overlay on top. Pure. */
export function ruleSurfacesOf(reg, hostId = '__root__') {
  const out = []
  const contexts = (reg && reg.contexts) || {}
  if (hasRules(contexts[hostId])) out.push({ surface: 'host', ctx: contexts[hostId] })
  for (const [id, ctx] of Object.entries(contexts)) {
    if (id !== hostId && ctx && ctx.kind === 'island' && hasRules(ctx)) out.push({ surface: 'island', ctx })
  }
  const stack = (reg && reg.stack) || []
  const top = stack.length ? contexts[stack[stack.length - 1]] : null
  if (hasRules(top)) out.push({ surface: 'overlay', ctx: top })
  return out
}

/** Which surface an element is painted in. */
export function surfaceOfElement(el) {
  if (!el || !el.closest) return 'host'
  if (el.closest('#mateuDrawerPanel, #mateuModal, #mateuRowDetailPanel')) return 'overlay'
  if (el.closest('[data-mateu-surface="island"]')) return 'island'
  return 'host'
}

/** The host only (kept for callers that set one context). */
export function setRulesContext(ctx, appState) {
  setRuleSurfaces(hasRules(ctx) ? [{ surface: 'host', ctx }] : [], appState)
}
/** Every surface of a reduced registry (the reduce hook calls this). */
export function setRulesContexts(reg, appState) {
  setRuleSurfaces(ruleSurfacesOf(reg), appState)
}
function setRuleSurfaces(list, appState) {
  const before = new Map(surfaces.map((x) => [x.surface + ':' + (x.ctx.id || ''), x]))
  surfaces = list.map((x) => {
    // a re-reduction that left the SAME state keeps what the user typed since; a new answer
    // (another state object) starts from it
    const kept = before.get(x.surface + ':' + (x.ctx.id || ''))
    const liveState = kept && kept.ctx.state === x.ctx.state ? kept.liveState : { ...((x.ctx && x.ctx.state) || {}) }
    return { ...x, appState: appState || {}, liveState }
  })
  applyRulesSoon()
}

// What hiding a field hides: the control itself — in Redwood its label goes INSIDE (label-edge
// inside) — or, for those that carry it outside (capture, @Searchable), its oj-label-value. Going
// up to the oj-form-layout's child does not work: JET wraps fields in containers of its own and the
// whole section got hidden.
function formItemOf(el) {
  return (el.closest && el.closest('oj-label-value')) || el
}

/** A value safe inside a quoted attribute selector: CSS.escape when the browser has it, else the
 *  backslash and the quote escaped (the backslash FIRST, or the quote's escape gets doubled). */
export function attrSelectorValue(value) {
  const s = String(value)
  if (typeof CSS !== 'undefined' && CSS && typeof CSS.escape === 'function') return CSS.escape(s)
  return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

function applySurface(doc, entry) {
  const { ctx, appState, liveState, surface } = entry
  const result = computeRules(ctx.tree.rules, { state: liveState, data: ctx.data || {}, appState, appData: {}, component: ctx.tree })
  const inSurface = (el) => surfaceOfElement(el) === surface
  let touched = 0
  const flags = fieldFlagsOf(result.data)
  for (const fieldId of Object.keys(flags)) {
    for (const el of doc.querySelectorAll('[data-field-id="' + attrSelectorValue(fieldId) + '"]')) {
      if (!inSurface(el)) continue
      const f = flags[fieldId]
      if ('hidden' in f) {
        const item = formItemOf(el)
        item.style.display = f.hidden ? 'none' : ''
      }
      if ('disabled' in f && el.disabled !== f.disabled) el.disabled = f.disabled
      if ('required' in f && el.required !== f.required) el.required = f.required
      if ('readonly' in f && el.readonly !== f.readonly) el.readonly = f.readonly
      touched++
    }
  }
  // a SetStateValue changes another field's value: it is set on the control and the same INTERNAL
  // valueChanged is emitted as if the user had typed it (so it joins the draft that travels with
  // the next action)
  for (const fieldId of Object.keys(result.state)) {
    if (fieldId.indexOf('.') >= 0) continue
    const value = result.state[fieldId]
    if (liveState[fieldId] === value) continue
    liveState[fieldId] = value
    for (const el of doc.querySelectorAll('[data-field-id="' + attrSelectorValue(fieldId) + '"]')) {
      if (!inSurface(el)) continue
      el.value = value
      el.dispatchEvent(new CustomEvent('valueChanged', { detail: { value, updatedFrom: 'internal' }, bubbles: true }))
    }
  }
  for (const actionId of result.actions) if (runActionSink) runActionSink(actionId, {}, { surface })
  return touched
}

export function applyRulesNow(doc = typeof document !== 'undefined' ? document : null) {
  if (!surfaces.length || !doc) return 0
  let touched = 0
  for (const entry of surfaces) touched += applySurface(doc, entry)
  return touched
}

export function applyRulesSoon(frames = 12) {
  if (typeof requestAnimationFrame === 'undefined') return
  let left = frames
  const tick = () => { applyRulesNow(); left -= 1; if (left > 0) requestAnimationFrame(tick) }
  requestAnimationFrame(tick)
}

/** Listens to the document's field changes (once): updates the live state OF THEIR SURFACE and
 *  re-evaluates. */
export function installRules(doc = typeof document !== 'undefined' ? document : null) {
  if (!doc || doc.__mateuRulesInstalled) return
  doc.__mateuRulesInstalled = true
  doc.addEventListener('valueChanged', (e) => {
    const el = e.target
    const fieldId = el && el.getAttribute && el.getAttribute('data-field-id')
    const detail = e.detail || {}
    if (!fieldId || (detail.updatedFrom && detail.updatedFrom !== 'internal')) return
    const surface = surfaceOfElement(el)
    for (const entry of surfaces) if (entry.surface === surface) entry.liveState[fieldId] = detail.value
    applyRulesNow(doc)
  }, true)
}

/** For diagnosing from the console: the rules in force and the live state. */
export function rulesDebug() {
  return surfaces.map((x) => ({ surface: x.surface, rules: (x.ctx.tree.rules || []).length, state: { ...x.liveState } }))
}
