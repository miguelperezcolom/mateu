// Fase 1 — el bridge, en su forma más mínima: callMateu → reduceContexts → render de 1 nodo.
// Reutiliza EL MISMO core que testeamos en Node (src/core/reduceContexts.mjs); en la app VB este
// fichero será el módulo AMD equivalente (app-flow.js). Aquí es ESM nativo del navegador — OJET
// (requirejs/AMD) y nuestro bridge (ESM) conviven sin problema.
//
// El dispatcher `renderNode` es el germen del fragment recursivo `mateu-node`: hoy solo conoce la
// rama Text (Fase 1). Cada fase añade una rama (FormLayout en Fase 3, tabla en Fase 4, …).

import { reduceContexts } from '../src/core/reduceContexts.mjs'

const BASE = 'http://localhost:9001'

async function callMateu(route, actionId, componentState = {}, appState = {}) {
  const res = await fetch(`${BASE}/mateu/v3/components/_/action`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ route, actionId, componentState, appState }),
  })
  if (!res.ok) throw new Error(`callMateu ${route || '/'} → http ${res.status}`)
  return res.json()
}

// Contrato real: ClientSide lleva el DTO en .metadata; ServerSide lo tiene al nivel superior.
const metaOf = (node) => (node && (node.metadata || node)) || {}

const escapeHtml = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))

function renderNode(node) {
  if (!node || typeof node !== 'object') return ''
  if (node.type === 'ServerSide') return (node.children || []).map(renderNode).join('')
  const md = metaOf(node)
  switch (md.type) {
    case 'Text':
      return `<p class="greeting oj-typography-heading-sm">${escapeHtml(md.text)}</p>`
    default:
      // Aún no soportado: baja por los hijos (ClientSide y anidados en metadata).
      return [...(node.children || []), ...(md.children || [])].map(renderNode).join('')
  }
}

async function boot() {
  const content = document.getElementById('content')
  try {
    const increment = await callMateu('', '__load__')
    const reg = reduceContexts({ contexts: {}, stack: [], shell: null }, increment)
    const host = reg.contexts.__root__
    content.innerHTML = host ? renderNode(host.tree) : '<em>(increment sin contenido)</em>'
    if (reg.effects.docTitle) document.title = reg.effects.docTitle
    document.body.dataset.ready = 'true' // señal para el screenshot
  } catch (e) {
    content.innerHTML = `<p class="oj-text-color-danger">Error: ${escapeHtml(e.message)}</p>`
    document.body.dataset.ready = 'error'
  }
}

boot()
