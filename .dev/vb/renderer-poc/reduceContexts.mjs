// Renderer de Mateu sobre VB — el NÚCLEO, en JS puro y testeable sin VB.
// En la app VB estas funciones serían métodos de app-flow.js; aquí son funciones
// libres para testearlas en Node. Contrato confirmado en libs/mateu/.../dtos.
//
// v2 (2026-07-24): un contexto guarda el ÁRBOL de componentes (tree), no una lista
// plana de campos — así form, item-overview, foldout, etc. se registran IGUAL. El
// aplanado a campos pasa a ser un helper de RENDER (collectFields), no del reducer.
// Un componente App no es contenido: configura la SHELL.

export const HOST_ID = '__root__'

/** Helper de RENDER: recorre un subárbol y recolecta todo nodo con fieldId (un FormField). */
export function collectFields(node, out = []) {
  if (!node || typeof node !== 'object') return out
  if (node.fieldId) out.push(node)
  for (const k of Object.keys(node)) {
    const v = node[k]
    if (Array.isArray(v)) v.forEach((x) => collectFields(x, out))
    else if (v && typeof v === 'object') collectFields(v, out)
  }
  return out
}

/** Helper de RENDER: recolecta botones/acciones (actionId + label, sin fieldId). */
export function collectActions(node, out = []) {
  if (!node || typeof node !== 'object') return out
  if (node.actionId && node.label && !node.fieldId) out.push(node)
  for (const k of Object.keys(node)) {
    const v = node[k]
    if (Array.isArray(v)) v.forEach((x) => collectActions(x, out))
    else if (v && typeof v === 'object') collectActions(v, out)
  }
  return out
}

const metaOf = (fr) => fr.component?.metadata || fr.component || {}

/** Construye un contexto de overlay (drawer) a partir de un fragmento Add. */
export function buildOverlay(fr) {
  const md = metaOf(fr)
  const id = fr.component?.id || md.id || 'ov-' + (fr.targetComponentId || 'x')
  return {
    id,
    kind: 'drawer',
    route: md.route || fr.targetComponentId,
    tree: fr.component, // el árbol completo — se pinta con el dispatcher recursivo
    state: md.initialData || fr.data || {},
    pageType: md.pageType,
    pageWidth: md.pageWidth,
    title: md.headerTitle || md.title,
    position: md.position || 'end',
    size: md.size,
    dirty: false,
  }
}

/**
 * EL REDUCER. reg = { contexts, stack, shell }; devuelve el NUEVO reg + los efectos
 * que VB aplica. Puro. Agnóstico de la altura del payload (form / página rica / app).
 */
export function reduceContexts(reg, increment) {
  const contexts = { ...reg.contexts }
  const stack = [...reg.stack]
  let shell = reg.shell || null
  const effects = { toasts: [], banners: increment.banners || [], navigate: null, download: null, runActions: [], docTitle: null }

  for (const m of increment.messages || [])
    effects.toasts.push({ text: m.text || m.title, variant: m.variant || 'info' })

  // ── fragmentos → shell | superficies ──────────────────────────────────────
  for (const fr of increment.fragments || []) {
    const md = metaOf(fr)

    // Un App no es una página: configura el chrome (menú→nav, título, ancho, appContext).
    if (md.type === 'App') {
      shell = {
        title: md.title,
        menu: md.menu || [],
        variant: md.variant,
        appContext: md.contextSelectors || [],
        headerActions: md.contextActions || [],
        width: md.pageWidth,
      }
      continue
    }

    if (fr.action === 'Add') {
      const ctx = buildOverlay(fr)
      contexts[ctx.id] = ctx
      if (!stack.includes(ctx.id)) stack.push(ctx.id)
      continue
    }

    // Replace / ReplaceKeepData / State: MISMO camino para form, item-overview, foldout…
    const id = fr.targetComponentId || HOST_ID
    const prev = contexts[id] || { id, kind: id === HOST_ID ? 'host' : 'island', state: {} }
    contexts[id] = {
      ...prev,
      kind: prev.kind || (id === HOST_ID ? 'host' : 'island'),
      tree: fr.component || prev.tree, // sin component => State: conserva el árbol
      pageType: md.pageType ?? prev.pageType,
      pageWidth: md.pageWidth ?? prev.pageWidth,
      state:
        fr.action === 'ReplaceKeepData'
          ? { ...prev.state, ...(fr.state || {}) }
          : increment.componentState || fr.state?.[fr.component?.id] || fr.data || prev.state,
      dirty: false,
    }
  }

  // ── comandos → efectos (algunos mutan el registro) ────────────────────────
  for (const c of increment.commands || []) {
    const t = c.targetComponentId
    switch (c.type) {
      case 'SetWindowTitle':
        effects.docTitle = c.data
        break
      case 'NavigateTo': {
        const d = String(c.data || '')
        effects.navigate = /^https?:/.test(d) ? { url: d } : { route: d }
        break
      }
      case 'CloseModal': {
        const id = t && contexts[t] ? t : stack[stack.length - 1]
        if (id) {
          delete contexts[id]
          const i = stack.indexOf(id)
          if (i >= 0) stack.splice(i, 1)
        }
        break
      }
      case 'MarkAsClean':
        if (contexts[t]) contexts[t] = { ...contexts[t], dirty: false }
        break
      case 'MarkAsDirty':
        if (contexts[t]) contexts[t] = { ...contexts[t], dirty: true }
        break
      case 'DownloadFile':
        effects.download = c.data
        break
      case 'RunAction':
        effects.runActions.push(c.data)
        break
    }
  }

  return { contexts, stack, shell, effects }
}
