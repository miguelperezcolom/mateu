// REGLAS DEL CLIENTE (@Hidden(expr), @Disabled(expr), RuleSupplier, @Rule) y campos dependientes
// en el navegador: sin ida y vuelta al servidor, un campo se oculta, se deshabilita o cambia de
// valor según otro. Mismo contrato que el renderer web (libs/mateu mateu-component.applyRules):
// cada regla tiene un `filter` (expresión); si se cumple, su acción escribe en el estado
// (SetStateValue) o en data (SetDataValue: `campo.hidden`, `campo.disabled`, `campo.required`…),
// lanza una acción (RunAction) o para (result Stop).
//
// Por qué un evaluador propio: el web usa `new Function`, y VB alojado en Oracle corre con una CSP
// sin 'unsafe-eval' (es la razón de que todo el bridge precalcule flags). Así que un parser de
// expresiones de JS pequeño y SIN eval: literales, state/data/appState/appData, acceso a
// propiedad, ! - + * / % < <= > >= == != === !== && || ?: y unos pocos métodos de string/array.
// Lo que no entiende devuelve undefined (la regla no se cumple) en vez de romper la pantalla.

const METHODS = {
  includes: (t, a) => (t != null && t.includes ? t.includes(a[0]) : false),
  startsWith: (t, a) => String(t == null ? '' : t).startsWith(a[0]),
  endsWith: (t, a) => String(t == null ? '' : t).endsWith(a[0]),
  indexOf: (t, a) => (t != null && t.indexOf ? t.indexOf(a[0]) : -1),
  toLowerCase: (t) => String(t == null ? '' : t).toLowerCase(),
  toUpperCase: (t) => String(t == null ? '' : t).toUpperCase(),
  trim: (t) => String(t == null ? '' : t).trim(),
  toString: (t) => String(t),
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
      tokens.push({ t: 'str', v: s }); i = j + 1; continue
    }
    if (/[A-Za-z_$]/.test(c)) {
      let j = i
      while (j < src.length && /[A-Za-z0-9_$]/.test(src[j])) j++
      tokens.push({ t: 'id', v: src.slice(i, j) }); i = j; continue
    }
    const three = src.slice(i, i + 3); const two = src.slice(i, i + 2)
    if (three === '===' || three === '!==') { tokens.push({ t: 'op', v: three }); i += 3; continue }
    if (['==', '!=', '<=', '>=', '&&', '||'].includes(two)) { tokens.push({ t: 'op', v: two }); i += 2; continue }
    if ('+-*/%<>!?:.,()[]'.includes(c)) { tokens.push({ t: 'op', v: c }); i++; continue }
    throw new Error('carácter inesperado ' + c)
  }
  return tokens
}

/** Evalúa una expresión de regla contra `scope` ({ state, data, appState, appData, component }). */
export function evaluateExpression(expr, scope = {}) {
  if (expr == null) return undefined
  const src = String(expr).trim()
  if (src === '') return undefined
  let tokens
  try { tokens = tokenize(src) } catch (e) { return undefined }
  let p = 0
  const peek = (v) => tokens[p] && tokens[p].v === v && tokens[p].t === 'op'
  const take = (v) => { if (peek(v)) { p++; return true } return false }
  const ternary = () => {
    const c = or()
    if (take('?')) { const a = ternary(); take(':'); const b = ternary(); return c ? a : b }
    return c
  }
  const or = () => { let l = and(); while (take('||')) { const r = and(); l = l || r } return l }
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
  const postfix = () => {
    let v = primary()
    for (;;) {
      if (take('.')) {
        const tok = tokens[p++]
        const name = tok && tok.v
        if (peek('(')) {
          take('(')
          const args = []
          while (!peek(')') && p < tokens.length) { args.push(ternary()); take(',') }
          take(')')
          // sólo métodos conocidos de string/array: nada de llamar a lo que traiga el estado
          v = Object.prototype.hasOwnProperty.call(METHODS, name) ? METHODS[name](v, args) : undefined
        } else {
          v = v == null ? undefined : v[name]
        }
      } else if (take('[')) {
        const k = ternary(); take(']'); v = v == null ? undefined : v[k]
      } else return v
    }
  }
  const primary = () => {
    const tok = tokens[p++]
    if (!tok) return undefined
    if (tok.t === 'num' || tok.t === 'str') return tok.v
    if (tok.t === 'op' && tok.v === '(') { const v = ternary(); take(')'); return v }
    if (tok.t === 'op' && tok.v === '[') {
      const arr = []
      while (!peek(']') && p < tokens.length) { arr.push(ternary()); take(',') }
      take(']'); return arr
    }
    if (tok.t === 'id') {
      if (tok.v === 'true') return true
      if (tok.v === 'false') return false
      if (tok.v === 'null') return null
      if (tok.v === 'undefined') return undefined
      return scope[tok.v]
    }
    return undefined
  }
  try {
    const v = ternary()
    return p === tokens.length ? v : undefined
  } catch (e) {
    return undefined
  }
}

/** Una plantilla `${…}`: si es UNA expresión entera devuelve su valor con tipo; si mezcla texto,
 *  el texto con cada `${…}` sustituido; sin `${` es una expresión. */
export function evaluateTemplate(tmpl, scope = {}) {
  const s = String(tmpl == null ? '' : tmpl)
  if (s.indexOf('${') < 0) return evaluateExpression(s, scope)
  const whole = s.match(/^\$\{([^}]*)\}$/)
  if (whole) return evaluateExpression(whole[1], scope)
  return s.replace(/\$\{([^}]*)\}/g, (_, e) => { const v = evaluateExpression(e, scope); return v == null ? '' : String(v) })
}

/**
 * Ejecuta las reglas sobre `scope` → { state, data, actions }: los VALORES que cada regla deja en
 * el estado / en data (`campo` o `campo.atributo`) y las acciones a lanzar. Puro: no toca nada.
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

/** Los atributos de campo que la plantilla tiene que reflejar: { fieldId: { hidden, disabled… } }. */
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

/** La acción que dispara cambiar `fieldId` (@Trigger OnValueChange con su condición), o null. */
export function valueChangeActionOf(ctx, fieldId, state) {
  const triggers = (ctx && ctx.tree && ctx.tree.triggers) || []
  const t = triggers.find((x) => x && x.type === 'OnValueChange' && x.actionId
    && (!x.propertyName || x.propertyName === fieldId))
  if (!t) return null
  if (t.condition && !evaluateExpression(t.condition, { state: state || {}, data: (ctx && ctx.data) || {} })) return null
  return t.actionId
}

// ── en el navegador: aplicar las reglas a los campos pintados ────────────────────────────────
//
// Los campos se pintan desde 22 copias de plantilla (átomos, formulario genérico, drawer, isla…):
// en vez de un flag más en cada una, las reglas actúan sobre el DOM por `data-field-id`, que
// todas llevan. El contexto (reglas + estado) lo fija cada reducción (setRulesContext); los
// cambios de campo (`valueChanged` de JET, interno) actualizan el estado vivo y re-evalúan; y,
// como VB re-pinta de forma asíncrona, se re-aplica unos frames después de cada render.

let rulesCtx = null
let liveState = {}
let runActionSink = null

/** Quién ejecuta una RunAction de regla (la shell reusa el sumidero de los Element). */
export function setRuleActionSink(fn) { runActionSink = typeof fn === 'function' ? fn : null }

export function setRulesContext(ctx, appState) {
  rulesCtx = ctx && ctx.tree && (ctx.tree.rules || []).length ? { ctx, appState: appState || {} } : null
  liveState = { ...((ctx && ctx.state) || {}) }
  applyRulesSoon()
}

// Lo que se oculta de un campo: el control mismo — en Redwood su etiqueta va DENTRO (label-edge
// inside) — o, para los que la llevan fuera (captura, @Searchable), su oj-label-value. Subir hasta
// el hijo del oj-form-layout no vale: JET envuelve los campos en sus propios contenedores y se
// ocultaba la sección entera.
function formItemOf(el) {
  return (el.closest && el.closest('oj-label-value')) || el
}

export function applyRulesNow(doc = typeof document !== 'undefined' ? document : null) {
  if (!rulesCtx || !doc) return 0
  const { ctx, appState } = rulesCtx
  const result = computeRules(ctx.tree.rules, { state: liveState, data: ctx.data || {}, appState, appData: {}, component: ctx.tree })
  let touched = 0
  const flags = fieldFlagsOf(result.data)
  for (const fieldId of Object.keys(flags)) {
    for (const el of doc.querySelectorAll('[data-field-id="' + String(fieldId).replace(/"/g, '\\"') + '"]')) {
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
  // un SetStateValue cambia el valor de otro campo: se le pone al control y se emite el mismo
  // valueChanged INTERNO que si lo hubiese tecleado el usuario (así entra en el borrador que
  // viaja con la siguiente acción)
  for (const fieldId of Object.keys(result.state)) {
    if (fieldId.indexOf('.') >= 0) continue
    const value = result.state[fieldId]
    if (liveState[fieldId] === value) continue
    liveState[fieldId] = value
    for (const el of doc.querySelectorAll('[data-field-id="' + fieldId + '"]')) {
      el.value = value
      el.dispatchEvent(new CustomEvent('valueChanged', { detail: { value, updatedFrom: 'internal' }, bubbles: true }))
    }
  }
  for (const actionId of result.actions) if (runActionSink) runActionSink(actionId, {}, {})
  return touched
}

export function applyRulesSoon(frames = 12) {
  if (typeof requestAnimationFrame === 'undefined') return
  let left = frames
  const tick = () => { applyRulesNow(); left -= 1; if (left > 0) requestAnimationFrame(tick) }
  requestAnimationFrame(tick)
}

/** Escucha los cambios de campo del documento (una vez): actualiza el estado vivo y re-evalúa. */
export function installRules(doc = typeof document !== 'undefined' ? document : null) {
  if (!doc || doc.__mateuRulesInstalled) return
  doc.__mateuRulesInstalled = true
  doc.addEventListener('valueChanged', (e) => {
    const el = e.target
    const fieldId = el && el.getAttribute && el.getAttribute('data-field-id')
    const detail = e.detail || {}
    if (!fieldId || (detail.updatedFrom && detail.updatedFrom !== 'internal')) return
    liveState[fieldId] = detail.value
    applyRulesNow(doc)
  }, true)
}

/** Para diagnosticar desde la consola: las reglas en vigor y el estado vivo. */
export function rulesDebug() {
  return { rules: rulesCtx ? (rulesCtx.ctx.tree.rules || []).length : 0, state: { ...liveState } }
}
