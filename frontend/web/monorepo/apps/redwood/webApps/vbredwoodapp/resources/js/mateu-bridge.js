/* GENERADO por poc/make-amd.mjs — NO EDITAR A MANO.
 * Fuente única del core: poc/reduceContexts.mjs + transport.mjs
 * (tests de contrato: cd poc && node test.mjs). */
define(['require', 'ojs/ojarraydataprovider'], (require, ArrayDataProvider) => {
  'use strict';
  // Renderer de Mateu sobre VB — el NÚCLEO, en JS puro y testeable sin VB.
  // En la app VB estas funciones serían métodos de app-flow.js; aquí son funciones
  // libres para testearlas en Node.
  //
  // v3 (2026-07-24): ajustado al WIRE REAL (fixtures/real/*.json, capturados con capture.mjs
  // contra demo/demo-vb en :9005). Contrato observado:
  //   - Bootstrap del shell: POST {base}/mateu/v3/components/_/action (route '', __load__) → App.
  //     Todo lo demás: POST {base}/mateu/v3/sync/{route|_no_route} con actionId '' para cargas.
  //   - `targetComponentId` es el ECO del `initiatorComponentId` de la request ('' → host), y el
  //     server DERIVA los ids internos del initiator ('crud1' → 'crud1_app', 'crud1_list'): la
  //     unicidad de ids entre superficies es responsabilidad del CLIENTE (un contextId por superficie).
  //   - El estado viaja en `fragment.state`; los overlays (Drawer) llevan `metadata.initialData`.
  //   - Un mediador (crud, isla) llega como ServerSide cuyo child0 es un App (chromeless): su
  //     CONTENIDO se carga con una segunda request con consumedRoute=rootRoute del App interior
  //     + serverSideType=homeServerSideType. `mediatorOf(ctx)` extrae esa info.
  //   - CloseModal lleva data.eventName → hay que emitir el evento del bus (@SubscribeTo);
  //     p.ej. el crud refresca el listado suscrito a 'mateu-crud:saved-in-drawer'.
  //   - Una frontera de isla embebida es un nodo ServerSide interior con id = nombre de campo
  //     ('_guestNote') y initialData con los marcadores (_embeddedMediator/_inline).

  const HOST_ID = '__root__'

  /** Recorrido que NO cruza fronteras de isla: un ServerSide INTERIOR es otra superficie
   *  (sus campos/acciones pertenecen a su propio contexto, no al host). */
  function walkWithinSurface(node, visit) {
    const walk = (n, isRoot) => {
      if (!n || typeof n !== 'object') return
      if (!isRoot && n.type === 'ServerSide') return // frontera de isla: parar
      visit(n)
      for (const v of Object.values(n)) {
        if (Array.isArray(v)) v.forEach((x) => walk(x, false))
        else if (v && typeof v === 'object') walk(v, false)
      }
    }
    walk(node, true)
  }

  /** Helper de RENDER: recolecta los FormFields de la superficie (sin cruzar islas). */
  function collectFields(node, out = []) {
    walkWithinSurface(node, (n) => { if (n.fieldId) out.push(n) })
    return out
  }

  /** Helper de RENDER: recolecta botones/acciones de la superficie (sin cruzar islas). */
  function collectActions(node, out = []) {
    walkWithinSurface(node, (n) => { if (n.actionId && n.label && !n.fieldId) out.push(n) })
    return out
  }

  /** Fronteras de isla embebida — DOS sabores confirmados en wire real:
   *  (a) nodos ServerSide INTERIORES (id propio, p.ej. '_guestNote');
   *  (b) nodos ClientSide App variant=MEDIATOR con id estable (p.ej.
   *      'island_checkin_st_maria') cuya PROPIA metadata trae homeRoute
   *      (?_embeddedMediator=1) + homeConsumedRoute + homeServerSideType —
   *      el detalle del TaskQueue del front-office llega así. */
  function collectIslands(tree, out = []) {
    const walk = (node, isRoot) => {
      if (!node || typeof node !== 'object') return
      if (!isRoot && node.type === 'ServerSide') {
        out.push(node)
        return // sus hijos pertenecen a la isla, no al host
      }
      if (!isRoot && node.type === 'ClientSide' && node.id && node.metadata
          && node.metadata.type === 'App' && node.metadata.variant === 'MEDIATOR') {
        out.push({
          id: node.id,
          route: node.metadata.homeRoute,
          consumedRoute: node.metadata.homeConsumedRoute || node.metadata.homeRoute,
          serverSideType: node.metadata.homeServerSideType,
          // el CONTEXTO sembrado por el host (stayId, paxIndex…): debe viajar como
          // componentState en la carga inicial de la isla (mateu-ux.initialState)
          initialData: node.initialData || null,
        })
        return
      }
      for (const v of Object.values(node)) {
        if (Array.isArray(v)) v.forEach((x) => walk(x, false))
        else if (v && typeof v === 'object') walk(v, false)
      }
    }
    walk(tree, true)
    return out
  }

  /** Helper de RENDER: FormField[] del árbol → metadata de oj-dyn-form (mapa campo → meta).
   *  null si el árbol no tiene campos (página sin formulario). */
  function dynFormMetadataOf(tree) {
    const NUMERIC = ['integer', 'int', 'long', 'number', 'double', 'float', 'money']
    const metadata = {}
    for (const f of collectFields(tree)) {
      if (!f.dataType || metadata[f.fieldId]) continue // duplicados = referencias de FormRow
      // una LISTA (grid de formulario) no es un campo de texto: la pinta el contenido como tabla
      if (f.dataType === 'array' || (f.columns || []).length) continue
      metadata[f.fieldId] = {
        type: NUMERIC.indexOf(f.dataType) >= 0 ? 'number'
          : f.dataType === 'bool' || f.dataType === 'boolean' ? 'boolean' : 'string',
        displayName: f.label || f.fieldId,
        required: !!f.required,
        readonly: !!f.readOnly,
        stereotype: f.stereotype || '',
      }
    }
    return Object.keys(metadata).length ? metadata : null
  }

  /** Helper de RENDER: botones únicos del árbol. chroming viene PRECOMPUTADO (los bindings
   *  VB deben quedar como paths simples: un ternario en un atributo rompe la evaluación CSP
   *  de TODAS las propiedades del elemento). */
  function actionsOf(tree) {
    const seen = {}
    const out = []
    for (const a of collectActions(tree)) {
      if (seen[a.actionId]) continue
      seen[a.actionId] = true
      out.push({
        actionId: a.actionId,
        label: a.label,
        style: a.buttonStyle || 'outlined',
        chroming: a.buttonStyle === 'primary' ? 'callToAction' : 'outlined',
        parameters: a.parameters || {},
      })
    }
    return out
  }

  /** Helper de RENDER: lista de campos para el switch widgetFor (isText/isNumber/isBoolean/
   *  isSelect/isDate/isDateTime PRECOMPUTADOS — los bindings VB deben ser paths simples), con el
   *  valor sacado del state. Es la MISMA resolución de widget que el editor de fila
   *  (fieldWidgetOf): un select con opciones (options/OptionsSupplier/enum) se pinta como
   *  oj-select-one y una fecha como oj-input-date también en el formulario de página, el drawer
   *  y la isla, no sólo en el diálogo de la fila. Un lookup REMOTO sin opciones todavía se queda
   *  en texto: aquí nadie lanza su búsqueda (sólo el editor de fila lo hace). */
  function fieldListOf(tree, state, data) {
    if (!dynFormMetadataOf(tree)) return []
    const s = state || {}
    const seen = {}
    const out = []
    for (const f of collectFields(tree)) {
      if (!f.dataType || seen[f.fieldId]) continue
      seen[f.fieldId] = true
      if (f.dataType === 'array' || (f.columns || []).length) continue
      const widget = fieldWidgetOf(f, data, { lookups: false })
      const raw = s[f.fieldId]
      out.push({
        ...widget,
        value: raw == null ? null : (widget.isSelect ? plainValueOf(raw) : raw),
      })
    }
    return out
  }

  /** ¿Es este nodo una SECCIÓN del formulario (@Section)? El wire la manda como una Card con la
   *  clase mateu-section, su título en un Text de cabecera (h3) y sus campos en un FormLayout. */
  function isSectionNode(n) {
    return !!(n && n.metadata && n.metadata.type === 'Card' && /(^|\s)mateu-section(\s|$)/.test(n.cssClasses || ''))
  }

  /** El título y las columnas de una sección: el primer Text de cabecera y el primer FormLayout
   *  de SU contenido (sin bajar a una sección anidada ni a otra isla). */
  function sectionHeadOf(card) {
    let title = ''
    let columns = 0
    const walk = (n, isRoot) => {
      if (!n || typeof n !== 'object') return
      if (!isRoot && (n.type === 'ServerSide' || isSectionNode(n))) return
      const md = n.metadata
      if (md && md.type === 'Text' && !title && /^h[1-6]$/.test(md.container || '') && md.text) title = String(md.text)
      if (md && md.type === 'FormLayout' && !columns) columns = md.maxColumns || md.columns || 0
      for (const v of Object.values(n)) {
        if (Array.isArray(v)) v.forEach((x) => walk(x, false))
        else if (v && typeof v === 'object') walk(v, false)
      }
    }
    walk(card, true)
    return { title, columns: columns > 0 ? Math.min(columns, 4) : 1 }
  }

  /**
   * Helper de RENDER: los campos del formulario AGRUPADOS por sus secciones (@Section), en el
   * orden del wire → [{ key, title, hasTitle, columns, fields }]. Los campos fuera de toda
   * sección van a un grupo sin título; un formulario sin secciones es UN grupo sin título, así
   * que el template pinta siempre secciones → campos. [] si el árbol no tiene formulario.
   */
  function formSectionsOf(tree, state, data) {
    const fields = fieldListOf(tree, state, data)
    if (!fields.length) return []
    const byId = {}
    for (const f of fields) byId[f.fieldId] = f
    const sections = []
    const placed = {}
    let loose = null
    const walk = (n, isRoot, section) => {
      if (!n || typeof n !== 'object') return
      if (!isRoot && n.type === 'ServerSide') return // frontera de isla: sus campos no son de aquí
      let here = section
      if (isSectionNode(n)) {
        here = { key: 's' + sections.length, ...sectionHeadOf(n), fields: [] }
        sections.push(here)
      }
      if (n.fieldId && byId[n.fieldId] && !placed[n.fieldId]) {
        placed[n.fieldId] = true
        if (here) {
          here.fields.push(byId[n.fieldId])
        } else {
          if (!loose || sections[sections.length - 1] !== loose) {
            loose = { key: 's' + sections.length, title: '', columns: 1, fields: [] }
            sections.push(loose)
          }
          loose.fields.push(byId[n.fieldId])
        }
      }
      for (const v of Object.values(n)) {
        if (Array.isArray(v)) v.forEach((x) => walk(x, false, here))
        else if (v && typeof v === 'object') walk(v, false, here)
      }
    }
    walk(tree, true, null)
    return sections
      .filter((sec) => sec.fields.length)
      .map((sec) => ({ ...sec, hasTitle: !!sec.title }))
  }

  /** Proyección del OVERLAY superior del stack (drawer del crud): título + campos + acciones.
   *  null si no hay overlays. Sus acciones se postean contra el HOST (el drawer no lleva
   *  ServerSide propio — confirmado en el wire). */
  function overlayOf(reg) {
    const id = reg.stack && reg.stack.length ? reg.stack[reg.stack.length - 1] : null
    if (!id || !reg.contexts[id]) return null
    const ctx = reg.contexts[id]
    // bloques display del contenido del drawer (ResourceGrid/OfferCard/StatusList…):
    // el panel VB los pinta con el MISMO template de átomos que el host — un drawer no
    // es solo campos y botones (p.ej. el picker de habitaciones)
    // los FormFields del drawer ya los pinta su gramática de CAMPOS (oj-form-layout):
    // fuera los átomos isInput de los bloques o saldrían DUPLICADOS (y el usuario
    // escribiría en el par equivocado)
    // pauta del drawer Redwood: las ACCIONES van en la barra del pie. Un Button del
    // contenido SIN parámetros se mueve al pie (p.ej. Enviar); los que llevan parameters
    // (listas de opciones: métodos de cobro, habitaciones…) se quedan en su sitio y NO se
    // repiten en el pie. En un DIALOG (modal de decisión puntual) TODOS los botones son
    // acciones del pie — el listener del modal despacha actionId + parameters, así que
    // "Check-in de <nombre>" (con su _item) viaja igual que "Volver al listado"
    const isDialog = !!(ctx.tree && ctx.tree.metadata && ctx.tree.metadata.type === 'Dialog')
    const conParams = (btn) => !!(btn.parameters && Object.keys(btn.parameters).length)
    const keepInContent = isDialog ? () => false : conParams
    const content = (islandContentOf(ctx) || [])
      .map((block) => ({
        ...block,
        items: block.items
          .filter((a) => !a.isInput)
          .map((a) => (a.isButtons ? { ...a, buttons: (a.buttons || []).filter(keepInContent) } : a))
          .filter((a) => !a.isButtons || a.buttons.length),
      }))
      .filter((block) => block.items.length)
    const contentActionIds = new Set()
    for (const block of content) {
      for (const a of block.items) {
        if (a.isButtons) for (const btn of a.buttons || []) contentActionIds.add(btn.actionId)
      }
    }
    return {
      id,
      title: ctx.title || '',
      position: ctx.position || 'end',
      width: ctx.width,
      state: ctx.state || {},
      fields: fieldListOf(ctx.tree, ctx.state, ctx.data),
      sections: formSectionsOf(ctx.tree, ctx.state, ctx.data),
      actions: actionsOf(ctx.tree).filter((a) => !contentActionIds.has(a.actionId)),
      content: content,
      hasContent: !!content.length,
      // un overlay Dialog se pinta como MODAL (oj-dialog: decisión puntual), no como
      // drawer (tarea con formulario); texts = sus líneas de mensaje
      isDialog,
      texts: collectTexts(ctx.tree),
    }
  }

  /** Vigía del diálogo de progreso de un LongTask sobre el stream SSE: consume el Add del
   *  Dialog-con-ProgressBar y los state-only dirigidos a su id; devuelve eventos
   *  {kind: open|progress, title?, text?, value?, rest} para que el chain pinte el
   *  oj-dialog — `rest` lleva los commands/messages del increment (el último los trae:
   *  dispatchEvent del refresco) SIN el fragment del diálogo, listos para reducir. */
  function longTaskWatcher() {
    const hasProgressBar = (node) => {
      if (!node || typeof node !== 'object') return false
      if (node.metadata && node.metadata.type === 'ProgressBar') return true
      for (const v of Object.values(node)) {
        if (Array.isArray(v)) { if (v.some(hasProgressBar)) return true }
        else if (v && typeof v === 'object' && hasProgressBar(v)) return true
      }
      return false
    }
    const w = { dialogId: null, closeAfter: null }
    w.consume = (inc) => {
      for (const fragment of inc.fragments || []) {
        const md = fragment.component && fragment.component.metadata
        if (fragment.action === 'Add' && md && md.type === 'Dialog' && hasProgressBar(fragment.component)) {
          w.dialogId = md.id
          const seed = md.initialData || {}
          return {
            kind: 'open',
            title: seed.title,
            text: seed.progressText,
            value: seed.progressValue || 0,
            rest: { commands: inc.commands || [], messages: inc.messages || [], fragments: [] },
          }
        }
      }
      if (!w.dialogId) return null
      const frs = inc.fragments || []
      if (frs.length && frs.every((f) => !f.component && f.targetComponentId === w.dialogId)) {
        const st = frs[0].state || {}
        if (st._closeAfterMillis != null) w.closeAfter = st._closeAfterMillis
        return {
          kind: 'progress',
          title: st.title,
          text: st.progressText,
          value: st.progressValue,
          rest: { commands: inc.commands || [], messages: inc.messages || [], fragments: [] },
        }
      }
      return null
    }
    return w
  }

  /** Helper de RENDER: recolecta los textos (metadata.type Text) de un subárbol. */
  function collectTexts(node, out = []) {
    if (!node || typeof node !== 'object') return out
    if (node.metadata && node.metadata.type === 'Text' && node.metadata.text != null) {
      out.push(node.metadata.text)
    }
    for (const v of Object.values(node)) {
      if (Array.isArray(v)) v.forEach((x) => collectTexts(x, out))
      else if (v && typeof v === 'object') collectTexts(v, out)
    }
    return out
  }

  /** Proyección del FOLDOUT (Fase 7): overview + paneles con sus cabeceras (metadata.panels)
   *  y su contenido slotted (overview / panel-N). null si el contexto no es un foldout.
   *  Cada slot proyecta además sus bloques RICOS (mismo pipeline que el host: tarjetas
   *  StatusList, botones, inputs, notices…) — el markup pinta blocks y deja texts solo
   *  como forma legada para tests/fixtures. */
  function foldoutOf(ctx) {
    const node = ctx && ctx.tree ? findByType(ctx.tree, 'FoldoutLayout') : null
    if (!node) return null
    const md = node.metadata
    const children = node.children || []
    const bySlot = {}
    for (const child of children) bySlot[child.slot || ''] = child
    const blocksOf = (slotNode) => {
      const blocks = slotNode
        ? islandContentOf({ tree: slotNode, state: (ctx && ctx.state) || {} })
        : null
      // mismo contrato visual que hostContentOf: bloques-columna con su colClass,
      // el resto a fila completa
      return (blocks || []).map((block) => ({
        ...block,
        blockClass: block.colClass || 'oj-flex-item oj-sm-12',
      }))
    }
    return {
      headerTitle: md.headerTitle || '',
      overview: {
        texts: collectTexts(bySlot['overview']),
        blocks: blocksOf(bySlot['overview']),
      },
      panels: (md.panels || []).map((panel, i) => ({
        title: panel.title || '',
        subtitle: panel.subtitle || '',
        // título compuesto del panel: "Operaciones · 1 de 7" — el contador vive en la
        // CABECERA (leído del contenido vivo por índice, refresca sin re-stampar)
        headerLabel: (panel.title || '') + (panel.subtitle ? ' · ' + panel.subtitle : ''),
        open: panel.open !== false,
        // width EXPLÍCITO del wire (FoldoutPanel.width): el markup fija el panel a esa
        // medida — sin él, el motor responsive del foldout reparte a su aire y las
        // tarjetas del cockpit se solapan
        width: panel.width || '',
        texts: collectTexts(bySlot['panel-' + i]),
        blocks: blocksOf(bySlot['panel-' + i]),
      })),
    }
  }

  /** Proyección del WIZARD (Fase 8): los ProgressSteps del wire → pasos ({id,label} + currentStep
   *  por id). null si la página no es un wizard. En la pantalla de resultado todos los pasos van
   *  'done' → currentStep = el último.
   *
   *  ORIENTACIÓN: la decide el propio wizard con @WizardProgress — RAIL manda un ProgressSteps
   *  VERTICAL (el rail lateral: el oj-sp-guided-process auténtico, con su columna de pasos a la
   *  derecha); STEPS manda uno HORIZONTAL, y eso es un tren de pasos ARRIBA (horizontal: true →
   *  oj-train sobre el contenido, y en pantallas estrechas la lista de pasos en vertical, que un
   *  tren de 4-5 rótulos no cabe en un móvil). */
  function wizardOf(ctx) {
    const node = ctx && ctx.tree ? findByType(ctx.tree, 'ProgressSteps') : null
    if (!node) return null
    const md = node.metadata
    const wire = md.steps || []
    // display:'on' OBLIGATORIO: el rail marca oj-disabled todo paso sin display='on';
    // el status de Mateu NO se emite (el indicador del rail espera otro enum)
    const steps = wire.map((s) => ({
      id: s.id,
      label: s.title || s.id,
      title: s.title || s.id,
      display: 'on',
    }))
    const current = wire.find((s) => s.status === 'current')
    const currentStep = current ? current.id : (steps.length ? steps[steps.length - 1].id : null)
    const currentIndex = Math.max(0, steps.findIndex((s) => s.id === currentStep))
    const statusOf = (s, i) => s.status || (i < currentIndex ? 'done' : i === currentIndex ? 'current' : 'upcoming')
    return {
      steps,
      currentStep,
      horizontal: !md.vertical,
      currentIndex,
      currentLabel: steps.length ? steps[currentIndex].label : '',
      total: steps.length,
      // el tren (oj-train): los hechos se pueden VISITAR (volver atrás), los que faltan no —
      // se avanza con el botón del paso, que valida
      trainSteps: wire.map((s, i) => {
        const status = statusOf(s, i)
        return {
          id: s.id,
          label: s.title || s.id,
          visited: status === 'done',
          disabled: status === 'upcoming',
        }
      }),
      // la misma lista, para la variante vertical (pantallas estrechas): número o ✓ + rótulo
      listSteps: wire.map((s, i) => {
        const status = statusOf(s, i)
        return {
          id: s.id,
          label: s.title || s.id,
          marker: status === 'done' ? '✓' : String(i + 1),
          cls: 'mateu-wizard-step mateu-wizard-step-' + status,
        }
      }),
    }
  }

  /** ¿Es un átomo RICO (display de verdad, no un campo suelto)? Cuando el contenido de una pantalla
   *  los trae, el formulario genérico sobra: sus campos ya se ven en ellos. */
  function isRichAtom(a) {
    return !!(a && (a.isEntityHeader || a.isTaskProgress || a.isMeter || a.isStatusList || a.isLedger
      || a.isPayment || a.isResourceGrid || a.isAddOns || a.isStat || a.isNotice || a.isPropertyRow))
  }

  /** ¿Es este bloque de botones el PIE del wizard (Back / Next / la acción de completar)? */
  function isWizardNavAtom(a) {
    return !!(a && a.isButtons && (a.buttons || []).some((b) => b.actionId === 'back' || b.actionId === 'next'))
  }

  /**
   * El PASO actual de un wizard, listo para pintar: { title, content, sections, nav }.
   *
   * - content: los bloques display del paso (hostContentOf en modo wizard, con la isla fusionada).
   * - sections: los campos del paso agrupados por @Section (formSectionsOf), o [] si el contenido
   *   es RICO (la misma regla que el host: el header/las property rows ya muestran esos datos).
   * - Cada campo UNA vez: los FormFields que el formulario pinta (con su widget de verdad: select,
   *   fecha…) salen del contenido, donde sólo serían un oj-input-text de texto — antes salían dos
   *   veces, arriba como texto y abajo con su desplegable. Los de una isla fusionada (fromNested)
   *   son de otro contexto y se quedan.
   * - En HORIZONTAL (tren arriba) el pie Back/Next del wire sale del contenido a `nav` (la barra
   *   del pie), y el título del wizard (su h2) sale a `title` si la página no trae otro.
   */
  function wizardStepViewOf(ctx, islandBlocks, opts = {}) {
    const wizard = wizardOf(ctx)
    if (!wizard) return null
    let content = hostContentOf(ctx, islandBlocks,
      { forWizard: true, keepWizardNav: wizard.horizontal, title: opts.title || '' }) || []
    let sections = opts.sections || []
    if (content.some((block) => (block.items || []).some(isRichAtom))) sections = []
    const onForm = new Set()
    for (const section of sections) for (const f of section.fields || []) onForm.add(f.fieldId)
    let title = opts.title || ''
    let nav = []
    content = content.map((block) => {
      let movedToForm = 0
      const items = block.items.filter((a) => {
        if (a.isInput && !a.fromNested && onForm.has(a.fieldId)) { movedToForm++; return false }
        if (wizard.horizontal) {
          if (!title && a.isText && a.isH2) { title = a.text; return false }
          if (isWizardNavAtom(a)) { nav = a.buttons; return false }
        }
        return true
      })
      // una tarjeta de @Section cuyos campos se fueron al form se queda en su título: el form
      // ya pinta esa sección con su encabezado — fuera la tarjeta vacía
      const onlyHeadings = items.every((a) => a.isText && a.isHeading)
      return { ...block, items: movedToForm && onlyHeadings ? [] : items }
    }).filter((block) => block.items.length)
    // la acción de AVANCE (Next, o la de completar) es la llamada a la acción del pie
    nav = nav.map((b) => ({
      ...b,
      chroming: b.actionId === 'back' ? 'outlined' : 'callToAction',
    }))
    return { wizard, title, content, sections, nav }
  }

  /** Helper de RENDER: todos los nodos de un tipo (sin cruzar fronteras de isla). */
  function findAllByType(tree, type) {
    const out = []
    const walk = (n, isRoot) => {
      if (!n || typeof n !== 'object') return
      if (!isRoot && n.type === 'ServerSide') return
      if (n.metadata && n.metadata.type === type) out.push(n)
      for (const v of Object.values(n)) {
        if (Array.isArray(v)) v.forEach((x) => walk(x, false))
        else if (v && typeof v === 'object') walk(v, false)
      }
    }
    walk(tree, true)
    return out
  }

  /** Card → {title, texts} (el título del Card es un componente Text anidado). */
  function cardOf(node) {
    const md = (node && node.metadata) || {}
    return { title: collectTexts(md.title)[0] || '', texts: collectTexts(md.content) }
  }

  /** Arquetipo WELCOME: hero (título/subtítulo + CTAs) + tiles del DashboardLayout. */
  function welcomeOf(ctx) {
    const hero = ctx && ctx.tree ? findByType(ctx.tree, 'HeroSection') : null
    if (!hero) return null
    const md = hero.metadata
    const ctas = actionsOf(hero)
    const panels = findAllByType(ctx.tree, 'DashboardPanel')
    // un TrendChart en un tile → CHART a todo el ancho bajo los KPIs (oj-chart en VB);
    // items PRECOMPUTADOS (id/value/group/series) — el CSP de VB no construye arrays
    const trendPanel = panels.find(
      (panel) => findByType(panel, 'TrendChart') || findByType(panel, 'Chart'))
    const chartNode = trendPanel
      ? findByType(trendPanel, 'TrendChart') || findByType(trendPanel, 'Chart') : null
    const tm = chartNode ? chartNode.metadata : null
    // valores/labels de las dos formas del wire: TrendChart (values/labels planos) o
    // Chart (chartData.labels + datasets[0].data — se toma la primera serie)
    const dataset = tm && tm.chartData && tm.chartData.datasets && tm.chartData.datasets.length
      ? tm.chartData.datasets[0] : null
    const values = tm ? (tm.values || (dataset ? dataset.data : []) || []) : []
    const labels = tm ? (tm.labels || (tm.chartData ? tm.chartData.labels : []) || []) : []
    const series = (dataset && dataset.label) || 'Ocupación %'
    const trend = tm
      ? {
          title: trendPanel.metadata.title || tm.title || '',
          items: (values || []).map((value, i) => ({
            id: i,
            value,
            group: [labels[i] != null ? labels[i] : String(i + 1)],
            series,
          })),
        }
      : null
    const tiles = panels.filter((panel) => panel !== trendPanel).map((panel) => {
      // un MetricCard dentro del tile → KPI (valor grande + etiqueta + caption)
      const metric = findByType(panel, 'MetricCard') || findByType(panel, 'Stat')
      const mm = metric ? metric.metadata : null
      return {
        title: panel.metadata.title || '',
        texts: collectTexts(panel),
        isKpi: !!mm,
        kpiTitle: mm ? (mm.title || mm.label || '') : '',
        kpiValue: mm ? String(mm.value == null ? '' : mm.value) : '',
        kpiCaption: mm ? (mm.description || mm.caption || '') : '',
        kpiActionId: mm ? (mm.actionId || '') : '',
      }
    })
    return {
      trend,
      title: md.title || '',
      subtitle: md.subtitle || '',
      ctas,
      primaryCta: ctas.length ? { label: ctas[0].label } : { label: '' },
      primaryCtaId: ctas.length ? ctas[0].actionId : '',
      secondaryCta: ctas.length > 1 ? { label: ctas[1].label } : null,
      secondaryCtaId: ctas.length > 1 ? ctas[1].actionId : '',
      tiles,
    }
  }

  /** Arquetipo GENERAL OVERVIEW: switcher de registro + EntityHeader + cards. */
  function generalOverviewOf(ctx) {
    const header = ctx && ctx.tree ? findByType(ctx.tree, 'EntityHeader') : null
    if (!header) return null
    const md = header.metadata
    const switcher = collectFields(ctx.tree).find((f) => f.options && f.options.length)
    // el arquetipo REQUIERE el switcher de registro: un EntityHeader suelto (p.ej. el 360
    // de en casa o el folio de check-out como página) NO es un General Overview
    if (!switcher) return null
    const state = ctx.state || {}
    const badgeText = (md.badges || []).map((b) => b.label).join(' · ')
    const facts = (md.facts || []).map((f) => ({ label: f.label, value: f.value }))
    if (md.metricLabel) facts.push({ label: md.metricLabel, value: md.metricValue })
    const cards = findAllByType(ctx.tree, 'Card')
      .map(cardOf)
      .filter((card) => card.title) // los Card sin título son wrappers de sección/estructura
    return {
      title: md.title || '',
      subtitle: (md.subtitle || '') + (badgeText ? ' · ' + badgeText : ''),
      facts,
      switcherField: switcher ? switcher.fieldId : '',
      switcherOptions: switcher
        ? switcher.options.map((o) => ({ value: o.value, label: o.label }))
        : [],
      switcherValue: switcher ? state[switcher.fieldId] : null,
      cards,
    }
  }

  /** Arquetipo ITEM OVERVIEW: panel de datos clave + tabs. */
  function itemOverviewOf(ctx) {
    const tabLayout = ctx && ctx.tree ? findByType(ctx.tree, 'TabLayout') : null
    if (!tabLayout) return null
    const keyCard = findAllByType(ctx.tree, 'Card').find((card) => !findByType(card, 'TabLayout'))
    // El arquetipo es panel de datos clave + pestañas: sin panel esto no es un item overview,
    // es un FORMULARIO que resulta que lleva pestañas dentro. Reclamarlo igual dejaba la página
    // sin sus campos (no hay tarjeta clave que pintar) y las pestañas reducidas a sus rótulos
    // (de su contenido solo se sacan textos sueltos). Le pasaba al detalle de un proceso.
    if (!keyCard) return null
    const tabs = findAllByType(ctx.tree, 'Tab').map((tab, i) => ({
      id: 'itab-' + i,
      label: tab.metadata.label || tab.metadata.caption || 'Tab ' + (i + 1),
      texts: collectTexts(tab),
    }))
    return {
      key: keyCard ? cardOf(keyCard) : { title: '', texts: [] },
      tabs,
    }
  }

  /** Puerta 1.3: banners de página (Page.metadata.banners) → items del
   *  oj-sp-messages-banner del starter (MessagesBannerType). */
  function bannersOf(ctx) {
    const page = ctx && ctx.tree ? findByType(ctx.tree, 'Page') : null
    // los messageType del oj-sp-messages-banner van con prefijo general-* (patrón del starter)
    const THEMES = { INFO: 'general-info', SUCCESS: 'general-success', WARNING: 'general-warning', DANGER: 'general-error' }
    return (((page || {}).metadata || {}).banners || []).map((banner, i) => ({
      id: 'mateu-banner-' + i,
      messageType: THEMES[banner.theme] || 'general-info',
      primaryText: banner.title || '',
      secondaryText: banner.description || '',
    }))
  }

  /** Puerta 1.6: anatomía RDS del ancho de página (medición Toolkit 24C) — el wrapper del
   *  contenido aplica contexts[host].pageWidth: fixed = tope 1408px con gutters 24px;
   *  fullWidth = fluido con gutters 24px; edgeToEdge = 0 márgenes. En FIXED el borde
   *  DERECHO se ancla a la MISMA fórmula con la que oj-sp-simple-ui-shell coloca su
   *  chrome flotante (chat FAB: right = (100vw - 1536px)/2, medido) — el shell calcula
   *  su caja sobre el viewport COMPLETO e ignora el navigator drawer, así que centrar
   *  el contenido en el área restante lo desalineaba del FAB en viewports anchos;
   *  izquierda auto (absorbe el drawer), tope 1408. */
  function pageStyleOf(ctx) {
    const width = (ctx && ctx.pageWidth) || 'fixed'
    if (width === 'edgeToEdge') return { maxWidth: 'none', margin: '0', padding: '0' }
    if (width === 'fullWidth') return { maxWidth: 'none', margin: '0', padding: '24px' }
    return {
      maxWidth: '1408px',
      margin: '0 max(24px, calc((100vw - 1536px) / 2 + 64px)) 0 auto',
      padding: '24px',
    }
  }

  /** Proyección de NAVEGACIÓN de la shell: items de primer nivel + grupos con sus hijos.
   *  Un grupo (submenus en el wire) NO resuelve por sync — sus hijos navegan por la ruta
   *  TERMINAL (la compuesta /gestion/person da "Not found."; se recorta el prefijo del padre).
   *  Selectores de contexto y acciones de cabecera salen listos para bindings simples. */
  // Iconos de menú: el wire trae nombres NEUTRALES (convención Mateu: set de Vaadin,
  // p.ej. "vaadin:calendar-user") — cada renderer los traduce a su set; aquí, al icon
  // font Redwood (oj-ux-ico-*, clases del gallery bundle). Un valor que ya venga como
  // clase oj-ux pasa tal cual; sin traducción conocida → sin icono.
  const OJ_ICONS = {
    'vaadin:calendar-user': 'oj-ux-ico-calendar-contact',
    'vaadin:calendar': 'oj-ux-ico-calendar',
    'vaadin:tasks': 'oj-ux-ico-task',
    'vaadin:automation': 'oj-ux-ico-robot-action',
    'vaadin:cog': 'oj-ux-ico-settings',
    'vaadin:cogs': 'oj-ux-ico-settings',
    'vaadin:home': 'oj-ux-ico-home',
    'vaadin:user': 'oj-ux-ico-contact',
    'vaadin:users': 'oj-ux-ico-contact-group',
    'vaadin:bed': 'oj-ux-ico-bed',
    'vaadin:chart': 'oj-ux-ico-bar-chart',
    'vaadin:table': 'oj-ux-ico-table',
    'vaadin:money': 'oj-ux-ico-currency-money',
    'vaadin:barcode': 'oj-ux-ico-scan-barcode',
    'vaadin:pencil': 'oj-ux-ico-edit',
    'vaadin:ban': 'oj-ux-ico-do-not-enter',
    'vaadin:rotate-left': 'oj-ux-ico-undo',
    'vaadin:exchange': 'oj-ux-ico-exchange-h',
    'vaadin:wifi': 'oj-ux-ico-connection',
    'vaadin:key': 'oj-ux-ico-key',
    'vaadin:pen': 'oj-ux-ico-signature',
    'vaadin:credit-card': 'oj-ux-ico-bank-card',
    'vaadin:gift': 'oj-ux-ico-gift',
    'vaadin:cart': 'oj-ux-ico-cart',
    'vaadin:check': 'oj-ux-ico-check',
    'vaadin:clock': 'oj-ux-ico-clock',
    // la campana del badge de la bandeja (widget de cabecera)
    'vaadin:bell': 'oj-ux-ico-notification',
    'vaadin:bell-o': 'oj-ux-ico-notification',
    'vaadin:envelope': 'oj-ux-ico-email',
    'vaadin:sign-out': 'oj-ux-ico-logout',
  }
  function ojIconOf(icon) {
    if (!icon) return undefined
    if (icon.indexOf('oj-ux-') === 0) return icon
    return OJ_ICONS[icon] || undefined
  }

  /**
   * Una opción de menú → nodo del árbol que pintan la barra y el navigator.
   *
   * RECURSIVO porque el menú lo es: una shell federada llega con tres niveles sin pedir permiso
   * (grupo de la shell → grupo del pod → sus pantallas), y aplanarlo no deja el tercer nivel feo,
   * lo deja INALCANZABLE — el grupo del pod se navega como si fuese pantalla y contesta vacío.
   *
   * `id` es la ruta con la que se navega: la TERMINAL para una hoja local (la compuesta,
   * /gestion/person, es un camino de menú y no una ruta que el backend resuelva) y la COMPUESTA
   * para una traída de otro pod (la marca es el baseUrl que le dejó expandRemoteMenus): allí es
   * justo al revés — es la que ese pod sirve, y recortarla la deja sin dueño.
   */
  function navNodeOf(option, parentRoute) {
    const raw = option.route || option.path || ''
    const id = !option.baseUrl && parentRoute && raw.indexOf(parentRoute + '/') === 0
      ? raw.slice(parentRoute.length)
      : raw
    // una entrada OCULTA (@Menu @Hidden, visible:false) no se dibuja a ninguna profundidad: su ruta
    // sigue resolviendo (la registra el transporte), pero el menú no la enseña
    const children = (option.submenus || option.submenu || []).filter((child) => child.visible !== false)
    return {
      id,
      label: option.caption || option.label || id,
      icon: ojIconOf(option.icon),
      hasChildren: children.length > 0,
      // el padre de un nieto es la ruta CRUDA del hijo, no su id ya recortado
      children: children.map((child) => navNodeOf(child, raw)),
    }
  }

  function shellNavOf(reg) {
    const shell = reg.shell || {}
    const items = []
    const menuTree = []
    let hasGroups = false
    for (const option of shell.menu || []) {
      // una opción que viaja sin pintarse (remota oculta): expandRemoteMenus ya la quita, pero un
      // menú que no pase por ahí tampoco debe dibujarla
      if (option.visible === false) continue
      const node = navNodeOf(option, '')
      items.push({ id: node.id, label: node.label, icon: node.icon })
      if (node.hasChildren) hasGroups = true
      menuTree.push(node)
    }
    // la VARIANTE del wire manda: TABS → in-app navigation; HAMBURGUER_MENU/TILES →
    // hamburguesa que abre un DRAWER izquierdo con oj-navigation-list (como el navigator
    // FA); MENU_ON_TOP (o TABS con grupos) → opciones de primer nivel VISIBLES en el
    // header, dropdown oj-menu solo para los grupos
    let mode = 'tabs'
    if (shell.variant === 'HAMBURGUER_MENU' || shell.variant === 'TILES') mode = 'drawer'
    else if (shell.variant === 'MENU_ON_TOP' || hasGroups) mode = 'topbar'
    return {
      mode,
      items,
      menuTree,
      selectors: (shell.appContext || []).map((selector) => ({
        fieldName: selector.fieldName,
        label: selector.label || selector.fieldName,
        options: (selector.options || []).map((o) => ({ value: o.value, label: o.label || String(o.value) })),
      })),
      headerActions: (shell.headerActions || []).map((a) => ({
        actionId: a.actionId,
        label: a.label,
        hasChildren: !!(a.children && a.children.length),
        children: (a.children || []).map((c) => ({ actionId: c.actionId, label: c.label })),
      })),
      serverSideType: shell.serverSideType,
      homeRoute: shell.homeRoute || '',
    }
  }

  /** Colores de Chip del wire → clases badge de JET (sistema, Redwood). PRECOMPUTADO (CSP). */
  const BADGE_CLASSES = {
    error: 'oj-badge oj-badge-danger oj-badge-subtle',
    danger: 'oj-badge oj-badge-danger oj-badge-subtle',
    warning: 'oj-badge oj-badge-warning oj-badge-subtle',
    success: 'oj-badge oj-badge-success oj-badge-subtle',
    contrast: 'oj-badge oj-badge-neutral oj-badge-subtle',
    // the plain chip — Vaadin paints it in the primary tone; entityHeaderOf already reads it as info
    normal: 'oj-badge oj-badge-info oj-badge-subtle',
    info: 'oj-badge oj-badge-info oj-badge-subtle',
  }

  /** Proyección del TaskQueue (cola de trabajo del front-office): grupos de cards con
   *  badges; el clic despacha metadata.actionId con parameters._item = id del item
   *  (contrato del renderer web compartido: mateu-task-queue.ts). Los datos viajan
   *  INLINE en la metadata — no hay eje data ni triggers. */
  function taskQueueOf(tree) {
    const node = findByType(tree, 'TaskQueue')
    if (!node) return null
    const md = node.metadata
    return {
      actionId: md.actionId,
      groups: (md.groups || []).map((group) => ({
        label: group.label,
        items: (group.items || []).map((item) => ({
          id: item.id,
          title: item.title,
          caption: item.caption || '',
          selected: !!item.selected,
          cardClass: item.selected ? 'oj-sm-margin-2x-bottom oj-bg-neutral-20' : 'oj-sm-margin-2x-bottom',
          badges: (item.badges || []).map((badge) => ({
            label: badge.label,
            badgeClass: BADGE_CLASSES[badge.color] || 'oj-badge oj-badge-neutral oj-badge-subtle',
          })),
          // opción de LÍNEA (p.ej. "Check-out" solo en reservas in house): botón en la card
          // que despacha su propio actionId con {_item} — mismo contrato que el renderer web
          hasAction: !!(item.actionLabel && item.actionId),
          actionLabel: item.actionLabel || '',
          actionId: item.actionId || '',
          parameters: { _item: item.id },
        })),
      })),
    }
  }

  /** Proyección del EmptyState suelto (placeholder del panel de detalle, o página de
   *  bienvenida). Tras seleccionar un item el server lo sustituye por la isla → null. */
  function emptyStateOf(tree) {
    const node = findByType(tree, 'EmptyState')
    if (!node) return null
    const md = node.metadata
    return {
      title: (md.icon ? md.icon + ' ' : '') + (md.title || ''),
      description: md.description || '',
    }
  }

  /** Interpolación del wire (labels con plantillas): ${state.clave} → valor del state. */
  function interpolate(text, state) {
    // `${state.x}` y también `${state['x']}` / `${state["x"]}` (la posición del editor de filas
    // llega como ${state['_position']})
    return String(text == null ? '' : text).replace(
      /\$\{state(?:\.([A-Za-z0-9_]+)|\[\s*['"]([^'"\]]+)['"]\s*\])\}/g,
      (all, dotted, quoted) => {
        const key = dotted || quoted
        return state && state[key] != null ? String(state[key]) : ''
      },
    )
  }

  const TEXT_CLASSES = {
    xl: 'oj-typography-heading-md',
    l: 'oj-typography-subheading-md',
    s: 'oj-typography-body-sm',
    xs: 'oj-typography-body-xs oj-text-color-secondary',
  }
  const NOTICE_CLASSES = {
    success: 'oj-panel oj-sm-padding-3x oj-sm-margin-2x-bottom oj-bg-success-30',
    warning: 'oj-panel oj-sm-padding-3x oj-sm-margin-2x-bottom oj-bg-warning-30',
    danger: 'oj-panel oj-sm-padding-3x oj-sm-margin-2x-bottom oj-bg-danger-30',
    info: 'oj-panel oj-sm-padding-3x oj-sm-margin-2x-bottom oj-bg-info-30',
  }

  /** Proyección GENÉRICA del contenido display de una isla (p.ej. el CheckInWizard
   *  embebido del front-office): BLOQUES (plain | card) de átomos precomputados para el
   *  CSP de VB (flags is*, clases, textos interpolados contra el state). Las islas
   *  ANIDADAS (App mediador dentro de la isla, p.ej. el documento) se saltan — fase
   *  posterior. null si el árbol no aporta nada display (isla de formulario puro). */
  /** Fábrica de data providers de JET, inyectada por la app (en Node no hay ninguna: el atom
   *  viaja con las filas y sin proveedor, que es lo que los tests comprueban). */
  let dataProviderFactory = null
  function setDataProviderFactory(factory) { dataProviderFactory = factory }

  function islandContentOf(ctx, opts = {}) {
    if (!ctx || !ctx.tree) return null
    const activeTab = opts.activeTab || ''
    const state = ctx.state || {}
    const interp = (t) => interpolate(t, state)
    const badgeOf = (b) => ({
      label: b.label,
      badgeClass: BADGE_CLASSES[b.color] || 'oj-badge oj-badge-neutral oj-badge-subtle',
    })
    const buttonOf = (m) => ({
      actionId: m.actionId,
      label: m.label || m.actionId,
      disabled: !!m.disabled,
      chroming: m.buttonStyle === 'primary' ? 'callToAction' : 'outlined',
      parameters: m.parameters || {},
    })
    const money = (value, currency) => (currency || '€') + ' ' + Number(value || 0)
      .toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    const STATUS_TEXT = {
      success: 'oj-text-color-success',
      warning: 'oj-text-color-warning',
      danger: 'oj-text-color-danger',
      error: 'oj-text-color-danger',
    }
    const blocks = []
    let plain = null
    const atom = (a, container) => {
      if (container) { container.items.push(a); return }
      if (!plain) { plain = { isPlain: true, items: [] }; blocks.push(plain) }
      plain.items.push(a)
    }
    // los hijos de un nodo viajan en children Y/O en metadata.content (CustomField, Notice…)
    const kidsOf = (node) => {
      const out = [...(node.children || [])]
      const inner = node.metadata && node.metadata.content
      if (Array.isArray(inner)) out.push(...inner)
      else if (inner && typeof inner === 'object') out.push(inner)
      return out
    }
    const collectButtons = (node, out) => {
      if (!node || typeof node !== 'object') return out
      if (node.metadata && node.metadata.type === 'Button') { out.push(buttonOf(node.metadata)); return out }
      for (const child of kidsOf(node)) collectButtons(child, out)
      return out
    }
    const visit = (node, container) => {
      if (!node || typeof node !== 'object') return
      const m = node.metadata
      const t = m && m.type
      // FILA ZONADA (@Zones): HorizontalLayout cuyos hijos son columnas con
      // flex: 1 1 calc(NN% …) — cada zona se proyecta como bloque-columna (colClass
      // oj-md-(NN→doceavos)); si una zona genera varios bloques se FUSIONAN en uno
      // (un flex no puede apilar dos items en la misma celda de fila)
      if (t === 'HorizontalLayout' && !container) {
        const zoneMatches = (node.children || []).map(
          (ch) => String(ch.style || '').match(/flex:\s*1 1 calc\((\d+(?:\.\d+)?)%/))
        if (zoneMatches.length >= 2 && zoneMatches.every(Boolean)) {
          node.children.forEach((zoneChild, i) => {
            const pct = parseFloat(zoneMatches[i][1])
            const col = Math.min(11, Math.max(1, Math.round(pct * 12 / 100)))
            // las cssClasses del wire de la COLUMNA viajan al bloque (p.ej. la banda
            // neutra de la info secundaria del general overview: oj-panel + oj-bg-*)
            const colClass = 'oj-flex-item oj-sm-12 oj-md-' + col + ' oj-sm-padding-4x-end'
              + (zoneChild.cssClasses ? ' ' + zoneChild.cssClasses : '')
            const before = blocks.length
            plain = null
            visit(zoneChild, null)
            plain = null
            const created = blocks.splice(before)
            if (created.length === 1) {
              created[0].colClass = colClass
              blocks.push(created[0])
            } else if (created.length > 1) {
              blocks.push({ isPlain: true, colClass, items: created.flatMap((b) => b.items) })
            }
          })
          return
        }
      }
      if (t === 'App') {
        // isla ANIDADA (p.ej. el documento del check-in): marcador de posición — el
        // contenido vive en su propio contexto y lo pinta mateuNested en ese hueco
        atom({ isNested: true, islandId: node.id }, container)
        return
      }
      if (t === 'FormField') {
        const fieldId = m.fieldId || m.id
        // GRID embebido en un formulario (una lista con columnas: los Steps/Messages de un
        // proceso). No es el listado de un crud —ése tiene su propia rama y su cabecera de
        // búsqueda—, es una tabla más del contenido.
        if ((m.columns || []).length) {
          const rows = Array.isArray(state[fieldId]) ? state[fieldId] : []
          // lista EDITABLE con el editor de fila en un diálogo (@DetailFormCustomisation
          // position = modal): "+" debajo y, por fila, Editar / Quitar en su última columna
          const rowEditable = isModalRowEditor(m)
          const columns = m.columns
            .map((col) => col.metadata || col)
            // la columna-botón `_select` ("Edit") del wire la sustituye la de acciones de fila
            .filter((c) => !(c.id === '_select' && c.stereotype === 'button'))
            .map((c) => {
              const def = { headerText: c.label || c.id, field: c.id }
              if (c.dataType === 'status') def.template = 'cellStatusBadge'
              return def
            })
          if (rowEditable) {
            columns.push({ headerText: '', field: '__rowActions', template: 'cellListRowActions', sortable: 'disabled' })
          }
          const shown = statusBadgeRows(rows, m.columns).map((row, i) => (rowEditable
            ? {
              ...row,
              _rowNumber: row._rowNumber == null ? i : row._rowNumber,
              __rowKey: String(row._rowNumber == null ? i : row._rowNumber),
              __editActionId: fieldId + '_select',
              __removeActionId: fieldId + '_remove',
            }
            : row))
          atom({
            isGrid: true,
            fieldId,
            label: m.label || '',
            columns,
            rows: shown,
            // el data provider lo construye la app (JET); en Node no hay, y el atom viaja igual
            adp: dataProviderFactory ? dataProviderFactory(shown) : null,
            isEmpty: rows.length === 0,
            rowEditable,
            addActionId: rowEditable ? fieldId + '_add' : '',
            addLabel: 'Add',
          }, container)
          return
        }
        if (m.propertyRow) {
          const raw = state[fieldId] != null ? state[fieldId] : (m.value != null ? m.value : '')
          atom({ isPropertyRow: true, label: m.label || m.displayName || fieldId, value: interp(String(raw)) }, container)
          return
        }
        // FormField FLUIDO editable (p.ej. el buscador de cargos del modo check-out):
        // input ligado por fieldId al estado del contexto (draft + auto-save)
        if (m.dataType === 'string' || m.dataType === 'integer' || m.dataType === 'number') {
          atom({
            isInput: true,
            fieldId,
            label: m.label || '',
            value: state[fieldId] == null ? '' : String(state[fieldId]),
          }, container)
        }
        return
      }
      if (t === 'TabLayout') {
        // Las pestañas se APLANAN: el atom de la barra + el contenido de la pestaña activa
        // como átomos normales del mismo contenedor. Anidar átomos dentro de átomos obligaría a
        // duplicar toda la plantilla dentro de la pestaña y a pelearse con el $current anidado
        // de VB; así el vocabulario que ya existe pinta el contenido sin enterarse.
        const tabs = (node.children || []).filter((c) => c.metadata && c.metadata.type === 'Tab')
        if (!tabs.length) return
        const ids = tabs.map((tab, i) => 'tab-' + i)
        const wanted = ids.indexOf(activeTab)
        const selected = wanted >= 0 ? wanted : tabs.findIndex((tab) => tab.metadata.active)
        const current = selected >= 0 ? selected : 0
        atom({
          isTabs: true,
          selectedId: ids[current],
          tabs: tabs.map((tab, i) => ({
            id: ids[i],
            label: interp(tab.metadata.label || tab.metadata.caption || 'Tab ' + (i + 1)),
          })),
        }, container)
        for (const child of tabs[current].children || []) visit(child, container)
        return
      }
      if (t === 'CustomField') {
        // envoltorio: lo que importa es lo que lleva dentro (metadata.content)
        const inner = m.content
        if (Array.isArray(inner)) inner.forEach((c) => visit(c, container))
        else if (inner && typeof inner === 'object') visit(inner, container)
        return
      }
      if (t === 'Element') {
        // Componente WEB de terceros (el grafo de un proceso). Los atributos son su único canal
        // de datos y viajan en la METADATA, que un State no reenvía: escritos como `${state.x}`
        // son VALORES y se reevalúan en cada render — mismo idioma que cualquier rótulo. El
        // módulo del atributo `import` lo carga la app la primera vez que se usa la etiqueta.
        const attributes = {}
        for (const key of Object.keys(m.attributes || {})) attributes[key] = interp(m.attributes[key])
        atom({
          isElement: true,
          elementId: node.id || m.name,
          name: m.name,
          importUrl: (m.attributes || {}).import || '',
          attributes,
          style: node.style || '',
          cssClasses: node.cssClasses || '',
          content: interp(m.content || ''),
          asHtml: !!m.html,
          on: m.on || null,
        }, container)
        return
      }
      if (t === 'Card') {
        const card = { isCard: true, items: [] }
        blocks.push(card)
        plain = null
        const title = m.title && (m.title.text || (typeof m.title === 'string' ? m.title : ''))
        if (title) card.items.push({ isText: true, text: interp(title), cls: 'oj-typography-subheading-xs oj-sm-margin-2x-bottom' })
        for (const child of node.children || []) visit(child, card)
        const cardInner = m.content
        if (Array.isArray(cardInner)) cardInner.forEach((c) => visit(c, card))
        else if (cardInner && typeof cardInner === 'object' && cardInner.metadata) visit(cardInner, card)
        plain = null
        return
      }
      if (t === 'Page') {
        // título de la isla + su TOOLBAR (los @Toolbar del server viajan en metadata.toolbar)
        const pageTitle = interp(m.title || '')
        if (pageTitle) atom({ isText: true, text: pageTitle, cls: 'oj-typography-subheading-sm' }, container)
        const toolbar = (m.toolbar || []).filter((b) => b && b.actionId)
        if (toolbar.length) atom({ isButtons: true, fromPageToolbar: true, buttons: toolbar.map(buttonOf) }, container)
        for (const child of kidsOf(node)) visit(child, container)
        return
      }
      if (t === 'CustomComponent') {
        // Escape hatch (#14): VB no trae un renderer para el tipo → placeholder visible + los hijos
        // slotted igualmente (paridad con el <mateu-unsupported> del web).
        atom({
          isNotice: true,
          text: 'Custom component "' + (m.name || '') + '" — no VB renderer',
          noticeClass: NOTICE_CLASSES.warning,
          buttons: [],
        }, container)
        for (const child of kidsOf(node)) visit(child, container)
        return
      }
      if (t === 'Text') {
        const text = interp(m.text)
        if (text) {
          // container h1..h6 → HEADING de contenido: h3 real (el escalón siguiente al h2
          // de la sección), con ritmo de grupo (margin-top) cuando no abre el bloque
          const heading = /^h[1-6]$/.test(m.container || '')
          if (heading) {
            const target = container || plain
            const notFirst = !!(target && target.items.length)
            atom({
              isText: true,
              isHeading: true,
              // un h2 al frente de una zona es el TITULO del fold (el gop lo asciende a
              // cabecera de slot con el subrayado del foldout)
              isH2: m.container === 'h2',
              text,
              cls: 'oj-typography-subheading-xs' + (notFirst ? ' oj-sm-margin-10x-top' : ''),
            }, container)
          } else {
            atom({ isText: true, text, cls: TEXT_CLASSES[m.size] || 'oj-typography-body-md' }, container)
          }
        }
        return
      }
      if (t === 'ProgressSteps') {
        const steps = (m.steps || []).map((step) => ({ id: step.id, label: step.title || step.label || step.id }))
        const current = (m.steps || []).find((step) => step.status === 'current')
        atom({ isProgress: true, steps, selectedId: current ? current.id : (steps[0] && steps[0].id) }, container)
        return
      }
      if (t === 'EntityHeader') {
        atom({
          isEntityHeader: true,
          title: interp(m.title),
          subtitle: interp(m.subtitle || ''),
          badges: (m.badges || []).map(badgeOf),
          facts: (m.facts || []).map((f) => ({ label: f.label, value: interp(f.value) })),
          metricLabel: m.metricLabel || '',
          metricValue: interp(m.metricValue || ''),
        }, container)
        return
      }
      if (t === 'Notice') {
        atom({
          isNotice: true,
          text: interp(m.text),
          noticeClass: NOTICE_CLASSES[m.theme] || NOTICE_CLASSES.info,
          buttons: collectButtons({ children: kidsOf(node) }, []),
        }, container)
        return
      }
      if (t === 'BulletedList') {
        atom({ isBullets: true, items: (m.items || []).map(interp) }, container)
        return
      }
      if (t === 'Separator') {
        atom({ isSeparator: true }, container)
        return
      }
      if (t === 'Badge') {
        atom({ isBadge: true, label: interp(m.text), badgeClass: BADGE_CLASSES[m.color] || 'oj-badge oj-badge-neutral oj-badge-subtle' }, container)
        return
      }
      if (t === 'ResourceGrid') {
        const columns = m.columns && m.columns > 0 && m.columns <= 12 ? m.columns : 4
        const colClass = 'oj-flex-item oj-sm-' + Math.max(1, Math.floor(12 / columns))
        atom({
          isResourceGrid: true,
          items: (m.items || []).map((it) => ({
            id: it.id,
            title: it.title,
            subtitle: it.subtitle || '',
            statusLabel: it.statusLabel || '',
            statusBadgeClass: BADGE_CLASSES[it.statusColor] || 'oj-badge oj-badge-neutral oj-badge-subtle',
            note: it.note || '',
            recommendedLabel: it.recommended ? (m.recommendedLabel || '') : '',
            enabled: !it.disabled,
            disabled: !!it.disabled,
            actionId: m.actionId,
            parameters: { _item: it.id },
            colClass,
            cardClass: it.selected ? 'oj-bg-neutral-20' : '',
          })),
        }, container)
        return
      }
      if (t === 'OfferCard') {
        atom({
          isOffer: true,
          tag: interp(m.tag || ''),
          title: interp(m.title || ''),
          subtitle: interp(m.subtitle || ''),
          features: (m.features || []).map(interp).join(' · '),
          currentLabel: m.current ? (m.currentLabel || '') : '',
          addedLabel: m.added ? (m.addedLabel || '') : '',
          priceLabel: interp(m.priceLabel || ''),
          actionLabel: m.actionId ? (m.actionLabel || '') : '',
          actionId: m.actionId || '',
          parameters: {},
        }, container)
        return
      }
      if (t === 'AddOnPicker') {
        atom({
          isAddOns: true,
          actionId: m.actionId,
          currency: m.currency || '€',
          totalLabel: m.totalLabel || 'Total',
          items: (m.items || []).map((it) => ({
            id: it.id,
            icon: it.icon || '',
            title: interp(it.title),
            description: interp(it.description || ''),
            price: it.price || 0,
            priceText: money(it.price, m.currency) + (it.unit ? ' / ' + it.unit : ''),
            includedLabel: it.includedLabel || '',
            selectable: !it.includedLabel,
            added: !!it.added,
          })),
        }, container)
        return
      }
      if (t === 'StatusList') {
        // columns > 1 → grid responsive de N columnas: el wrapper pasa a oj-flex (wrap) y
        // cada ítem se pinta como TARJETA (oj-panel: borde propio, badge de estado dentro)
        // — celdas sin borde dejaban ambiguo a qué tarea pertenece cada chip y el conjunto
        // no se leía como listado de tareas. La celda exterior es a su vez oj-flex para que
        // el panel interior estire a la altura de la fila (align-items stretch).
        // Todo precomputado por ítem — el CSP de VB no divide ni compara.
        const cols = m.columns && m.columns > 1 && m.columns <= 12 ? m.columns : 0
        const rowClass = 'oj-flex oj-sm-align-items-center oj-sm-margin-2x-bottom'
        // SOLO columns>1 fuerza tarjetas: una lista de una columna con acciones (los
        // huéspedes) se pinta con la rama APILADA del markup — nombre como h3 (nivel
        // siguiente al h2 de la sección), sin avatar, ritmo .mateu-list-item
        const asCards = cols > 0
        // la rejilla del cockpit: celdas de MEDIDA FIJA (.mateu-grid-cell, 22rem) con el
        // aire entre tarjetas como gap de la rejilla (.mateu-grid) — ver app.css
        const cellClass = cols
          ? 'oj-flex-item mateu-grid-cell oj-flex oj-sm-margin-4x-bottom'
          : (asCards ? 'oj-flex-item oj-sm-12 oj-flex oj-sm-margin-4x-bottom' : '')
        atom({
          isStatusList: true,
          wrapClass: cols > 0 ? 'oj-flex mateu-grid' : (asCards ? 'oj-flex' : ''),
          items: (m.items || []).map((it) => {
            // hasta DOS acciones por fila (p.ej. Escanear / A mano por pax) — array
            // precomputado; una fila CON acciones se pinta APILADA (título+chip /
            // descripción / botones) para no descolocarse en carriles estrechos
            // hasta TRES acciones por fila; con actionIcon* el botón se pinta SOLO-ICONO
            // (label como tooltip/aria) — iconClass precomputado vía ojIconOf
            const rowActions = []
            if (it.actionLabel && it.actionId) {
              rowActions.push({ label: it.actionLabel, actionId: it.actionId, parameters: { _item: it.id },
                iconClass: ojIconOf(it.actionIcon) || '' })
            }
            if (it.actionLabel2 && it.actionId2) {
              rowActions.push({ label: it.actionLabel2, actionId: it.actionId2, parameters: { _item: it.id },
                iconClass: ojIconOf(it.actionIcon2) || '' })
            }
            if (it.actionLabel3 && it.actionId3) {
              rowActions.push({ label: it.actionLabel3, actionId: it.actionId3, parameters: { _item: it.id },
                iconClass: ojIconOf(it.actionIcon3) || '' })
            }
            return {
              rowClass,
              gridCell: asCards,
              cellClass,
              statusBadgeClass: BADGE_CLASSES[it.statusColor] || 'oj-badge oj-badge-neutral oj-badge-subtle',
              avatar: it.avatar || '',
              icon: it.icon || '',
              title: interp(it.title),
              description: interp(it.description || ''),
              status: interp(it.status || ''),
              statusClass: STATUS_TEXT[it.statusColor] || 'oj-text-color-secondary',
              actions: rowActions,
              hasActions: rowActions.length > 0,
              // nivel del heading del titulo apilado: h4 bajo un grupo con h3 propio
              isH4: m.itemHeadingLevel === 4,
              // cronologia bajo el titulo (p.ej. las entradas de una incidencia)
              lines: (it.lines || []).map(interp),
              hasLines: !!(it.lines && it.lines.length),
              actionLabel: it.actionLabel || '',
              actionId: it.actionId || m.rowActionId || '',
              parameters: { _item: it.id },
              // rowActionId SIN botón propio = la FILA ENTERA es actuable (contrato del
              // renderer web: clic de fila → rowActionId con {_item})
              rowClickable: !!(m.rowActionId && !it.actionLabel),
            }
          }),
        }, container)
        return
      }
      if (t === 'Ledger') {
        atom({
          isLedger: true,
          lines: (m.lines || []).map((line) => ({
            concept: interp(line.concept),
            amountText: line.included ? (line.includedLabel || '') : money(line.amount, m.currency),
            amountClass: (line.amount || 0) < 0 ? 'oj-text-color-success' : '',
          })),
          totalLabel: m.totalLabel || 'Total',
          totalText: money(m.total, m.currency),
        }, container)
        return
      }
      if (t === 'PaymentPicker') {
        atom({
          isPayment: true,
          contextLabel: m.contextLabel || '',
          contextValue: interp(m.contextValue || ''),
          methods: (m.methods || []).map((method) => ({
            label: method.label,
            chroming: method.id === m.selected ? 'callToAction' : 'outlined',
            actionId: m.methodActionId,
            parameters: { _method: method.id },
          })),
          confirmLabel: m.confirmLabel || 'Confirmar',
          confirmActionId: m.actionId,
          confirmParameters: { _method: m.selected },
        }, container)
        return
      }
      if (t === 'Meter') {
        atom({
          isMeter: true,
          label: m.label || '',
          value: m.value || 0,
          max: m.max || 100,
          valueText: (m.unit === '€' ? money(m.value, '€') : String(m.value)) + ' / ' + (m.unit === '€' ? money(m.max, '€') : String(m.max)),
          caption: interp(m.caption || ''),
        }, container)
        return
      }
      if (t === 'TaskProgress') {
        // banner de subtareas N-de-M (checklist de operaciones): completo → panel success y
        // sin botón (contrato del componente); todo precomputado (el CSP de VB no compara)
        const total = m.total || 0
        const done = m.done || 0
        const complete = total > 0 && done >= total
        atom({
          isTaskProgress: true,
          label: interp(m.label || ''),
          value: done,
          max: total,
          valueText: done + ' de ' + total,
          panelClass: complete
            ? 'oj-panel oj-sm-padding-3x oj-sm-margin-2x-bottom oj-bg-success-30'
            : 'oj-panel oj-sm-padding-3x oj-sm-margin-2x-bottom oj-bg-neutral-20',
          actionLabel: !complete && m.actionId ? (m.actionLabel || '') : '',
          actionId: m.actionId || '',
          parameters: {},
        }, container)
        return
      }
      if (t === 'Stat') {
        atom({
          isStat: true,
          label: m.label || '',
          value: String(m.value == null ? '' : m.value) + (m.unit ? ' ' + m.unit : ''),
        }, container)
        return
      }
      if (t === 'Button') {
        const target = container || plain
        const last = target && target.items.length ? target.items[target.items.length - 1] : null
        if (last && last.isButtons) last.buttons.push(buttonOf(m))
        else atom({ isButtons: true, buttons: [buttonOf(m)] }, container)
        return
      }
      for (const child of kidsOf(node)) visit(child, container)
    }
    visit(ctx.tree, null)
    // HOISTING de la isla anidada: un bloque cuyo contenido es la isla (card "Documento")
    // se convierte en bloque isNestedBlock — el markup la pinta a nivel de BLOQUE porque
    // a más profundidad el evaluador CSP de VB deja de resolver los bindings del template
    const hoisted = blocks.map((block) => (
      block.items.some((a) => a.isNested)
        ? { ...block, isNestedBlock: true, items: block.items.filter((a) => !a.isNested) }
        : block
    ))
    const hasDisplay = hoisted.some((b) => b.items.some((a) => !a.isButtons) || b.isNestedBlock)
    return hasDisplay ? hoisted : null
  }

  /** Fusiona el contenido de la isla ANIDADA dentro de los bloques de la isla madre:
   *  el bloque isNestedBlock (la card que solo contenía la isla) pasa a ser una card
   *  normal cuyos items son los átomos de la anidada, MARCADOS fromNested (también sus
   *  botones) para que el dispatcher enrute sus acciones al contexto anidado. Motivo:
   *  leer $application.variables DENTRO de un template anidado no re-liga los contextos
   *  internos en el evaluador CSP de VB — los datos deben fluir por $current. */
  function mergeNestedContent(islandBlocks, nestedBlocks) {
    if (!islandBlocks) return islandBlocks
    const nestedAtoms = (nestedBlocks || []).reduce((out, block) => out.concat(block.items), [])
      .map((a) => {
        const marked = { ...a, fromNested: true }
        if (a.buttons) marked.buttons = a.buttons.map((btn) => ({ ...btn, fromNested: true }))
        return marked
      })
    return islandBlocks.map((block) => (
      block.isNestedBlock
        ? { ...block, isNestedBlock: false, isCard: true, isPlain: false, items: nestedAtoms }
        : block
    ))
  }

  /** Contenido display del HOST (páginas de detalle standalone: /encasa/:id, /checkout/:id,
   *  y los pasos del wizard /checkin/:id): los mismos bloques que una isla, con la PRIMERA
   *  isla del host (p.ej. el documento) fusionada en su hueco (atomos fromNested → despachan
   *  al contexto de la isla). En modo wizard se filtran el título de página, el ProgressSteps
   *  y los botones back/next: el guided process ya aporta rail, título y Continue. */
  /** ¿El card llevaba título? visit() lo mete como primer átomo de texto con la clase del
   *  subencabezado — que es justo lo que distingue una tarjeta de verdad del marco de la página. */
  function cardHasTitle(block) {
    const first = (block.items || [])[0]
    return !!(first && first.isText && String(first.cls || '').indexOf('oj-typography-subheading') >= 0)
  }

  function hostContentOf(ctx, islandBlocks, opts = {}) {
    const blocks = islandContentOf(ctx, opts)
    if (!blocks) return null
    let merged = mergeNestedContent(blocks, islandBlocks || null)
    const title = opts.title || ''
    let titleDropped = false
    let entityDropped = false
    merged = merged
      .map((block) => ({
        ...block,
        items: block.items.filter((atom) => {
          // el título de Page sobra: la banda del header (o el guided process) ya lo pinta
          if (!titleDropped && atom.isText && title && atom.text === title) {
            titleDropped = true
            return false
          }
          // el TOOLBAR de Page tampoco va al contenido: se proyecta a las acciones del
          // header (pageToolbarOf → primary/secondary de la banda) — SALVO el de la ISLA
          // fusionada (fromNested, p.ej. Cancel/Save del editor del documento): ese
          // pertenece a la isla y se pinta en su bloque
          if (atom.fromPageToolbar && !atom.fromNested) return false
          // y el EntityHeader tampoco cuando el header de pantalla lo muestra (título/
          // subtítulo/facts del huésped en la banda, en vez del título genérico)
          if (opts.dropEntityHeader && atom.isEntityHeader && !entityDropped) {
            entityDropped = true
            return false
          }
          if (opts.forWizard) {
            if (atom.isProgress) return false
            if (!opts.keepWizardNav && atom.isButtons && atom.buttons.length
                && atom.buttons.every((b) => b.actionId === 'next' || b.actionId === 'back')) return false
          }
          return true
        }),
      }))
      .filter((block) => block.items.length)
      // el loop del host pinta los bloques dentro de un oj-flex: los bloques-columna de una
      // fila zonada llevan su colClass; el resto ocupa la fila entera (oj-sm-12)
      .map((block) => ({ ...block, blockClass: block.colClass || 'oj-flex-item oj-sm-12' }))
    // Un ÚNICO card SIN TÍTULO que envuelve todo el contenido no es una tarjeta: es el marco de
    // la página, y ése ya lo pinta el contenedor de contenido. Pintarlo además como oj-panel deja
    // una caja dentro de otra, que es como se veía cualquier pantalla con pestañas o con una
    // tabla dentro — mientras que una ficha normal (la rama de formulario) no la tiene. Con
    // título sí es una tarjeta de verdad y se respeta, igual que cuando hay varias.
    if (merged.length === 1 && merged[0].isCard && !cardHasTitle(merged[0])) {
      merged = [{ ...merged[0], isCard: false, isPlain: true }]
    }
    return merged.length ? merged : null
  }

  /** Acción FORWARD del wizard (Continue/Completar): se deriva del PIE real del árbol — el
   *  bloque de botones que acompaña a 'back' (los wizards ricos tienen además acciones de
   *  página como selectPax que NO son el forward; elegir "primera acción no-back" fallaba). */
  function wizardForwardOf(ctx) {
    const blocks = islandContentOf(ctx)
    if (!blocks) return null
    let forward = null
    for (const block of blocks) {
      for (const atomItem of block.items) {
        if (!atomItem.isButtons) continue
        const hasBack = atomItem.buttons.some((b) => b.actionId === 'back')
        const candidate = atomItem.buttons.find((b) => b.actionId !== 'back')
        if (candidate && (hasBack || candidate.actionId === 'next')) {
          forward = { actionId: candidate.actionId, label: candidate.label }
        }
      }
    }
    return forward
  }

  /** El EntityHeader del host (p.ej. el huésped de la Reserva 360) proyectado al HEADER de
   *  pantalla: título = el nombre, subtítulo = subtitle + badges, facts (+métrica) →
   *  contextualInfo del oj-sp-header-general-overview. */
  function entityHeaderOf(ctx) {
    const node = ctx && ctx.tree ? findByType(ctx.tree, 'EntityHeader') : null
    if (!node) return null
    const m = node.metadata
    const state = ctx.state || {}
    const badgeText = (m.badges || []).map((b) => b.label).join(' · ')
    const facts = (m.facts || []).map((f) => ({ label: f.label, value: interpolate(f.value, state) }))
    if (m.metricLabel) facts.push({ label: m.metricLabel, value: interpolate(m.metricValue || '', state) })
    // los colores de Chip de Mateu → status del badge oj-sp
    const BADGE_STATUS = { success: 'success', error: 'danger', warning: 'warning', contrast: 'neutral', normal: 'info' }
    return {
      title: interpolate(m.title, state),
      subtitle: interpolate(m.subtitle || '', state) + (badgeText ? ' · ' + badgeText : ''),
      // el subtítulo SIN los badges concatenados (para templates que pintan el badge aparte)
      subtitlePlain: interpolate(m.subtitle || '', state),
      badges: (m.badges || []).map((b) => ({ label: b.label, status: BADGE_STATUS[b.color] || 'neutral' })),
      facts,
    }
  }

  /** ITEM OVERVIEW nativo (oj-sp-item-overview-page): página de entidad con dos
   *  bloques-columna cuya PRIMERA zona es la ESTRECHA — la anatomía RDS del template
   *  (panel de datos clave a la izquierda + main ancho a la derecha), frente al general
   *  overview (main ancho primero + info estrecha después). El EntityHeader del host se
   *  convierte en el oj-sp-item-overview del slot overview (itemTitle/subtitle/badge +
   *  facts como filas clave en el body); un botón "Volver…" del toolbar pasa a la flecha
   *  goToParent del header de navegación del template y el resto a secondaryActions. */
  function itemOverviewPageOf(entity, blocks, toolbar) {
    if (!entity) return null
    const zoned = (blocks || []).filter((b) => /oj-md-/.test(b.blockClass || ''))
    if ((blocks || []).length !== 2 || zoned.length !== 2) return null
    const col = (b) => parseInt((b.blockClass.match(/oj-md-(\d+)/) || [])[1] || '0', 10)
    if (col(zoned[0]) >= col(zoned[1])) return null // la ancha primero → general overview
    const full = (b) => Object.assign({}, b, { blockClass: 'oj-flex-item oj-sm-12' })
    const back = (toolbar || []).find((b) => /^volver\b/i.test(b.label || ''))
    const badge = (entity.badges || [])[0] || null
    return {
      on: true,
      overview: {
        title: entity.title || '',
        subtitle: entity.subtitlePlain != null ? entity.subtitlePlain : (entity.subtitle || ''),
        badge: badge ? { text: badge.label, status: badge.status, style: 'subtle', position: 'trailing' } : null,
        facts: entity.facts || [],
        blocks: [full(zoned[0])],
      },
      main: { blocks: [full(zoned[1])] },
      back: { show: !!back, actionId: back ? back.actionId : '', label: back ? back.label : '' },
      secondary: (toolbar || []).filter((b) => b !== back)
        .map((b) => ({ id: b.actionId, value: b.actionId, label: b.label })),
    }
  }

  /** El TOOLBAR de la Page del host (para las acciones del header de banda):
   *  [{actionId, label, chroming}]. El de estilo primary va al primaryAction del header. */
  function pageToolbarOf(ctx) {
    if (!ctx || !ctx.tree) return []
    const page = findByType(ctx.tree, 'Page')
    if (!page) return []
    return (page.metadata.toolbar || [])
      .filter((b) => b && b.actionId)
      .map((b) => ({
        actionId: b.actionId,
        label: b.label || b.actionId,
        chroming: b.buttonStyle === 'primary' ? 'callToAction' : 'outlined',
        disabled: !!b.disabled,
      }))
  }

  /**
   * Cuál de los botones del toolbar ocupa el hueco de acción PRIMARIA de la cabecera.
   *
   * `oj-sp-header-general-overview` da UN hueco visible para la primaria y pinta la primera
   * secundaria como botón; el resto va al desbordamiento `···`. Con lo que manda el wire hoy —
   * ningún botón marcado `primary` en la vista de un crud — todo caía en secundarias y la acción
   * de verdad (Edit) quedaba escondida detrás de los puntos suspensivos.
   *
   * Manda el wire cuando dice algo (`buttonStyle: primary`). Si no dice nada, se toma la ÚLTIMA
   * que no sea de vuelta: en los toolbars de Mateu el orden es "salir, …, avanzar" — Cancel→Save,
   * Back to list→Add another→Edit —, así que la última no-vuelta es la que uno vino a hacer.
   * Heurística explícita, a sustituir el día que el wire traiga el rol del botón.
   */
  const BACK_ACTIONS = { back: true, 'back-to-list': true, close: true }
  const isBackButton = (button) => !!button && (
    BACK_ACTIONS[button.actionId] || String(button.actionId || '').indexOf('cancel') === 0)

  /** El botón de VOLVER del toolbar, si lo hay: en RDS eso no es una acción más, es la
   *  afordancia `goToParent` de la cabecera — meterlo entre las secundarias lo esconde en el
   *  desbordamiento justo cuando es lo que más se pulsa. */
  function backToolbarButton(toolbar) {
    return (toolbar || []).find(isBackButton) || null
  }

  function primaryToolbarButton(toolbar) {
    const buttons = toolbar || []
    const declared = buttons.find((b) => b.chroming === 'callToAction')
    if (declared) return declared
    for (let i = buttons.length - 1; i >= 0; i -= 1) {
      if (!isBackButton(buttons[i])) return buttons[i]
    }
    return null
  }

  /**
   * El botón del toolbar que eligió una ACCIÓN SECUNDARIA de un header oj-sp (spSecondaryAction),
   * o null. Los items que les pasamos son { id: actionId, value: actionId, label }, y el header
   * devuelve el item por su id (p.ej. 'walkIn') — o, según la variante, el objeto entero o su
   * label —, así que se resuelve PRIMERO por actionId y sólo después por el rótulo. Buscarlo
   * sólo por label dejaba muertas las secundarias de un listado: el id nunca es el rótulo.
   */
  function secondaryActionOf(detail, toolbar) {
    const d = detail || {}
    const item = d.secondaryItem != null ? d.secondaryItem : (d.item != null ? d.item : d.value)
    const keys = []
    const add = (k) => { if (k != null && k !== '' && typeof k !== 'object') keys.push(String(k)) }
    if (item && typeof item === 'object') {
      add(item.id); add(item.value); add(item.actionId); add(item.key); add(item.label)
    } else {
      add(item)
    }
    add(d.id)
    if (!keys.length) return null
    const buttons = (toolbar || []).filter((b) => b && b.actionId)
    for (const k of keys) {
      const byId = buttons.find((b) => String(b.actionId) === k)
      if (byId) return byId
    }
    for (const k of keys) {
      const byLabel = buttons.find((b) => b.label === k)
      if (byLabel) return byLabel
    }
    return null
  }

  /** Descartar el overlay superior SIN guardar (✕/Esc/backdrop — no emite evento alguno). */
  function dismissOverlay(reg) {
    if (!reg.stack || !reg.stack.length) return reg
    const id = reg.stack[reg.stack.length - 1]
    const contexts = { ...reg.contexts }
    delete contexts[id]
    return { ...reg, contexts, stack: reg.stack.slice(0, -1) }
  }

  /** Acciones suscritas a un evento del bus (@SubscribeTo): p.ej. el listing refresca con
   *  'search' cuando el CloseModal del drawer emite mateu-crud:saved-in-drawer. */
  function eventTriggersOf(ctx, eventName) {
    return ((ctx && ctx.tree && ctx.tree.triggers) || [])
      .filter((t) => t.type === 'OnCustomEvent' && t.eventName === eventName && t.actionId)
      .map((t) => t.actionId)
  }

  /** Trigger @AutoSave/AutoSaveTrigger del host (buscar-al-teclear, autoguardado):
   *  {actionId, debounceMillis} o null. El renderer lo honra re-lanzando la acción
   *  debounced en cada pulsación (raw-value de los inputs del host). */
  function autoSaveOf(ctx) {
    const trigger = ((ctx && ctx.tree && ctx.tree.triggers) || [])
      .find((t) => t.type === 'AutoSave' && t.actionId)
    return trigger
      ? { actionId: trigger.actionId, debounceMillis: trigger.debounceMillis || 400 }
      : null
  }

  /** Proyección del HOST para la superficie de contenido (título, texto, form, acciones). */
  /** La opción de menú de una ruta, a cualquier profundidad. */
  function menuOptionAt(options, route) {
    for (const option of options || []) {
      if ((option.route || option.path) === route) return option
      const found = menuOptionAt(option.submenus || option.submenu, route)
      if (found) return found
    }
    return null
  }

  /** El título que declara el Crud del host, si lo hay. */
  function crudTitleOf(host) {
    const crud = host && host.tree ? findByType(host.tree, 'Crud') : null
    return crud && crud.metadata ? crud.metadata.title : ''
  }

  function summarizeHost(reg, route) {
    const host = reg.contexts[HOST_ID] || {}
    const pageMetadata = (((host.tree || {}).children || [])[0] || {}).metadata || {}
    const menu = (reg.shell && reg.shell.menu) || []
    // a CUALQUIER profundidad: en una shell federada la pantalla que se está viendo cuelga del
    // grupo del pod, dos niveles por debajo, y buscar solo en el primero dejaba el título vacío
    const option = menuOptionAt(menu, route)
    // un listado (pageType collection) también lleva FormFields (columnas) — NO es un form
    const isFormPage = host.pageType !== 'collection' && host.pageType !== 'landing'
    const formMetadata = host.tree && isFormPage ? dynFormMetadataOf(host.tree) : null
    const state = host.state || {}
    const fields = formMetadata ? fieldListOf(host.tree, state, host.data) : []
    const sections = formMetadata ? formSectionsOf(host.tree, state, host.data) : []
    return {
      // la Page de un listado no lleva título: viaja en la metadata del Crud, y si tampoco
      // está, en el rótulo del menú
      title: pageMetadata.title || crudTitleOf(host) || (option && (option.caption || option.label)) || '',
      text: formMetadata ? '' : String(state.message == null ? '' : state.message),
      formMetadata,
      fields,
      sections,
      formValue: formMetadata ? { ...state } : null,
      actions: host.tree ? actionsOf(host.tree) : [],
    }
  }

  /** Helper de RENDER: primer nodo del árbol con metadata.type dado. */
  function findByType(tree, type) {
    let found = null
    const walk = (node) => {
      if (found || !node || typeof node !== 'object') return
      if (node.metadata && node.metadata.type === type) { found = node; return }
      for (const v of Object.values(node)) {
        if (Array.isArray(v)) v.forEach(walk)
        else if (v && typeof v === 'object') walk(v)
      }
    }
    walk(tree)
    return found
  }

  /** Proyección del LISTING (componente Crud): columnas + filas (del eje data) + búsqueda.
   *  null si el contexto no contiene un Crud. Las filas llegan por la acción 'search'
   *  (trigger OnLoad) como fragmento data-only: data.crud.page.content. */
  function listingOf(ctx) {
    const crudNode = ctx && ctx.tree ? findByType(ctx.tree, 'Crud') : null
    if (!crudNode) return null
    const md = crudNode.metadata
    const page = (((ctx.data || {}).crud || {}).page) || {}
    return {
      title: md.title || '',
      subtitle: md.subtitle || '',
      searchable: !!md.searchable,
      pageSize: md.pageSize || 20,
      emptyStateMessage: md.emptyStateMessage || 'No data.',
      columns: (md.columns || []).map((col) => {
        const c = col.metadata || col
        const def = { headerText: c.label || c.id, field: c.id }
        // celda editable → plantilla de editor por tipo (siempre visible, commit por celda:
        // el contrato es update-row + parameters._editedRow; fixtures/real/update-row.json)
        if (c.editable && c.editorType) {
          def.template = c.editorType === 'boolean' ? 'cellEditBoolean'
            : (c.editorType === 'integer' || c.editorType === 'number') ? 'cellEditNumber'
              : 'cellEditText'
        }
        // ACCIONES por fila (ColumnActionGroup): botones que despachan
        // action-on-row-<método> con el id de la fila (Listing.handleActionOnRow)
        if (c.dataType === 'actionGroup') {
          def.template = 'cellRowActions'
          def.headerText = ''
        }
        // ESTADO como badge (@Status): el valor de la celda es {type, message} — la clase
        // JET del badge se precomputa en las filas (statusBadgeRows, CSP sin ternarios)
        if (c.dataType === 'status') {
          def.template = 'cellStatusBadge'
        }
        // UUID abreviado: una columna de texto cuyos valores son UUID se pinta "…-<último bloque>"
        // con el UUID entero en el tooltip. La fila NO cambia: la celda lee un campo aparte,
        // precomputado en uuidCellRows (CSP de VB: la plantilla no puede recortar el texto).
        if (!def.template && uuidColumnIds(page.content || [], md.columns || []).indexOf(c.id) >= 0) {
          def.field = c.id + UUID_CELL_SUFFIX
          def.template = 'cellUuid'
        }
        return def
      }),
      // densidad Redwood de la tabla: el 'grid' compacto es para tablas de TRABAJO —
      // se activa cuando el crud es editable inline (@InlineEditing marca las columnas
      // como editable en el wire); un listado de consulta queda en 'list' (aireado).
      // PRECOMPUTADO (CSP de VB).
      display: (md.columns || []).some((col) => (col.metadata || col).editable) ? 'grid' : 'list',
      // tabla de TRABAJO: el clic de fila NO navega (las celdas se editan in situ)
      editable: (md.columns || []).some((col) => (col.metadata || col).editable),
      // DETALLE de fila (@Details en la fila): el campo que no es columna y se abre al pulsar la
      // fila. Una fila NAVEGABLE (primera columna con actionId 'view') sigue abriendo el registro:
      // el detalle es para los listados de consulta, donde el clic no tenía otro destino.
      detailPath: md.detailPath || null,
      navigable: (md.columns || []).some((col, i) => i === 0 && (col.metadata || col).actionId === 'view'),
      // SELECCIÓN de filas (Listing.rowsSelectionEnabled): casillas en la tabla, y las acciones de la
      // toolbar reciben las filas marcadas en crud_selected_items — el mismo contrato que Vaadin
      // (HttpRequest.getSelectedRows lo lee del componentState). El modo va PRECOMPUTADO (CSP de VB).
      rowsSelectionEnabled: !!md.rowsSelectionEnabled,
      selectionMode: { row: md.rowsSelectionEnabled ? 'multiple' : 'none' },
      // las acciones que no tienen sentido sin selección (Action.rowsSelectedRequired: Delete…)
      // (las acciones declaradas del ServerSide host, no los botones)
      selectionRequired: ((ctx.tree && ctx.tree.actions) || [])
        .filter((a) => a.rowsSelectedRequired).map((a) => a.id),
      rows: uuidCellRows(statusBadgeRows(page.content || [], md.columns || []), md.columns || []),
      total: page.totalElements == null ? null : page.totalElements,
      isEmpty: (page.content || []).length === 0,
      toolbar: (md.toolbar || []).map((b) => ({
        actionId: b.actionId,
        label: b.label,
        chroming: b.buttonStyle === 'primary' ? 'callToAction' : 'outlined',
      })),
      // selector RÁPIDO del listado: filtros de opciones (p.ej. un enum en Filters, como
      // la Vista del listado de reservas) → chips oj-sp-filter-chip junto al smart search;
      // los filtros viajan como FormField select en la metadata (a veces en el mediator,
      // no en el nodo Crud — se busca en todo el árbol)
      filters: filtersOf(ctx),
    }
  }

  /**
   * La selección de la tabla, en una forma que sobrevive a un refresco: el KeySet de oj-table
   * (`detail.value.row` de ojSelectedChanged) → { all, keys, except }. Un "seleccionar todo" es
   * un KeySet de tipo addAll: todas menos las desmarcadas, no una lista de claves.
   */
  function selectionOfKeySet(keySet) {
    if (!keySet) return { all: false, keys: [], except: [] }
    if (typeof keySet.isAddAll === 'function' && keySet.isAddAll()) {
      const deleted = typeof keySet.deletedValues === 'function' ? Array.from(keySet.deletedValues()) : []
      return { all: true, keys: [], except: deleted }
    }
    const values = typeof keySet.values === 'function' ? Array.from(keySet.values()) : []
    return { all: false, keys: values, except: [] }
  }

  /** Las filas marcadas, resueltas contra las filas ACTUALES por su clave (_rowNumber). Lo que se
   *  manda es la fila tal como llegó: el badge precomputado de las columnas @Status no viaja. */
  function selectedRowsOf(rows, selection) {
    if (!selection) return []
    const picked = selection.all
      ? (rows || []).filter((r) => selection.except.indexOf(r._rowNumber) < 0)
      : (rows || []).filter((r) => selection.keys.indexOf(r._rowNumber) >= 0)
    return picked.map((row) => {
      const out = {}
      for (const key of Object.keys(row)) {
        const value = row[key]
        if (key.endsWith(UUID_CELL_SUFFIX)) {
          continue
        }
        if (value && typeof value === 'object' && !Array.isArray(value) && 'badgeClass' in value) {
          const { badgeClass, ...rest } = value
          out[key] = rest
        } else {
          out[key] = value
        }
      }
      return out
    })
  }

  /** El componentState de una acción del host de un listado con selección: lleva las filas
   *  marcadas en crud_selected_items, como Vaadin. Sin listado o sin selección, intacto. */
  function withListingSelection(componentState, listing, rows, selection) {
    if (!listing || !listing.rowsSelectionEnabled) return componentState
    return Object.assign({}, componentState, { crud_selected_items: selectedRowsOf(rows, selection) })
  }

  // filas con columnas @Status: al valor {type, message} se le estampa la clase badge de
  // JET (Redwood, sistema) — el template de celda no puede mapear (CSP sin ternarios)
  const STATUS_BADGE = {
    SUCCESS: 'oj-badge oj-badge-success oj-badge-subtle',
    WARNING: 'oj-badge oj-badge-warning oj-badge-subtle',
    DANGER: 'oj-badge oj-badge-danger oj-badge-subtle',
    INFO: 'oj-badge oj-badge-info oj-badge-subtle',
    NONE: 'oj-badge oj-badge-neutral oj-badge-subtle',
  }
  const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  const UUID_CELL_SUFFIX = '__uuidCell'

  /** "…-<último bloque>" de un UUID canónico; cualquier otro valor, tal cual. */
  function abbreviateUuid(value) {
    return typeof value === 'string' && UUID.test(value)
      ? '…-' + value.substring(value.lastIndexOf('-') + 1)
      : value
  }

  // las columnas de TEXTO (sin plantilla propia, ni editables) con algún valor que es un UUID entero
  function uuidColumnIds(rows, columns) {
    return columns
      .map((col) => col.metadata || col)
      .filter((c) => !c.editable && (!c.dataType || c.dataType === 'string'))
      .filter((c) => rows.some((row) => typeof row[c.id] === 'string' && UUID.test(row[c.id])))
      .map((c) => c.id)
  }

  // filas con columnas de UUID: a cada una se le añade <id>__uuidCell = {text, full}, que es lo que
  // pinta la celda; el valor original de la fila queda intacto (navegación, acciones, selección)
  function uuidCellRows(rows, columns) {
    const ids = uuidColumnIds(rows, columns)
    if (!ids.length) return rows
    return rows.map((row) => {
      const out = { ...row }
      for (const id of ids) {
        const value = row[id] == null ? '' : String(row[id])
        out[id + UUID_CELL_SUFFIX] = { text: abbreviateUuid(value), full: value }
      }
      return out
    })
  }

  function statusBadgeRows(rows, columns) {
    const statusCols = columns
      .map((col) => col.metadata || col)
      .filter((c) => c.dataType === 'status')
      .map((c) => c.id)
    if (!statusCols.length) return rows
    return rows.map((row) => {
      const out = { ...row }
      for (const id of statusCols) {
        const value = out[id]
        if (value && typeof value === 'object') {
          out[id] = { ...value, badgeClass: STATUS_BADGE[value.type] || STATUS_BADGE.NONE }
        }
      }
      return out
    })
  }

  /**
   * TODOS los filtros que declara el listado, cada uno ya resuelto al widget que le toca.
   *
   * Antes sólo salían los de opciones, y sólo el primero: un listado con un booleano, un
   * lookup, un enum y dos fechas mostraba una tira de chips sueltos con los valores del enum
   * —sin decir siquiera de qué campo eran— y los otros cuatro filtros no existían para el
   * usuario. En el renderer Vaadin salen los cinco.
   *
   * El `kind` se PRECOMPUTA aquí porque las plantillas de VB corren bajo CSP y no pueden
   * evaluar expresiones; el orden de resolución es el mismo que el de la barra compartida
   * (rango → multi → opciones → booleano → texto), para que un mismo listado ofrezca lo
   * mismo en los dos renderers.
   */
  function filtersOf(ctx) {
    const found = []
    const walk = (node) => {
      if (!node || typeof node !== 'object') return
      for (const f of ((node.metadata || {}).filters) || []) {
        found.push(filterDescriptorOf(f))
      }
      ;(node.children || []).forEach(walk)
    }
    walk(ctx && ctx.tree)
    return found
  }

  function filterDescriptorOf(f) {
    const options = (f.options || []).map((o) => ({ value: o.value, label: o.label || o.value }))
    // 'bool' lo emite el server Java y 'boolean' el .NET
    const isBool = f.dataType === 'bool' || f.dataType === 'boolean'
      || f.stereotype === 'checkbox' || f.stereotype === 'toggle'
    const isNumeric = ['integer', 'decimal', 'number', 'money'].indexOf(f.dataType) >= 0
    let kind
    if (f.stereotype === 'dateRange' || f.stereotype === 'numberRange') kind = 'range'
    else if (f.stereotype === 'multiSelect') kind = 'multi'
    else if (options.length) kind = 'options'
    else if (isBool) kind = 'bool'
    else kind = 'text'
    return {
      fieldId: f.fieldId,
      label: f.label || f.fieldId,
      kind,
      options,
      // el tipo del <input> de los kinds 'range' y 'text' (una fecha se teclea fatal como texto)
      inputType: f.stereotype === 'dateRange'
        ? (f.dataType === 'dateTime' ? 'datetime-local' : 'date')
        : (f.stereotype === 'numberRange' || isNumeric) ? 'number' : 'text',
      isRange: kind === 'range',
      isMulti: kind === 'multi',
      isOptions: kind === 'options',
      isBool: kind === 'bool',
      isText: kind === 'text',
      fromKey: f.fieldId + '_from',
      toKey: f.fieldId + '_to',
    }
  }

  /**
   * Los filtros como CHIPS: uno por filtro, aplicado o no.
   *
   * Uno por FILTRO y no uno por valor posible, que es lo que se pintaba antes: los ocho
   * estados de un enum salían como ocho chips sueltos, sin decir de qué campo eran, y ocupando
   * la fila entera que debían compartir los otros cuatro filtros. Un chip sin aplicar abre su
   * editor; uno aplicado enseña el valor y se quita por la ✕.
   *
   * `keys` son las claves de estado que hay que borrar para quitarlo — un rango ocupa dos, y
   * quitarlo a medias deja el listado filtrado por algo que ya no se ve.
   */
  function filterChipsOf(filters, values) {
    const v = values || {}
    return (filters || []).map((f) => {
      if (f.isRange) {
        const from = v[f.fromKey]
        const to = v[f.toKey]
        const applied = !isBlank(from) || !isBlank(to)
        const text = !applied ? ''
          : isBlank(from) ? '≤ ' + to
          : isBlank(to) ? '≥ ' + from
          : from + ' → ' + to
        return { fieldId: f.fieldId, label: f.label, text, applied, keys: [f.fromKey, f.toKey] }
      }
      const value = v[f.fieldId]
      const applied = !isBlank(value)
      let text = ''
      if (applied) {
        if (f.isMulti) {
          const selected = Array.isArray(value) ? value : String(value).split(',')
          text = selected.map((s) => labelOfOption(f, s)).join(', ')
        } else if (f.isBool) {
          text = (value === true || value === 'true') ? 'Yes' : 'No'
        } else if (f.isOptions) {
          text = labelOfOption(f, value)
        } else {
          text = String(value)
        }
      }
      return { fieldId: f.fieldId, label: f.label, text, applied, keys: [f.fieldId] }
    })
  }

  /** Los valores de un multi-select, que llegan como lista o como cadena separada por comas. */
  function multiValuesOf(value) {
    if (value == null) return []
    if (Array.isArray(value)) return value.map(String)
    const text = String(value).trim()
    return text === '' ? [] : text.split(',').map((s) => s.trim()).filter((s) => s)
  }

  // ── Filtros DENTRO de la cabecera del buscador ────────────────────────────────────────────
  // Los filtros viajan por la API `smartFilters` de oj-sp-smart-filter-search, no en una fila
  // propia debajo: el componente pinta su cabecera (título + buscador + filtros) y, al pie, la
  // franja de color de Redwood. Una fila de filtros FUERA del componente quedaba al otro lado de
  // la franja, que así parecía una ilustración suelta en mitad de la página.
  //
  // La API cubre todos los kinds de Mateu, cada uno con el editor que el propio componente abre
  // en su popup (un oj-dynamic-form alimentado por `filtersMetadata`):
  //   - `suggestionFilters`: los filtros SIN aplicar — un chip por filtro declarado bajo el
  //     buscador; el componente quita de ahí los que ya están aplicados.
  //   - `value`: los aplicados — chips DENTRO del campo de búsqueda, con su ✕; el texto libre
  //     viaja ahí mismo como chips `keyword`.
  //   - `filtersMetadata`: un JsonMetadataProvider de oj-dynamic, polimórfico por `filter` (el
  //     fieldId): el editor del valor de cada filtro.

  const KEYWORD_FILTER = 'keyword'
  const BOOL_CHOICES = [{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }]

  /** El editor del valor de un filtro, en el vocabulario de oj-dynamic (lo que abre el popup). */
  function smartFilterValueMetadataOf(f) {
    const labelHint = f.label
    if (f.isRange) {
      // gte/lte oj-input-date (string) u oj-input-number (number): con esa forma exacta el
      // componente reconoce el rango y pinta el chip como "desde - hasta" formateado
      const numeric = f.inputType === 'number'
      const componentType = numeric ? 'oj-input-number'
        : f.inputType === 'datetime-local' ? 'oj-input-date-time' : 'oj-input-date'
      const type = numeric ? 'number' : 'string'
      return {
        type: 'object',
        labelHint,
        properties: {
          gte: { type, componentType, labelHint: 'Desde' },
          lte: { type, componentType, labelHint: 'Hasta' },
        },
      }
    }
    const options = (f.options || []).map((o) => ({ value: String(o.value), label: o.label }))
    if (f.isMulti) {
      return { type: 'array', items: { type: 'string' }, componentType: 'oj-checkboxset', labelHint, options }
    }
    if (f.isOptions) return { type: 'string', componentType: 'oj-select-single', labelHint, options }
    if (f.isBool) return { type: 'string', componentType: 'oj-select-single', labelHint, options: BOOL_CHOICES }
    if (f.inputType === 'number') return { type: 'number', componentType: 'oj-input-number', labelHint }
    return { type: 'string', componentType: 'oj-input-text', labelHint }
  }

  /**
   * `filtersMetadata` en crudo (JSON de oj-dynamic): polimórfico por `filter`, un tipo por filtro
   * declarado. El componente lo consulta con getMetadataByDiscriminator('filter', fieldId).
   */
  function smartFiltersMetadataOf(filters) {
    const polymorphicTypes = {}
    for (const f of filters || []) {
      polymorphicTypes[f.fieldId] = { type: 'object', properties: { value: smartFilterValueMetadataOf(f) } }
    }
    return {
      type: 'object',
      properties: { filter: { type: 'string' }, label: { type: 'string' } },
      discriminator: 'filter',
      polymorphicTypes,
    }
  }

  // Los de opciones llevan `filterLabel` (el nombre del campo): el componente pone en `label` la
  // etiqueta de la opción elegida y el chip se lee "Vista Llegadas hoy". Un texto o un rango NO:
  // con filterLabel el componente enseña la etiqueta en vez del valor tecleado.
  const usesFilterLabel = (f) => f.isOptions || f.isMulti || f.isBool

  /** Los chips de `suggestionFilters`: uno por filtro declarado, sin valor. */
  function smartFilterSuggestionsOf(filters) {
    return (filters || []).map((f) => {
      const chip = { filter: f.fieldId, label: f.label }
      if (usesFilterLabel(f)) chip.filterLabel = f.label
      // el formulario del popup saca sus campos de las claves del valor: sin ellas, un rango
      // abre un popup vacío
      if (f.isRange) chip.value = { gte: null, lte: null }
      return chip
    })
  }

  /** El `value` del componente (los chips aplicados) a partir del estado de Mateu. */
  function smartFilterValueOf(filters, values, searchText) {
    const v = values || {}
    const out = []
    const text = searchText == null ? '' : String(searchText).trim()
    if (text) out.push({ filter: KEYWORD_FILTER, label: text, value: text })
    for (const f of filters || []) {
      if (f.isRange) {
        const from = v[f.fromKey]
        const to = v[f.toKey]
        if (isBlank(from) && isBlank(to)) continue
        out.push({ filter: f.fieldId, label: f.label,
          value: { gte: isBlank(from) ? null : from, lte: isBlank(to) ? null : to } })
        continue
      }
      const value = v[f.fieldId]
      if (isBlank(value)) continue
      if (f.isMulti) {
        const selected = multiValuesOf(value)
        if (!selected.length) continue
        out.push({ filter: f.fieldId, label: labelOfOption(f, selected[0]), filterLabel: f.label, value: selected })
      } else if (f.isBool) {
        const bool = value === true || value === 'true' ? 'true' : 'false'
        out.push({ filter: f.fieldId, label: bool === 'true' ? 'Yes' : 'No', filterLabel: f.label, value: bool })
      } else if (f.isOptions) {
        out.push({ filter: f.fieldId, label: labelOfOption(f, value), filterLabel: f.label, value: String(value) })
      } else {
        out.push({ filter: f.fieldId, label: f.label, value })
      }
    }
    return out
  }

  /**
   * Lo inverso: los chips aplicados del componente → el texto buscado (los keywords, en orden) y
   * los valores de filtro que viajan en el componentState. Un chip recién sacado de las
   * sugerencias todavía no tiene valor: no filtra hasta que se elige uno en su popup.
   */
  function filterStateOfSmartFilters(filters, chips) {
    const byId = {}
    for (const f of filters || []) byId[f.fieldId] = f
    const values = {}
    const keywords = []
    for (const chip of chips || []) {
      if (!chip) continue
      if (chip.filter === KEYWORD_FILTER) {
        if (!isBlank(chip.value)) keywords.push(String(chip.value))
        continue
      }
      const f = byId[chip.filter]
      if (!f) continue
      if (f.isRange) {
        const range = chip.value || {}
        if (!isBlank(range.gte)) values[f.fromKey] = range.gte
        if (!isBlank(range.lte)) values[f.toKey] = range.lte
      } else if (f.isMulti) {
        const selected = multiValuesOf(chip.value)
        if (selected.length) values[f.fieldId] = selected
      } else if (!isBlank(chip.value)) {
        values[f.fieldId] = chip.value
      }
    }
    return { searchText: keywords.join(' '), values }
  }

  /**
   * Las sugerencias que tocan para un fetch del componente: fuera las de los filtros ya
   * aplicados (el criterio trae `{op:'$ne', value:{filters}}`) y, si hay texto, las que no lo
   * contienen. Es el contrato del SuggestionFiltersDataProvider de oj-sp, que es REST; aquí las
   * sugerencias son locales.
   */
  function suggestionRowsFor(rows, criterion) {
    const parts = !criterion ? [] : criterion.criteria ? criterion.criteria : [criterion]
    let applied = []
    let text = ''
    for (const c of parts) {
      if (c && c.op === '$ne' && c.value && Array.isArray(c.value.filters)) applied = c.value.filters
      if (c && typeof c.text === 'string') text = c.text.trim().toLowerCase()
    }
    const taken = applied.map((a) => a && a.filter)
    return (rows || [])
      .filter((r) => taken.indexOf(r.filter) < 0)
      .filter((r) => !text || String(r.filterLabel || r.label).toLowerCase().indexOf(text) >= 0)
  }

  /** Un DataProvider (la parte que usa oj-sp-smart-filters) sobre las sugerencias locales. */
  function suggestionFiltersProviderOf(rows) {
    const all = rows || []
    const block = (data, params) => ({
      done: true,
      value: { data, metadata: data.map((r) => ({ key: r.filter })), fetchParameters: params },
    })
    return {
      fetchFirst(params) {
        const data = suggestionRowsFor(all, params && params.filterCriterion)
        return { [Symbol.asyncIterator]: () => ({ next: () => Promise.resolve(block(data, params)) }) }
      },
      fetchByKeys(params) {
        const results = new Map()
        for (const key of (params && params.keys) || []) {
          const row = all.filter((r) => r.filter === key)[0]
          if (row) results.set(key, { data: row, metadata: { key } })
        }
        return Promise.resolve({ fetchParameters: params, results })
      },
      containsKeys(params) {
        const results = new Set()
        for (const key of (params && params.keys) || []) {
          if (all.some((r) => r.filter === key)) results.add(key)
        }
        return Promise.resolve({ containsParameters: params, results })
      },
      getCapability() { return null },
      getTotalSize() { return Promise.resolve(all.length) },
      isEmpty() { return all.length ? 'no' : 'yes' },
      addEventListener() {},
      removeEventListener() {},
      dispatchEvent() { return true },
    }
  }

  // el JsonMetadataProvider de oj-dynamic: lo pone el módulo AMD (el core no depende de JET)
  let metadataProviderFactory = null
  function setMetadataProviderFactory(factory) { metadataProviderFactory = factory }

  /**
   * La configuración ENTERA de `smart-filters` para un listado: sugerencias, aplicados y el
   * editor de cada filtro. Sin filtros declarados, sólo el buscador de texto (como siempre).
   */
  async function smartFiltersOf(filters, values, searchText) {
    const config = { askHint: 'Buscar…', value: smartFilterValueOf(filters, values, searchText) }
    if (!filters || !filters.length) return config
    config.suggestionFilters = suggestionFiltersProviderOf(smartFilterSuggestionsOf(filters))
    if (metadataProviderFactory) {
      config.filtersMetadata = await metadataProviderFactory(smartFiltersMetadataOf(filters))
    }
    return config
  }

  function labelOfOption(filter, value) {
    const hit = (filter.options || []).filter((o) => String(o.value) === String(value))[0]
    return hit ? hit.label : String(value)
  }

  function isBlank(value) {
    if (value == null) return true
    if (Array.isArray(value)) return value.length === 0
    return String(value).trim() === ''
  }

  /** Triggers OnLoad del contexto (p.ej. el listing dispara 'search' al cargar). */
  function onLoadTriggers(ctx) {
    return ((ctx && ctx.tree && ctx.tree.triggers) || [])
      .filter((t) => t.type === 'OnLoad' && t.actionId)
      .map((t) => t.actionId)
  }

  /** Si el contexto es un MEDIADOR (ServerSide → child App), la info para cargar su contenido. */
  function mediatorOf(ctx) {
    const tree = ctx?.tree
    if (tree?.type !== 'ServerSide') return null
    const child = (tree.children || [])[0]
    const md = child?.metadata
    if (md?.type !== 'App') return null
    return {
      // homeConsumedRoute ANTES que rootRoute: en un deep-link a una sub-ruta (el detalle de un
      // proceso) `rootRoute` es la ruta ENTERA que se pidió, mientras que lo consumido por el
      // mediador es su propia ruta (`/workflow/processes`). Mandar la entera como consumedRoute
      // hace que el servidor sirva la vista por defecto del crud: se entraba por el enlace de un
      // proceso y aparecía el listado. En una opción de menú (la raíz del crud) valen lo mismo.
      rootRoute: md.homeConsumedRoute || md.rootRoute || ctx.state?._route || '',
      homeRoute: md.homeRoute ?? '',
      serverSideType: md.homeServerSideType ?? md.serverSideType,
      variant: md.variant,
    }
  }

  const metaOf = (fr) => fr.component?.metadata || {}

  let overlaySeq = 0
  /** Construye un contexto de overlay (drawer/dialog) a partir de un fragmento Add. */
  function buildOverlay(fr) {
    const md = metaOf(fr)
    const id = 'overlay-' + ++overlaySeq
    return {
      id,
      kind: 'drawer',
      tree: fr.component, // el árbol completo — md.content lleva el contenido (patrón Card)
      state: md.initialData || fr.state || {},
      title: md.headerTitle || md.title,
      subtitle: md.subtitle,
      position: md.position || 'end',
      width: md.width,
      size: md.size,
      dirty: false,
    }
  }

  /** Resuelve a qué clave del registro va un target: eco del initiator; ''/null → host. */
  const resolveTarget = (contexts, t) => {
    if (t == null || t === '') return HOST_ID
    if (contexts[t]) return t
    // eco de un id de componente ya registrado (p.ej. SSE que responde al uuid del árbol)
    const byTreeId = Object.keys(contexts).find((k) => contexts[k].tree?.id === t)
    return byTreeId || t
  }

  /**
   * EL REDUCER. reg = { contexts, stack, shell }; devuelve el NUEVO reg + los efectos que VB
   * aplica. Puro e inmutable con structural sharing: solo las entradas tocadas cambian de ref.
   * opts.initiator = contextId de la superficie que lanzó la request (para comandos sin target,
   * como el MarkAsClean del save-in-drawer).
   */
  function reduceContexts(reg, increment, opts = {}) {
    const contexts = { ...reg.contexts }
    const stack = [...reg.stack]
    let shell = reg.shell || null
    const effects = {
      toasts: [],
      banners: increment.banners || [],
      navigate: null,
      urlPush: null,
      download: null,
      runActions: [],
      docTitle: null,
      events: [], // bus @SubscribeTo: [{ name, detail }]
    }

    for (const m of increment.messages || [])
      effects.toasts.push({ text: m.text || m.title, variant: m.variant || 'info' })

    // ── fragmentos → shell | superficies ──────────────────────────────────────
    for (const fr of increment.fragments || []) {
      const md = metaOf(fr)

      // El App del BOOTSTRAP (root ClientSide type App) configura el chrome. Un App de
      // mediador NO pasa por aquí: llega envuelto en un ServerSide (child0) y es contenido.
      if (fr.component?.type === 'ClientSide' && md.type === 'App') {
        shell = {
          title: md.title,
          menu: md.menu || [],
          variant: md.variant,
          serverSideType: md.serverSideType, // para las acciones de cabecera (app-level)
          appContext: md.contextSelectors || [],
          headerActions: md.contextActions || [],
          themeToggle: md.themeToggle,
          // el logo del @App (@Logo, p.ej. /images/riu.svg — relativo al backend)
          logo: md.logo || '',
          // la HOME del app (@HomeRoute) — el boot de la shell la prefiere sobre la
          // primera opción del menú
          homeRoute: md.homeRoute || '',
          // chat de IA (@AI → App.sseUrl): si viene, la shell pinta el botón del chat del agente en la cabecera
          sseUrl: md.sseUrl || '',
          // el FAB de "ask" del shell (@App(askLabel, askIcon)): vacíos = la marca de Ask Oracle
          askLabel: md.askLabel || '',
          askIcon: md.askIcon || '',
          // los widgets de CABECERA (WidgetSupplier / @Widget): viajan como hijos del App con
          // slot "widgets"; los proyecta headerWidgetsOf (widgets.mjs)
          widgets: (fr.component.children || []).filter((child) => child && child.slot === 'widgets'),
        }
        continue
      }

      if (fr.action === 'Add') {
        const ctx = buildOverlay(fr)
        contexts[ctx.id] = ctx
        stack.push(ctx.id)
        continue
      }

      // Replace / ReplaceKeepData / State-only: MISMO camino para form, mediador, isla…
      const id = resolveTarget(contexts, fr.targetComponentId)
      const prev = contexts[id] || { id, kind: id === HOST_ID ? 'host' : 'island', state: {}, data: {} }
      const ss = fr.component?.type === 'ServerSide' ? fr.component : null
      contexts[id] = {
        ...prev,
        kind: prev.kind,
        tree: fr.component || prev.tree, // sin component => State-only: conserva el árbol
        pageType: ss?.pageType ?? (fr.component ? undefined : prev.pageType),
        pageWidth: ss?.pageWidth ?? (fr.component ? undefined : prev.pageWidth),
        state: !fr.component
          ? { ...prev.state, ...(fr.state || {}) } // State-only: MERGE (no borrar la isla)
          : fr.action === 'ReplaceKeepData'
            ? { ...prev.state, ...(fr.state || md.initialData || {}) }
            : (fr.state ?? md.initialData ?? prev.state),
        // data = eje de DATOS calculados por el server (p.ej. las filas del listing, keyed
        // por id de componente: {crud: {page: …}}); un fragmento data-only MERGEA
        data: !fr.component
          ? { ...prev.data, ...(fr.data || {}) }
          : (fr.data ?? {}),
        dirty: false,
      }
    }

    // ── comandos → efectos (algunos mutan el registro) ────────────────────────
    const emit = (data) => {
      if (!data) return
      if (typeof data === 'string') effects.events.push({ name: data, detail: null })
      else if (data.eventName) effects.events.push({ name: data.eventName, detail: data.detail ?? null })
    }
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
        case 'PushStateToHistory':
          effects.urlPush = c.data
          break
        case 'CloseModal': {
          const id = t && contexts[t] ? t : stack[stack.length - 1]
          if (id) {
            delete contexts[id]
            const i = stack.indexOf(id)
            if (i >= 0) stack.splice(i, 1)
          }
          emit(c.data) // eventName del cierre → bus (p.ej. refresco del listado del crud)
          break
        }
        case 'DispatchEvent':
          emit(c.data)
          break
        case 'MarkAsClean': {
          const id = t && contexts[t] ? t : opts.initiator
          if (id && contexts[id]) contexts[id] = { ...contexts[id], dirty: false }
          break
        }
        case 'MarkAsDirty': {
          const id = t && contexts[t] ? t : opts.initiator
          if (id && contexts[id]) contexts[id] = { ...contexts[id], dirty: true }
          break
        }
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

  // ── EDITOR DE FILAS de una lista del formulario (@DetailFormCustomisation position = modal) ──
  //
  // Contrato del wire (fixtures/real/rowedit-*.json, capturados contra el booking de ec-demo1):
  //  - `<campo>_add` / `<campo>_select` (con parameters._rowNumber) contestan DOS fragmentos: el
  //    State del contenedor (con `_show_detail[campo] = true`) y un ServerSide con el formulario
  //    de la fila dirigido a `<campo>-container` (title "New room"/"Edit room", `buttons` al pie:
  //    Save —primary—, "Save and add another" al crear, Cancel —tertiary—; Prev/Next en
  //    `toolbar` al editar, y la posición "1/3" como Text de `header`).
  //  - Save/Create/Cancel/Prev/Next viajan con el estado del CONTENEDOR (el formulario o el
  //    wizard) y la fila en parameters.initiatorState — como Vaadin desde 367
  //    (libs/mateu … common.ts resolveComponentState/isOwnListAction). Mandar la fila como
  //    componentState reconstruía el contenedor desde una habitación: el wizard volvía vacío a
  //    su primer paso.
  //  - El contenedor contesta un State con la lista nueva y `_show_detail[campo] = false`
  //    (cierra); `_create-and-stay` contesta además una fila nueva en `<campo>-container`.
  //  - Prev/Next contestan un State-only a `<campo>-container` (la fila vecina).
  //  - Los lookups de la fila (`search-<campo>`) los resuelve el ServerSide de la FILA con el
  //    estado de la fila: su respuesta es un fragmento data-only a su id.

  /** Las acciones que el editor de una fila manda al contenedor de la lista: `rooms_create`… */
  const LIST_ACTION = /^(.+)_(create-and-stay|create|save|cancel|remove|add|select|selected|prev|next|move-up|move-down)$/

  /** Verbos que llevan la fila del diálogo en parameters.initiatorState. */
  const ROW_EDITOR_VERBS = { create: true, 'create-and-stay': true, save: true, cancel: true, prev: true, next: true }

  /** Verbos que validan la fila antes de salir (los obligatorios vacíos). */
  const ROW_VALIDATING_VERBS = { create: true, 'create-and-stay': true, save: true }

  /** ¿El FormField es una lista cuyo editor de fila se abre en un diálogo? */
  function isModalRowEditor(field) {
    return !!(field && !field.readOnly && !field.inlineEditing
      && (field.columns || []).length && /^modal/.test(field.formPosition || ''))
  }

  /** Las listas con editor modal de un árbol (sin cruzar islas): fieldId → FormField. */
  function modalListsOf(tree) {
    const out = {}
    for (const f of collectFields(tree)) if (isModalRowEditor(f)) out[f.fieldId] = f
    return out
  }

  /**
   * ¿`actionId` es una acción de una lista del contenedor? → { fieldId, verb } o null. La lista
   * se reconoce como en Vaadin (el `<campo>_rowClass` que su estado lleva por cada lista) o, si
   * el estado no lo trae, por un FormField lista con ese id en el árbol del contenedor.
   */
  function listActionOf(state, actionId, tree) {
    const match = actionId ? LIST_ACTION.exec(actionId) : null
    if (!match) return null
    const fieldId = match[1]
    const known = (state && (fieldId + '_rowClass') in state)
      || collectFields(tree || {}).some((f) => f.fieldId === fieldId && (f.dataType === 'array' || (f.columns || []).length))
    return known ? { fieldId, verb: match[2] } : null
  }

  /** El contexto de transporte del contenedor: las acciones de sus listas van a SU ServerSide
   *  (el formulario, el wizard), no al mediador por el que se cargó la pantalla — el crud
   *  orquestador no sabe qué es `rooms_add` ("component() … DtoSupplier"). */
  function holderTransportOf(holder) {
    const outbound = holder.outbound || {}
    const tree = holder.tree || {}
    return {
      ...holder,
      outbound: {
        ...outbound,
        serverSideType: tree.type === 'ServerSide' && tree.serverSideType ? tree.serverSideType : outbound.serverSideType,
      },
    }
  }

  /** El _rowNumber REAL (número o uuid) de la fila cuyo texto es `key` — el DOM sólo da texto,
   *  y el servidor compara con equals: "0" no es 0. */
  function rowOf(rows, key) {
    return (rows || []).find((row) => row && String(row._rowNumber) === String(key)) || null
  }

  /**
   * La request de una acción de lista: componentState = el estado del CONTENEDOR (+ su borrador),
   * y la fila del diálogo (+ su borrador) en parameters.initiatorState para los verbos del
   * editor. `_select` lleva el _rowNumber real; `_remove` de una fila, la fila en
   * `<campo>_selected_items` (el servidor quita las filas iguales). null si no es de una lista.
   */
  function listActionRequestOf(reg, actionId, opts = {}) {
    const holderId = opts.holderId || HOST_ID
    const holder = reg && reg.contexts && reg.contexts[holderId]
    if (!holder) return null
    const componentState = { ...(holder.state || {}), ...(opts.hostDraft || {}) }
    const hit = listActionOf(componentState, actionId, holder.tree)
    if (!hit) return null
    const { fieldId, verb } = hit
    const parameters = { ...(opts.parameters || {}) }
    const rowCtx = reg.contexts[fieldId + '-container']
    if (ROW_EDITOR_VERBS[verb] && rowCtx) {
      parameters.initiatorState = { ...(rowCtx.state || {}), ...(opts.rowDraft || {}) }
    }
    if ((verb === 'select' || verb === 'remove') && parameters._rowNumber != null) {
      const row = rowOf(componentState[fieldId], parameters._rowNumber)
      if (verb === 'select') {
        if (row) parameters._rowNumber = row._rowNumber
      } else {
        delete parameters._rowNumber
        componentState[fieldId + '_selected_items'] = row ? [row] : []
      }
    }
    return { fieldId, verb, componentState, parameters, ctx: holderTransportOf(holder) }
  }

  const ROW_CHROMING = { primary: 'callToAction', tertiary: 'borderless' }

  function rowButtonOf(b) {
    return {
      actionId: b.actionId,
      label: b.label || b.actionId,
      chroming: ROW_CHROMING[b.buttonStyle] || 'outlined',
    }
  }

  /** Opciones de un select/lookup: las estáticas del campo o las que trajo su búsqueda. */
  function optionsOf(field, data) {
    const found = data && data[field.fieldId] && data[field.fieldId].content
    const raw = (field.options && field.options.length) ? field.options : (found || [])
    return raw.map((o) => ({ value: o.value, label: o.label == null ? String(o.value) : o.label }))
  }

  /** El valor de un campo tal como lo edita su widget: un lookup puede llegar como {value,label}. */
  function plainValueOf(value) {
    if (value && typeof value === 'object' && !Array.isArray(value) && 'value' in value) return value.value
    return value
  }

  const NUMERIC_TYPES = { integer: true, int: true, long: true, number: true, double: true, float: true, money: true }

  /**
   * Los campos del formulario de la fila, cada uno resuelto al widget que le toca (flags
   * PRECOMPUTADOS: el CSP de VB no evalúa expresiones) con su valor, sus opciones y sus
   * errores (messagesCustom de JET). Las listas anidadas (p.ej. las edades de los niños) no
   * se editan aquí.
   */
  function rowFieldsOf(ctx, values, errors) {
    if (!ctx || !ctx.tree) return []
    const state = { ...(ctx.state || {}), ...(values || {}) }
    const seen = {}
    const out = []
    for (const f of collectFields(ctx.tree)) {
      if (!f.dataType || seen[f.fieldId]) continue
      seen[f.fieldId] = true
      if (f.dataType === 'array' || (f.columns || []).length) continue
      const widget = fieldWidgetOf(f, ctx.data, { lookups: true })
      const raw = plainValueOf(state[f.fieldId])
      const error = errors && errors[f.fieldId]
      out.push({
        ...widget,
        value: widget.isBoolean ? !!raw : (raw == null || raw === '' ? null : (widget.isNumber ? Number(raw) : raw)),
        messagesCustom: error ? [{ severity: 'error', summary: error, detail: '' }] : [],
      })
    }
    return out
  }

  /**
   * El WIDGET que le toca a un FormField (flags PRECOMPUTADOS: el CSP de VB no evalúa
   * expresiones), compartido por el editor de fila y los formularios de página/drawer/isla:
   * select si trae opciones (estáticas, o las que trajo su búsqueda) — o, con lookups, si es un
   * lookup remoto —, fecha, fecha-hora, número, booleano, área de texto o texto.
   */
  function fieldWidgetOf(f, data, { lookups }) {
    const lookupActionId = (f.remoteCoordinates && f.remoteCoordinates.action) || ''
    const options = optionsOf(f, data)
    const isSelect = (lookups && !!lookupActionId) || options.length > 0
    const isBoolean = !isSelect && (f.dataType === 'bool' || f.dataType === 'boolean')
    const isDate = !isSelect && f.dataType === 'date'
    const isDateTime = !isSelect && f.dataType === 'dateTime'
    const isNumber = !isSelect && !!NUMERIC_TYPES[f.dataType]
    const isTextArea = !isSelect && f.stereotype === 'textarea'
    return {
      fieldId: f.fieldId,
      label: f.label || f.fieldId,
      required: !!f.required,
      readonly: !!f.readOnly,
      isSelect,
      isLookup: lookups && !!lookupActionId,
      lookupActionId: lookups ? lookupActionId : '',
      options: isSelect ? options : [],
      isBoolean,
      isDate,
      isDateTime,
      isNumber,
      isTextArea,
      isText: !isSelect && !isBoolean && !isDate && !isDateTime && !isNumber && !isTextArea,
    }
  }

  /** Los obligatorios vacíos de la fila → { fieldId: mensaje }; {} si está bien. */
  function validateRow(ctx, values) {
    const errors = {}
    for (const f of rowFieldsOf(ctx, values)) {
      if (f.required && !f.readonly && !f.isBoolean && isBlank(f.value)) errors[f.fieldId] = 'Required'
    }
    return errors
  }

  /** Los lookups de la fila que aún no tienen opciones → [{ fieldId, actionId }]. */
  function pendingLookupsOf(ctx) {
    if (!ctx || !ctx.tree) return []
    return rowFieldsOf(ctx)
      .filter((f) => f.isLookup && !(ctx.data && ctx.data[f.fieldId]))
      .map((f) => ({ fieldId: f.fieldId, actionId: f.lookupActionId }))
  }

  /**
   * La request de la búsqueda de un lookup de la fila: la resuelve el ServerSide de la FILA
   * (su serverSideType, su id como initiator) con el estado de la fila; la ruta y el backend
   * son los del contenedor.
   */
  function lookupRequestOf(reg, rowCtxId, fieldId, opts = {}) {
    const row = reg && reg.contexts && reg.contexts[rowCtxId]
    if (!row || !row.tree) return null
    const field = collectFields(row.tree).find((f) => f.fieldId === fieldId)
    const actionId = field && field.remoteCoordinates && field.remoteCoordinates.action
    if (!actionId) return null
    const holder = reg.contexts[opts.holderId || HOST_ID] || {}
    return {
      actionId,
      componentState: { ...(row.state || {}), ...(opts.rowDraft || {}) },
      parameters: { searchText: opts.searchText || '', fieldId, size: 200, page: 0 },
      ctx: {
        id: row.id,
        tree: row.tree,
        state: row.state,
        outbound: { ...(holder.outbound || {}), serverSideType: row.tree.serverSideType },
      },
    }
  }

  /**
   * Proyección del EDITOR DE FILA abierto (el oj-dialog): null si ninguna lista modal del
   * contenedor tiene su detalle abierto (`_show_detail[campo]`) con el formulario ya recibido
   * en `<campo>-container`.
   */
  function rowEditorOf(reg, opts = {}) {
    const holder = reg && reg.contexts && reg.contexts[opts.holderId || HOST_ID]
    if (!holder || !holder.tree) return null
    const state = holder.state || {}
    const show = state._show_detail || {}
    const lists = modalListsOf(holder.tree)
    for (const fieldId of Object.keys(lists)) {
      if (!(show[fieldId] === true || state[fieldId + '_show_detail'] === true)) continue
      const id = fieldId + '-container'
      const ctx = reg.contexts[id]
      if (!ctx || !ctx.tree) continue
      const form = findByType(ctx.tree, 'Form')
      const md = (form && form.metadata) || {}
      const rowState = { ...(ctx.state || {}), ...(opts.rowDraft || {}) }
      const header = (md.header || [])
        .map((h) => (h && h.metadata && h.metadata.type === 'Text') ? interpolate(h.metadata.text, rowState) : '')
        .filter(Boolean)
      const buttons = (md.buttons || []).filter((b) => b && b.actionId).map(rowButtonOf)
      return {
        id,
        fieldId,
        formPosition: lists[fieldId].formPosition,
        title: interpolate(md.title || lists[fieldId].label || '', rowState),
        subtitle: header.join(' · '),
        toolbar: (md.toolbar || []).filter((b) => b && b.actionId).map(rowButtonOf),
        // pie Redwood: la primaria a la DERECHA del todo — el wire la manda primera
        buttons: buttons.slice().reverse(),
        fields: rowFieldsOf(ctx, opts.rowDraft, opts.errors),
      }
    }
    return null
  }


  // Resiliencia del transporte — el mismo contrato que los renderers web (libs/mateu:
  // requestPolicy + retryPolicy + connectivity + pendingActions), reescrito para ESTE core,
  // que no comparte nada con aquéllos: aquí el transporte es `fetch` pelado, no axios.
  //
  // Las diferencias que obliga fetch, y que son la razón de que esto no sea un copy-paste:
  //   - fetch NO tiene timeout. Sin AbortController una petición puede quedarse colgada para
  //     siempre; el usuario ve la pantalla congelada sin error ni fin.
  //   - fetch NO rechaza ante un 4xx/5xx: resuelve con `res.ok === false`. El estado hay que
  //     leerlo y adjuntarlo al error a mano, o abajo no hay forma de distinguir un 500 de un
  //     cable desenchufado.
  //   - un fallo de red es un `TypeError` genérico ("Failed to fetch"), y un abort es un
  //     `DOMException` con `name === 'AbortError'`. Ninguno trae código propio.
  //
  // Todo lo de aquí es puro salvo `fetchWithPolicy`, para que test.mjs lo pueda ejercitar en
  // Node sin navegador ni backend.

  // ── clasificación ────────────────────────────────────────────────────────────────────────

  /** Ceiling por defecto de una petición, en ms. Lo pisa `@Action(timeoutMillis = …)`. */
  const DEFAULT_TIMEOUT_MS = 60000

  const MESSAGES = {
    offline: () => 'Sin conexión. Tus cambios no se han enviado — revisa la red e inténtalo de nuevo.',
    timeout: () => 'El servidor tarda demasiado en responder. Puede que tus cambios no se hayan guardado.',
    server: (s) => `El servidor no ha podido completar la petición${s ? ` (error ${s})` : ''}. Inténtalo de nuevo.`,
    unauthorized: () => 'Tu sesión ya no es válida. Vuelve a iniciar sesión.',
    notFound: () => 'Esto ya no está disponible. Puede que se haya movido o borrado.',
    client: (s) => `La petición ha sido rechazada${s ? ` (error ${s})` : ''}.`,
    cancelled: () => '',
    unknown: () => 'Algo ha ido mal. Inténtalo de nuevo.',
  }

  /** Tipos que merece la pena reintentar: o no llegó, o el servidor tuvo un mal momento. */
  const RETRYABLE = new Set(['offline', 'timeout', 'server'])

  /**
   * Traduce un fallo de transporte a `{ kind, message, retryable, status }`.
   *
   * `online` se inyecta para poder testearlo y porque el llamante tiene una señal mejor que
   * `navigator.onLine` (que miente en portales cautivos).
   */
  function classifyRequestFailure(error, options = {}) {
    const err = error || {}
    const status = err.status != null ? err.status : (err.response && err.response.status)
    const name = err.name || ''
    const message = err.message || ''
    const online = options.online !== undefined
      ? options.online
      : (typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean' ? navigator.onLine : true)

    const failure = (kind) => ({
      kind,
      message: MESSAGES[kind](status),
      retryable: RETRYABLE.has(kind),
      status,
    })

    // Un abort es una decisión NUESTRA (navegación, timeout propio): nunca es noticia para el
    // usuario… salvo cuando lo disparó el timeout, que sí lo es. Los distingue la marca.
    if (name === 'AbortError' || err.code === 'ERR_CANCELED') {
      return failure(err.__mateuTimedOut ? 'timeout' : 'cancelled')
    }
    if (err.__mateuTimedOut || /timeout/i.test(message)) return failure('timeout')

    if (status == null) {
      // Sin respuesta: o sabemos que no hay red, o la petición murió antes de llegar.
      if (!online) return failure('offline')
      // fetch resuelve un fallo de red como un TypeError sin más señas.
      if (name === 'TypeError' || /failed to fetch|networkerror|load failed/i.test(message)) {
        return failure('offline')
      }
      return failure('unknown')
    }
    if (status === 401 || status === 403) return failure('unauthorized')
    if (status === 404 || status === 410) return failure('notFound')
    if (status === 408 || status === 429) return failure('timeout')
    if (status >= 500) return failure('server')
    if (status >= 400) return failure('client')
    return failure('unknown')
  }

  // ── política de reintento ────────────────────────────────────────────────────────────────

  /** Ids de acción del framework que sólo LEEN. '' es la carga de ruta. */
  const ALWAYS_SAFE = new Set(['', '__load__', 'search', '_globalsearch', '_notifications-list'])
  const SAFE_PREFIXES = ['_appcontext-search-', 'search-']

  /**
   * Si repetir `actionId` no puede aplicar el mismo cambio dos veces.
   *
   * Por defecto NO: cuando una petición expira no sabemos si el servidor la procesó, así que
   * repetir un `create` arriesga un duplicado silencioso. `declared` es el opt-in del wire
   * (`@Action(idempotent = true)`), que nunca saca a una lectura conocida de la lista.
   */
  function isIdempotentAction(actionId, declared) {
    if (declared === true) return true
    // Un id AUSENTE es trabajo desconocido; uno VACÍO es la carga de ruta. No son lo mismo.
    if (actionId === undefined || actionId === null) return false
    if (ALWAYS_SAFE.has(actionId)) return true
    return SAFE_PREFIXES.some((p) => actionId.startsWith(p))
  }

  /** Intentos ADEMÁS del primero. */
  const MAX_RETRIES = 2

  /** Espera antes del reintento `attempt` (1-based): exponencial con ±25% de jitter. */
  function retryDelayMs(attempt, random = Math.random) {
    const base = 300 * Math.pow(3, Math.max(0, attempt - 1))
    return Math.round(base * (0.75 + random() * 0.5))
  }

  /**
   * La decisión. `offline` queda deliberadamente fuera: reenviar a los 300 ms con la red caída
   * sólo quema el presupuesto de intentos — de la reconexión se encarga `connectivity`.
   */
  function shouldRetry(failure, attempt, options = {}) {
    if (!options.idempotent) return false
    if (attempt > MAX_RETRIES) return false
    if (!failure.retryable) return false
    return failure.kind === 'timeout' || failure.kind === 'server'
  }

  // ── conectividad ─────────────────────────────────────────────────────────────────────────

  /**
   * Una respuesta honesta a "¿llegamos?".
   *
   * `navigator.onLine` informa del enlace, no del camino: dice true en un portal cautivo y con
   * una VPN que perdió la ruta. Sirve como negativo duro; el positivo lo da nuestro propio
   * tráfico volviendo.
   */
  const connectivity = {
    _linkUp: true,
    _reachable: undefined,
    _listeners: new Set(),
    _started: false,

    start() {
      if (this._started || typeof window === 'undefined') return
      this._started = true
      this._linkUp = typeof navigator !== 'undefined' && typeof navigator.onLine === 'boolean'
        ? navigator.onLine : true
      window.addEventListener('online', () => {
        this._linkUp = true
        this._reachable = undefined   // el enlace vuelve, el camino está por demostrar
        this._emit()
      })
      window.addEventListener('offline', () => { this._linkUp = false; this._emit() })
    },

    isOnline() {
      if (!this._linkUp) return false
      return this._reachable !== false
    },

    noteReachable() {
      const was = this.isOnline()
      this._reachable = true
      if (!was) this._emit()
    },

    noteUnreachable() {
      const was = this.isOnline()
      this._reachable = false
      if (was) this._emit()
    },

    subscribe(listener) {
      this._listeners.add(listener)
      return () => this._listeners.delete(listener)
    },

    reset() { this._linkUp = true; this._reachable = undefined },

    _emit() {
      const online = this.isOnline()
      this._listeners.forEach((l) => l(online))
    },
  }

  // ── guard de doble envío ─────────────────────────────────────────────────────────────────

  /** Válvula de seguridad: pasado este tiempo una entrada se da por muerta y se libera. */
  const STALE_MS = 120000

  const pendingActions = {
    _started: new Map(),

    key(componentId, actionId) { return `${componentId || '_'}::${actionId}` },

    /** Reclama el hueco. false = ya hay una idéntica en vuelo y ésta es un duplicado. */
    begin(key, now = Date.now()) {
      const startedAt = this._started.get(key)
      if (startedAt !== undefined && now - startedAt < STALE_MS) return false
      this._started.set(key, now)
      return true
    },

    end(key) { this._started.delete(key) },

    isPending(key, now = Date.now()) {
      const startedAt = this._started.get(key)
      return startedAt !== undefined && now - startedAt < STALE_MS
    },

    reset() { this._started.clear() },
  }

  // ── ganchos de ciclo de vida ─────────────────────────────────────────────────────────────

  /**
   * Cómo la app (VB) se entera de que hay trabajo en vuelo, sin que el core sepa nada de VB.
   * `onStart` recibe {actionId}; `onSettle` recibe {actionId, failure} (failure null si fue bien).
   */
  const transportHooks = { onStart: null, onSettle: null }

  function setTransportHooks(hooks) {
    transportHooks.onStart = (hooks && hooks.onStart) || null
    transportHooks.onSettle = (hooks && hooks.onSettle) || null
  }

  const notify = (which, payload) => {
    const fn = transportHooks[which]
    if (!fn) return
    try { fn(payload) } catch (e) { /* la UI no puede tumbar el transporte */ }
  }

  // ── fetch con política ───────────────────────────────────────────────────────────────────

  const delay = (ms) => new Promise((r) => setTimeout(r, ms))

  /**
   * Un envío: aplica el timeout (fetch no trae ninguno) y convierte un 4xx/5xx en un error que
   * LLEVA el status, porque fetch resuelve esos como éxito y abajo no habría forma de saberlo.
   */
  async function sendOnce(url, init, timeoutMillis) {
    // Negativo = SIN ceiling, para un stream que dura lo que dure (LongTask). Distinto de 0 /
    // ausente, que significa "usa el de por defecto".
    const noCeiling = timeoutMillis != null && timeoutMillis < 0
    const ms = timeoutMillis && timeoutMillis > 0 ? timeoutMillis : DEFAULT_TIMEOUT_MS
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null
    let timedOut = false
    const timer = noCeiling ? null : setTimeout(() => {
      timedOut = true
      if (controller) controller.abort()
    }, ms)
    try {
      const res = await fetch(url, controller ? { ...init, signal: controller.signal } : init)
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        const error = new Error(`Mateu → HTTP ${res.status}${text ? `: ${text}` : ''}`)
        error.status = res.status
        throw error
      }
      return res
    } catch (e) {
      // Un abort disparado por NUESTRO timeout debe leerse como timeout, no como cancelación:
      // el usuario sí tiene que enterarse.
      if (timedOut && e) e.__mateuTimedOut = true
      throw e
    } finally {
      if (timer) clearTimeout(timer)
    }
  }

  /**
   * La cabecera con el token, si el bootstrap dejó uno.
   *
   * La página de bootstrap autentica contra Keycloak y guarda el token en
   * `localStorage.__mateu_auth_token`, refrescándolo al caducar. Hasta que esto existió, NADA lo
   * leía: el bridge hacía cada llamada sin cabecera, el gateway respondía 401 y el clasificador de
   * abajo lo traducía a "Tu sesión ya no es válida" — un mensaje cierto sobre el 401 y engañoso
   * sobre la causa, porque la sesión estaba perfectamente viva y la petición sencillamente no la
   * presentaba. La consola cargaba, se quedaba sin un solo menú, y el panel de chat tampoco
   * respondía.
   *
   * Va aquí y no en los tres sitios que construyen cabeceras en transport.mjs, por lo mismo que en
   * el otro renderer es un interceptor de axios y no un parámetro de cada llamada: un punto único
   * que un cuarto sitio no puede olvidar.
   *
   * `localStorage` no existe en Node, donde corre test.mjs, así que se consulta con guarda; y un
   * `Authorization` que el llamante ya haya puesto manda sobre este, que es lo que permite probar
   * el camino sin tocar el almacenamiento.
   */
  function authHeaders(init) {
    const already = init && init.headers &&
      (init.headers.Authorization || init.headers.authorization)
    if (already) return null
    let token = null
    try {
      token = typeof localStorage !== 'undefined' ? localStorage.getItem('__mateu_auth_token') : null
    } catch (e) {
      // Un navegador con el almacenamiento bloqueado. Sin token se sigue: el backend dirá que no,
      // que es mejor que no llamar.
      token = null
    }
    return token ? { Authorization: 'Bearer ' + token } : null
  }

  /**
   * La cabecera con el token para una llamada que NO pasa por fetchWithPolicy: el stream del chat
   * del agente (SSE, un fetch propio que lee el cuerpo por trozos). Sin ella el agente contesta
   * 401 y el panel enseña "Servidor respondió 401". {} si no hay token.
   */
  function authHeadersOf() {
    return authHeaders(null) || {}
  }

  /**
   * Pide a la página que reautentique tras un 401, con el mismo contrato que el renderer de Vaadin
   * (sessionGuard.ts): el evento cancelable 'mateu-session-expired' en document, con
   * {retry, giveUp} en el detail. El bootstrap de Mateu lo atiende — fuerza el refresco del token
   * de Keycloak y llama a retry, o manda al login si la sesión ya no existe. Resuelve true si hay
   * que reenviar la petición; false si nadie lo reclamó o la página desistió.
   */
  function askForReauthentication() {
    return new Promise((resolve) => {
      if (typeof document === 'undefined' || typeof CustomEvent === 'undefined') {
        resolve(false)
        return
      }
      let settled = false
      const settle = (value) => {
        if (settled) return
        settled = true
        resolve(value)
      }
      const detail = { retry: () => settle(true), giveUp: () => settle(false) }
      const claimed = !document.dispatchEvent(
        new CustomEvent('mateu-session-expired', { detail, cancelable: true, bubbles: false }))
      if (!claimed) settle(false)
    })
  }

  /**
   * El punto único por el que pasa TODO el tráfico de este renderer.
   *
   * Y por eso es donde se adjunta el token: es el cliente de Mateu de este renderer, igual que
   * AxiosMateuApiClient lo es del otro.
   *
   * Reenvía mientras el fallo sea transitorio Y la acción sea segura de repetir; cada intento
   * resuelto enseña al rastreador de conectividad si el backend responde — una respuesta
   * demuestra el camino mejor que cualquier bandera del navegador. Los N intentos son UN solo
   * resultado de cara a la UI: un estado de carga, un mensaje.
   */
  async function fetchWithPolicy(url, init, options = {}) {
    // El token se lee en CADA envío, no una vez: tras un 401 el bootstrap deja uno nuevo en
    // localStorage y el reintento tiene que llevar ese, no el caducado.
    const withAuth = () => {
      const auth = authHeaders(init)
      return auth ? { ...(init || {}), headers: { ...((init && init.headers) || {}), ...auth } } : init
    }
    const actionId = options.actionId
    const idempotent = isIdempotentAction(actionId, options.idempotent)
    // `quiet`: una petición de FONDO (el refresco de un widget de cabecera cada pocos segundos) no
    // avisa a los ganchos — la barra de ocupado y la banda de error hablan de lo que hace el usuario
    const notifyUnlessQuiet = (hook, payload) => { if (!options.quiet) notify(hook, payload) }
    notifyUnlessQuiet('onStart', { actionId })
    let attempt = 0
    let reauthenticated = false
    for (;;) {
      try {
        const res = await sendOnce(url, withAuth(), options.timeoutMillis)
        connectivity.noteReachable()
        notifyUnlessQuiet('onSettle', { actionId, failure: null })
        return res
      } catch (error) {
        // Un 401 es, casi siempre, el token caducado entre dos refrescos. Se pide a la página que
        // reautentique y se reenvía UNA vez: el servidor rechazó la petición sin ejecutarla, así
        // que repetirla es seguro también para una escritura. Sin nadie que reautentique, o si el
        // reintento vuelve a dar 401, falla como siempre.
        if (error && error.status === 401 && !reauthenticated) {
          reauthenticated = true
          if (await askForReauthentication()) continue
        }
        const failure = classifyRequestFailure(error, { online: connectivity.isOnline() })
        if (failure.kind === 'offline') connectivity.noteUnreachable()
        attempt++
        if (!shouldRetry(failure, attempt, { idempotent })) {
          // El error viaja CLASIFICADO: la UI enseña `failure.message` en vez de "Failed to
          // fetch", y decide si ofrecer reintentar.
          error.failure = failure
          notifyUnlessQuiet('onSettle', { actionId, failure })
          throw error
        }
        await delay(retryDelayMs(attempt))
      }
    }
  }


  // Accesibilidad del renderer VB — la parte que NO traen los componentes oj-*.
  //
  // Medido antes de escribir nada (axe-core sobre la app servida): la composición de oj-sp-*
  // sale prácticamente limpia, igual que pasaba con Vaadin, porque esos componentes traen su
  // propia accesibilidad. Los huecos reales son los de una SPA, que axe no puede evaluar:
  // al cambiar de ruta no cambia la página, así que un lector de pantalla no tiene NADA que
  // anunciar y el foco se queda donde estaba — normalmente en el enlace del menú que se acaba
  // de pulsar, obligando a tabular por toda la shell para llegar al contenido pedido.
  //
  // Vive en poc/ (fuente única) para que make-amd.mjs lo empaquete en el bridge y la app lo
  // use desde las chains, igual que el resto del core.

  // ── región viva ──────────────────────────────────────────────────────────────────────────

  const REGION_STYLE = [
    'position:absolute', 'width:1px', 'height:1px', 'margin:-1px', 'padding:0',
    'overflow:hidden',
    // clip, NO display:none ni visibility:hidden: esas dos sacan el nodo del árbol de
    // accesibilidad, que es justo lo contrario de lo que hace falta aquí.
    'clip:rect(0 0 0 0)', 'clip-path:inset(50%)', 'white-space:nowrap', 'border:0',
  ].join(';')

  const regions = {}

  function regionFor(politeness) {
    if (typeof document === 'undefined' || !document.body) return null
    const existing = regions[politeness]
    if (existing && existing.isConnected) return existing
    const region = document.createElement('div')
    region.setAttribute('aria-live', politeness)
    region.setAttribute('aria-atomic', 'true')
    region.setAttribute('role', politeness === 'assertive' ? 'alert' : 'status')
    region.setAttribute('data-mateu-live-region', politeness)
    region.style.cssText = REGION_STYLE
    document.body.appendChild(region)
    regions[politeness] = region
    return region
  }

  /**
   * Crea las regiones por adelantado.
   *
   * No es opcional: una región creada y rellenada en el mismo tick a menudo NO se anuncia,
   * porque la tecnología asistiva vigila mutaciones de regiones que ya conocía.
   */
  function installAnnouncer() {
    if (typeof document === 'undefined') return
    if (!document.body) {
      document.addEventListener('DOMContentLoaded', installAnnouncer, { once: true })
      return
    }
    regionFor('polite')
    regionFor('assertive')
  }

  /**
   * Dice `message` a la tecnología asistiva. No pinta nada.
   *
   * `assertive` interrumpe y es para lo que el usuario no puede perderse (un guardado que
   * falló); `polite` espera una pausa y es para lo rutinario (dónde acaba de aterrizar). Usar
   * assertive para todo hace la app inusable, así que es opt-in.
   */
  function announce(message, options = {}) {
    const text = (message == null ? '' : String(message)).trim()
    if (!text) return
    const region = regionFor(options.politeness || 'polite')
    if (!region) return
    if (region.textContent === text) {
      // Repetir el mismo mensaje es un caso real (dos guardados fallidos seguidos) y una
      // región cuyo texto no cambia no anuncia nada: se limpia y se repone.
      region.textContent = ''
      setTimeout(() => { region.textContent = text }, 60)
      return
    }
    region.textContent = text
  }

  // ── foco tras navegar ────────────────────────────────────────────────────────────────────

  /**
   * Lleva el foco al contenido recién cargado.
   *
   * Se busca el primer encabezado del área de contenido; si no hay, el propio contenedor, al
   * que se le da `tabindex="-1"` para que pueda recibir foco por programa sin añadir una
   * parada de tabulación propia.
   */
  function focusContent() {
    if (typeof document === 'undefined') return false
    const root = document.querySelector('#vbRouterContent') || document.querySelector('.oj-web-applayout-content-nopad')
    if (!root) return false

    // Candidatos en orden de preferencia. El encabezado tiene que llevar TEXTO: la shell pinta
    // un <h1> vacío hasta que llega el título, y un encabezado vacío no es focusable (ni sería
    // útil anunciarlo) — el intento fallaba en silencio y el foco se quedaba donde estaba.
    const headings = [...root.querySelectorAll('h1, h2, [role="heading"]')]
      .filter((h) => (h.textContent || '').trim().length > 0)
    const candidates = [...headings, root]

    for (const target of candidates) {
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1')
      try { target.focus({ preventScroll: true }) } catch (e) { target.focus() }
      // Comprobar que PRENDIÓ: focus() sobre un elemento sin caja no hace nada y no avisa.
      if (document.activeElement === target || (document.activeElement && target.contains(document.activeElement))) {
        return true
      }
    }
    return false
  }

  let hasNavigated = false

  /**
   * Anuncia la llegada a una pantalla y deja el foco en ella.
   *
   * Dos límites deliberados, y los dos importan:
   *
   *  - Sólo en navegaciones REALES. Un re-render no debe tocar el foco: se lo arrancaría al
   *    usuario del campo que está editando.
   *  - NUNCA en la primera carga. Ahí el documento ya empieza arriba, y llevar el foco al
   *    contenido deja el enlace de salto por DETRÁS del punto de partida: el primer tabulador
   *    del usuario ya no lo alcanza y el menú queda sólo a base de Shift+Tab. Se anuncia el
   *    título igualmente, que es lo que aporta valor en esa primera pantalla.
   */
  function announceNavigation(title) {
    announce(title)
    if (hasNavigated) focusContentSoon()
    hasNavigated = true
  }

  /**
   * Intenta llevar el foco al contenido durante unos cuantos frames.
   *
   * VB actualiza los bindings de forma asíncrona: en el momento en que la chain de navegación
   * termina, el contenido nuevo AÚN NO está en el DOM. Enfocar ahí prende sobre el contenido
   * viejo y se pierde en cuanto se reemplaza — que es exactamente lo que pasaba. Se reintenta
   * hasta que prenda, o se abandona: mejor no mover el foco que dejarlo en un sitio raro.
   */
  function focusContentSoon(framesLeft = 12) {
    if (typeof requestAnimationFrame === 'undefined') { focusContent(); return }
    requestAnimationFrame(() => {
      if (focusContent()) return
      if (framesLeft > 0) focusContentSoon(framesLeft - 1)
    })
  }

  /** Test seam: olvida que ya se navegó. */
  function resetNavigationState() { hasNavigated = false }

  // ── salto al contenido ───────────────────────────────────────────────────────────────────

  /**
   * Monta el enlace "saltar al contenido" como PRIMER elemento del body (WCAG 2.4.1).
   *
   * Cada pantalla empieza por el mismo menú. Sin una vía para saltarlo, quien navega con
   * teclado paga ese menú entero en cada pantalla antes de llegar a lo que venía a hacer.
   *
   * Oculto por transform y no por display:none, porque un elemento con display:none no puede
   * recibir foco — y entonces el enlace sería inalcanzable, que es justo lo contrario.
   */
  function mountSkipLink(label = 'Saltar al contenido') {
    if (typeof document === 'undefined') return
    if (!document.body) {
      document.addEventListener('DOMContentLoaded', () => mountSkipLink(label), { once: true })
      return
    }
    if (document.querySelector('.mateu-skip-link')) return
    const link = document.createElement('button')
    link.className = 'mateu-skip-link'
    link.textContent = label
    link.addEventListener('click', focusContent)
    document.body.insertBefore(link, document.body.firstChild)
  }

  // ── estado de ocupado en el control pulsado ──────────────────────────────────────────────

  /**
   * Marca ocupado el control que el usuario pulsó, mientras su acción está en vuelo.
   *
   * La barra global responde a "¿está ocupada la app?", pero la pregunta que se hace quien está
   * en una conexión lenta es "¿se ha enterado de mi clic?". Sin esto pulsa Guardar, no cambia
   * nada, y vuelve a pulsar.
   *
   * Anima la OPACIDAD del propio elemento y no dibuja un spinner en ::after: sobre un shadow
   * host el pseudo-elemento no se pinta (comprobado en los renderers web con un
   * `inset:0;background:red` sobre un vaadin-button vivo), y no hay garantía de que los
   * componentes de JET no lo sean.
   */
  function markPending(element) {
    if (!element || !element.setAttribute) return
    if (element.hasAttribute('data-mateu-pending')) return
    element.setAttribute('data-mateu-pending', '')
    element.setAttribute('aria-busy', 'true')
  }

  function clearPending(element) {
    if (!element || !element.removeAttribute) return
    element.removeAttribute('data-mateu-pending')
    element.removeAttribute('aria-busy')
  }

  /**
   * El control realmente pulsado a partir del evento, o null si no lo hay.
   *
   * Sólo se decora una lista CERRADA de cosas con pinta de botón: atenuar un contenedor (una
   * tabla, un formulario entero) sería peor que no mostrar nada, y una acción puede dispararse
   * desde cualquier sitio — un trigger, un atajo, el clic de una fila.
   */
  const INTERACTIVE = 'oj-button, oj-menu-button, oj-c-button, button, [role="button"], a[href]'

  function pressedControl(event) {
    const target = event && (event.target || event.currentTarget)
    if (!target || !target.closest) return null
    return target.closest(INTERACTIVE)
  }

  /**
   * Sigue el control pulsado a nivel de DOCUMENTO y lo marca mientras haya trabajo en vuelo.
   *
   * Enhebrar el evento por cada chain no vale: los botones de la app pasan por chains
   * distintas (toolbar, listado, wizard, isla…) y cualquiera nueva se olvidaría de hacerlo. En
   * cambio el clic siempre pasa por el documento, y el transporte siempre avisa de cuándo
   * empieza y acaba — así que emparejar las dos señales cubre todos los caminos, incluidos los
   * que aún no existen.
   *
   * La ventana de gracia evita marcar un control por trabajo que no desencadenó él (un trigger
   * OnLoad, un autosave): sólo cuenta si la petición sale justo detrás del clic.
   */
  const PRESS_GRACE_MS = 400
  let lastPress = { control: null, at: 0 }
  let markedControl = null

  function trackPressedControls() {
    if (typeof document === 'undefined') return
    document.addEventListener('click', (e) => {
      const path = typeof e.composedPath === 'function' ? e.composedPath() : []
      const origin = path[0] || e.target
      const control = origin && origin.closest ? origin.closest(INTERACTIVE) : null
      lastPress = { control, at: Date.now() }
    }, true)
  }

  /** Llamar desde el hook onStart del transporte. */
  function markPressedControlBusy() {
    if (!lastPress.control) return
    if (Date.now() - lastPress.at > PRESS_GRACE_MS) return
    markedControl = lastPress.control
    markPending(markedControl)
  }

  /** Llamar desde el hook onSettle. */
  function clearPressedControlBusy() {
    clearPending(markedControl)
    markedControl = null
  }

  // ── reintento a nivel de chain ───────────────────────────────────────────────────────────

  /**
   * Qué hay que rehacer tras un fallo.
   *
   * Se guarda un DESCRIPTOR, no un cierre. Un cierre atrapa el `context` de VB de la ejecución
   * que falló, y ese contexto ya no sirve cuando el usuario pulsa Reintentar un segundo después:
   * la llamada no hace nada y falla en silencio (me pasó). Con un descriptor, quien reintenta
   * usa SU contexto, que está vivo.
   *
   * Reenviar sólo la petición tampoco valdría: una respuesta que nadie procesa no cambia nada en
   * pantalla — la misma lección que en los renderers web. Por eso lo que se rehace es la acción
   * o la navegación ENTERA.
   */
  let lastRetry = null

  /** `{ kind: 'navigate', route }` o `{ kind: 'action', actionId, parameters }`. */
  function setLastRetry(descriptor) {
    lastRetry = descriptor && descriptor.kind ? descriptor : null
  }

  function hasLastRetry() { return !!lastRetry }

  /** Devuelve el descriptor y lo olvida: un reintento se ofrece una vez. */
  function takeLastRetry() {
    const descriptor = lastRetry
    lastRetry = null
    return descriptor
  }


  // Montaje de COMPONENTES WEB de terceros (átomo isElement): el wire trae la etiqueta, sus
  // atributos y la URL del módulo que la define. Vive fuera del reducer porque toca el DOM.
  //
  // Por qué no se puede pintar en la plantilla: VB no sabe escribir `<{name}>`. Y por qué no se
  // recrea en cada render: un componente web guarda estado que el servidor no conoce —el zoom y la
  // selección de un grafo, un layout ya calculado—, así que se crea UNA vez por hueco y en los
  // renders siguientes solo se le reescriben los atributos. Mismo criterio que el renderer web
  // compartido (libs/mateu elementRenderer).

  const loaded = {}

  /**
   * Carga el módulo que define la etiqueta, una sola vez. El elemento se puede crear antes: los
   * componentes web se "actualizan" solos en cuanto su definición llega.
   *
   * Se inyecta un `<script type="module">` en vez de usar `import(url)` porque el build de VB
   * transpila el import dinámico a un `require()` de AMD, y requirejs se pone a resolver la URL
   * como si fuera un id de módulo suyo: la petición no llega a salir y el hueco se queda vacío
   * sin un solo error. Un script de módulo no lo puede reescribir nadie.
   */
  function ensureDefined(name, importUrl) {
    if (!importUrl || !name || name.indexOf('-') < 0) return
    if (loaded[importUrl]) return
    if (typeof customElements !== 'undefined' && customElements.get(name)) return
    if (typeof document === 'undefined') return
    loaded[importUrl] = true
    const script = document.createElement('script')
    script.type = 'module'
    script.src = importUrl
    // que un componente de terceros no cargue no puede tumbar la pantalla: el hueco se queda
    // vacío y el resto del contenido sigue ahí
    script.addEventListener('error', () => { loaded[importUrl] = false })
    document.head.appendChild(script)
  }

  function hydrate(element, atom) {
    for (const key of Object.keys(atom.attributes || {})) {
      // setAttribute sobre el que YA está, nunca sobre uno nuevo: el componente lo convierte en
      // cambio de propiedad y se repinta conservando lo suyo
      element.setAttribute(key, atom.attributes[key])
    }
    if (atom.style) element.setAttribute('style', atom.style)
    if (atom.cssClasses) element.setAttribute('class', atom.cssClasses)
    if (atom.content) {
      if (atom.asHtml) element.innerHTML = atom.content
      else element.textContent = atom.content
    }
  }

  /** Hidrata los huecos `.mateu-element` que haya en el documento. Devuelve cuántos quedaron
   *  montados, para que quien reintenta sepa si ya está. */
  function mountElements(atoms) {
    const byId = {}
    for (const atom of atoms || []) byId[atom.elementId] = atom
    let mounted = 0
    const holes = typeof document === 'undefined'
      ? [] : document.querySelectorAll('.mateu-element[data-element-id]')
    for (const hole of holes) {
      const atom = byId[hole.getAttribute('data-element-id')]
      if (!atom) continue
      ensureDefined(atom.name, atom.importUrl)
      let element = hole.firstElementChild
      if (!element || element.tagName.toLowerCase() !== atom.name.toLowerCase()) {
        hole.textContent = ''
        element = document.createElement(atom.name)
        hole.appendChild(element)
      }
      hydrate(element, atom)
      mounted += 1
    }
    return mounted
  }

  /** Igual, pero esperando a que VB pinte: sus bindings se actualizan de forma ASÍNCRONA, así que
   *  al terminar la chain el hueco todavía no está en el DOM (la misma trampa que costó el foco
   *  del contenido en la accesibilidad). */
  function mountElementsSoon(atoms, frames = 12) {
    const pending = (atoms || []).filter((a) => a && a.isElement)
    if (!pending.length || typeof requestAnimationFrame === 'undefined') return
    let left = frames
    const tick = () => {
      if (mountElements(pending) >= pending.length) return
      left -= 1
      if (left > 0) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }

  /** Los átomos isElement de una proyección de bloques (los que hay que montar). */
  function elementAtomsOf(blocks) {
    const out = []
    for (const block of blocks || []) {
      for (const atom of block.items || []) if (atom && atom.isElement) out.push(atom)
    }
    return out
  }


  // Static-bundle "no backend" mode for the VB/Redwood renderer — the same contract as the web
  // renderers' libs/mateu (bundleStore.ts), rewritten for THIS core (which shares nothing with them:
  // here the transport is `fetch` in transport.mjs, not axios). A build-time exporter (Mateu's
  // `mateu:bundle` goal) OR the runtime endpoint (GET /mateu/v3/bundle) renders each declared route's
  // initial load (actionId '') to wire JSON and writes a manifest.json; when a bundle is present we
  // answer route LOADS from it instead of POSTing to the server, so the VB app runs from static
  // assets with no backend. Live data still comes from external endpoints; ACTIONS still need a
  // backend (they fall through to the normal transport).
  //
  // Pure except loadBundleManifest, so test.mjs can exercise it in Node with a fetch double.

  // syncPath → parsed increment, for the routes that exported OK. undefined = no bundle loaded.
  let increments
  // :param route TEMPLATES: a compiled matcher + param names + the pre-rendered structure.
  let templates = []
  // The in-flight manifest load (if any), so a route load can await it before hitting the backend.
  let pending
  // The mount's authored route registry, as shipped in the manifest: a statically deployed mount has
  // no server left to ask what a URL means, so the parameters a route pins or seeds travel as data.
  let routeEntries = []

  /** The `:name` segments of a route pattern, in order. */
  const paramNamesOf = (route) =>
    route.split('/').filter((s) => s.startsWith(':') && s.length > 1).map((s) => s.substring(1))

  const normRoute = (s) => (s || '').replace(/^\/+/, '').replace(/\/+$/, '')

  /** The registry entry answering a concrete path, plus the path params read off it. Static routes
   *  before parameterised ones (so `orders/new` is never swallowed by `orders/:id`) and, among
   *  parameterised matches, the most specific — matching must not depend on declaration order.
   *  Mirrors the server's RouteTable.match and the web's bundleStore. */
  function matchRouteEntry(path) {
    const target = normRoute(path === '_no_route' ? '' : path)
    const targetSegments = target === '' ? [] : target.split('/')
    let best
    for (const entry of routeEntries) {
      const pattern = normRoute(entry.route)
      const patternSegments = pattern === '' ? [] : pattern.split('/')
      if (patternSegments.length !== targetSegments.length) continue
      const pathParams = {}
      let matches = true
      for (let i = 0; i < patternSegments.length; i++) {
        const seg = patternSegments[i]
        if (seg.startsWith(':') && seg.length > 1) pathParams[seg.substring(1)] = targetSegments[i]
        else if (seg !== targetSegments[i]) { matches = false; break }
      }
      if (!matches) continue
      if (!best || paramNamesOf(pattern).length < paramNamesOf(normRoute(best.entry.route)).length) {
        best = { entry, pathParams }
      }
    }
    return best
  }

  /** Applies the registry's parameters to a pre-rendered increment, in the SAME order the server and
   *  the web renderers use — otherwise one route would behave differently depending on which renderer
   *  and whether a backend happens to be present:
   *
   *    fixed  >  path  >  what the increment already carries  >  defaults
   *
   *  Untouched (same reference) when no entry answers the path. */
  function applyRouteParams(syncPath, increment) {
    const match = matchRouteEntry(syncPath)
    if (!match) return increment
    const defaults = match.entry.defaultParams || {}
    const fixed = match.entry.fixedParams || {}
    const pathParams = match.pathParams
    if (!Object.keys(defaults).length && !Object.keys(fixed).length && !Object.keys(pathParams).length) {
      return increment
    }
    return {
      ...increment,
      fragments: (increment.fragments || []).map((f) => ({
        ...f,
        state: { ...defaults, ...(f.state || {}), ...pathParams, ...fixed },
        data: { ...defaults, ...(f.data || {}), ...pathParams, ...fixed },
      })),
    }
  }

  /** The registry entry answering a path, for callers that need its definition or view model. */
  const getRouteEntry = (syncPath) => {
    const m = matchRouteEntry(syncPath)
    return m ? m.entry : undefined
  }

  /** The `/mateu/v3/sync/<seg>` path segment for a route — mirrors transport.callMateu and the web:
   *  leading slash stripped, blank/root → `_no_route`. */
  function toSyncPath(route) {
    const r = route && route.startsWith('/') ? route.substring(1) : (route || '')
    return r === '' ? '_no_route' : r
  }

  /** Load the bundle manifest once. A miss/malformed manifest silently leaves bundle mode OFF (the
   *  app falls back to the backend at baseUrl). */
  function loadBundleManifest(url, fetchImpl) {
    const f = fetchImpl || (typeof fetch !== 'undefined' ? fetch : null)
    pending = (async () => {
      try {
        if (!f) return
        const res = await f(url)
        if (!res || !res.ok) return
        const manifest = await res.json()
        const map = new Map()
        const tpls = []
        for (const e of (manifest.entries || [])) {
          if (!e.ok || !e.json) continue
          try {
            const inc = JSON.parse(e.json)
            if (e.routePattern) {
              tpls.push({ regex: new RegExp(e.routePattern), paramNames: e.paramNames || [], increment: inc })
            } else {
              map.set(e.syncPath, inc)
            }
          } catch (err) {
            // skip a malformed entry, keep the rest
          }
        }
        increments = map
        templates = tpls
        routeEntries = (manifest.routes && manifest.routes.routes) || []
      } catch (e) {
        // leave bundle mode off
      }
    })()
    return pending
  }

  /** Await the in-flight manifest load (if any) — so a route load doesn't race the fetch and hit the
   *  backend before the bundle is ready. Resolves immediately when nothing is loading. */
  const awaitBundle = () => pending || Promise.resolve()

  /** True once a non-empty bundle has been loaded (exact routes or :param templates). */
  const hasBundle = () =>
    (increments !== undefined && increments.size > 0) || templates.length > 0

  /** The pre-rendered increment for a route's sync path, or undefined (→ fall back to the backend).
   *  The registry's parameters are applied on the way out, so a statically served route behaves like
   *  the same route served by the backend. */
  const getBundledIncrement = (syncPath) => {
    const inc = increments ? increments.get(syncPath) : undefined
    return inc === undefined ? undefined : applyRouteParams(syncPath, inc)
  }

  /** Match a concrete sync path (e.g. `orders/42`) against the :param TEMPLATES; on a hit, return the
   *  pre-rendered structure with the extracted params INJECTED into every fragment's state and data —
   *  so a `${state.<param>}` in a client-side data URL resolves to the real value. undefined = no hit. */
  function matchBundledTemplate(syncPath) {
    for (const t of templates) {
      const m = t.regex.exec(syncPath)
      if (!m) continue
      const params = {}
      t.paramNames.forEach((name, i) => { params[name] = m[i + 1] })
      const withPathParams = {
        ...t.increment,
        // params LAST so the real value wins over the render-time placeholder
        fragments: (t.increment.fragments || []).map((f) => ({
          ...f,
          state: { ...(f.state || {}), ...params },
          data: { ...(f.data || {}), ...params },
        })),
      }
      // …and then the registry's own, so a pinned parameter still outranks the path.
      return applyRouteParams(syncPath, withPathParams)
    }
    return undefined
  }

  /** The bundled increment for a route (exact match then :param template), re-targeted so its
   *  fragments land on the loading surface: the exporter had no initiator, so a fragment's
   *  targetComponentId is null — reduceContexts routes null → HOST, but a load INTO an island must
   *  target that island, so stamp the initiator (matches the web intercept). undefined = not bundled. */
  function bundledIncrementFor(route, initiator) {
    const syncPath = toSyncPath(route)
    const inc = getBundledIncrement(syncPath) || matchBundledTemplate(syncPath)
    if (!inc) return undefined
    return {
      ...inc,
      fragments: (inc.fragments || []).map((f) =>
        f.targetComponentId ? f : { ...f, targetComponentId: initiator || '' }),
    }
  }

  /** Test hook: seed/clear the in-memory bundle directly. */
  function __setBundleForTests(m, t, r) {
    increments = m
    templates = t || []
    routeEntries = r || []
    pending = undefined
  }


  // Transporte del bridge — contrato CONFIRMADO contra demo/demo-vb (ver DESIGN-NOTES
  // "Transporte"): bootstrap de la shell por components/_/action; todo lo demás por
  // sync/{route|_no_route} con actionId '' en las cargas. Fuente ÚNICA: este fichero se
  // testea en Node (capture.mjs) y se empaqueta en AMD para VB (make-amd.mjs).


  /** POST {base}/mateu/v3/sync/{route} — la request estándar (= AxiosMateuApiClient.runAction). */
  async function callMateu(base, body, options = {}) {
    const bare = (body.route || '').replace(/^\//, '')
    const res = await fetchWithPolicy(`${base}/mateu/v3/sync/${bare || '_no_route'}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        appState: {},
        componentState: {},
        parameters: {},
        initiatorComponentId: '',
        consumedRoute: '',
        serverSideType: undefined,
        ...body,
        route: bare ? `/${bare}` : '',
      }),
    }, { actionId: body.actionId, timeoutMillis: options.timeoutMillis, idempotent: options.idempotent, quiet: options.quiet })
    return res.json()
  }

  /** Bootstrap de la shell: el App raíz solo resuelve por el endpoint genérico.
   *  Static-bundle: la shell NO se exporta (el bundle guarda cargas de ruta, no el __load__ del App),
   *  así que en modo híbrido (bundle + backend) el menú sale del backend como siempre; pero si el
   *  backend NO está (despliegue estático puro) y el bundle trae la ruta raíz, se cae a ella para que
   *  la app arranque igual. Sólo en el fallo — el camino feliz no cambia. */
  async function bootstrapShell(base, initiator = 'shell') {
    await awaitBundle()
    try {
      const res = await fetchWithPolicy(`${base}/mateu/v3/components/_/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ route: '', actionId: '__load__', componentState: {}, initiatorComponentId: initiator }),
      }, { actionId: '__load__' })
      return res.json()
    } catch (e) {
      if (hasBundle()) {
        const bundled = bundledIncrementFor('', initiator)
        if (bundled) return bundled
      }
      throw e
    }
  }

  /** Ruta INTERNA de un mediador/isla tras un flip de state._route: base del outbound +
   *  flip + marcadores query (los ?_embeddedMediator=1&_inline=1 deben seguir viajando). */
  function composeInnerRoute(outboundRoute, flip) {
    if (!flip || flip === '/' ) return outboundRoute
    const queryIndex = outboundRoute.indexOf('?')
    const base = queryIndex >= 0 ? outboundRoute.slice(0, queryIndex) : outboundRoute
    const query = queryIndex >= 0 ? outboundRoute.slice(queryIndex) : ''
    return base + flip + query
  }

  /**
   * ¿La respuesta a una acción pide recargar la ruta interna del mediador? Devuelve esa ruta, o
   * null si no hay flip.
   *
   * Un crud de PÁGINA no contesta el detalle: contesta un fragmento SOLO-ESTADO cuyo `_route`
   * apunta a él (clic de fila → `/2CSXZN`, New → `/new`), que significa "recarga mi ruta interna
   * con este estado". Quien no sigue el flip se queda mirando el listado: la petición sale, el
   * servidor contesta 200, y no pasa nada — el fallo más difícil de ver de todos.
   *
   * El criterio es SEMÁNTICO (comparar el valor de `_route` antes y después), no por identidad:
   * los objetos de VB son proxies y las referencias no dicen nada.
   */
  function routeFlipOf(previousState, nextCtx, increment, fallbackRoute = '') {
    const stateOnly = increment && (increment.fragments || []).length > 0
      && (increment.fragments || []).every((f) => !f.component)
    if (!stateOnly || !nextCtx || !nextCtx.state) return null
    const flip = nextCtx.state._route
    const previous = previousState ? previousState._route : undefined
    if (flip == null || flip === previous) return null
    const outbound = nextCtx.outbound || {}
    return composeInnerRoute(outbound.route || fallbackRoute || '', flip)
  }

  /** Carga de una ruta (actionId '': el __load__ real; extra = consumedRoute/serverSideType…).
   *  Static-bundle: si hay manifest cargado, la carga se responde DESDE el bundle (sin backend);
   *  se espera al fetch del manifest en vuelo (la primera carga puede adelantarlo) y, si la ruta no
   *  está en el bundle, se cae al backend — así un despliegue híbrido (bundle + backend) sigue yendo. */
  const loadRoute = async (base, route, initiator = '', extra = {}) => {
    await awaitBundle()
    if (hasBundle()) {
      const bundled = bundledIncrementFor(route, initiator)
      if (bundled) return bundled
    }
    return callMateu(base, { route, actionId: '', initiatorComponentId: initiator, ...extra })
  }

  /** Acción saliente: arma la request desde el CONTEXTO — "manda el estado que ya tienes".
   *  Los 4 campos de ruta salen del `outbound` que loadRouteInto estampó al cargar el
   *  contexto (un mediador necesita consumedRoute + serverSideType también en las acciones). */
  function runMateuAction(base, ctx, route, actionId, componentState, extra = {}) {
    const outbound = (ctx && ctx.outbound) || {}
    // Una superficie cargada de otro pod sigue hablando con ESE pod. La base viaja en el
    // outbound por la misma razón que los 4 campos de ruta: quien dispara una acción (el
    // trigger `search` de un listado, un botón del toolbar) sabe de qué contexto sale, pero
    // no de qué backend vino — y mandarla a la shell la contesta vacía, sin error.
    base = outbound.baseUrl != null ? outbound.baseUrl : base
    const initiator = (ctx && ctx.tree && ctx.tree.id) || (ctx && ctx.id) || ''
    // Guard de doble envío. Una lectura queda EXENTA de la exclusividad: el guard existe porque
    // un segundo POST de una escritura significa una segunda fila, mientras que una segunda
    // lectura sólo significa datos más frescos — y bloquearlas rompería el type-ahead, donde la
    // búsqueda de "mad" se descartaría por estar en vuelo la de "ma".
    const exclusive = !isIdempotentAction(actionId, extra && extra.idempotent)
    const key = pendingActions.key(initiator, actionId)
    if (exclusive && !pendingActions.begin(key)) {
      // Duplicado: se descarta ANTES de construir la petición.
      return Promise.resolve(null)
    }
    const release = () => { if (exclusive) pendingActions.end(key) }
    return callMateu(base, {
      route: outbound.route || route,
      consumedRoute: outbound.consumedRoute || '',
      actionId,
      componentState: componentState || (ctx && ctx.state) || {},
      serverSideType: outbound.serverSideType || (ctx && ctx.tree && ctx.tree.serverSideType),
      initiatorComponentId: initiator,
      ...extra,
    }, { timeoutMillis: extra && extra.timeoutMillis, idempotent: extra && extra.idempotent })
      .then((inc) => { release(); return inc }, (e) => { release(); throw e })
  }

  /** Acción SSE (Action.sse(true), p.ej. LongTask): POST {base}/mateu/v3/sse/{route} con
   *  Accept text/event-stream — la respuesta es un STREAM de UIIncrements (data: …\n\n).
   *  Los increments se ENTREGAN EN VIVO vía `extra.onIncrement(inc)` (async; el diálogo de
   *  progreso del LongTask se pinta mientras el stream avanza); si el callback devuelve
   *  true, el increment se considera CONSUMIDO y se excluye de la lista devuelta. Sin
   *  callback, comportamiento clásico: lista completa al acabar. */
  async function runMateuActionSse(base, ctx, route, actionId, componentState, extra = {}) {
    const { onIncrement, ...bodyExtra } = extra || {}
    const outbound = (ctx && ctx.outbound) || {}
    base = outbound.baseUrl != null ? outbound.baseUrl : base
    const effectiveRoute = outbound.route || route || ''
    const bare = effectiveRoute.replace(/^\//, '')
    // Sin timeout: un LongTask mantiene el stream abierto por diseño, así que un ceiling lo
    // mataría a mitad. Pasa igualmente por la política para que el fallo llegue clasificado.
    const res = await fetchWithPolicy(`${base}/mateu/v3/sse/${bare || '_no_route'}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'text/event-stream' },
      body: JSON.stringify({
        appState: {},
        componentState: componentState || (ctx && ctx.state) || {},
        parameters: {},
        initiatorComponentId: (ctx && ctx.tree && ctx.tree.id) || (ctx && ctx.id) || '',
        consumedRoute: outbound.consumedRoute || '',
        serverSideType: outbound.serverSideType || (ctx && ctx.tree && ctx.tree.serverSideType),
        ...bodyExtra,
        route: bare ? `/${bare}` : '',
        actionId,
      }),
    }, { actionId, timeoutMillis: -1 })
    const increments = []
    const handle = async (raw) => {
      const line = raw.trim()
      if (!line.startsWith('data:')) return
      const inc = JSON.parse(line.slice(5).trim())
      const consumed = onIncrement ? await onIncrement(inc) : false
      if (!consumed) increments.push(inc)
    }
    if (res.body && res.body.getReader) {
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        let cut
        while ((cut = buffer.indexOf('\n\n')) >= 0) {
          await handle(buffer.slice(0, cut))
          buffer = buffer.slice(cut + 2)
        }
      }
      if (buffer.trim()) await handle(buffer)
    } else {
      for (const chunk of (await res.text()).split('\n\n')) await handle(chunk)
    }
    return increments
  }

  /**
   * Un mediador cuyo WRAPPER llega como App de chrome (ClientSide type App) en vez de envuelto en un
   * ServerSide. Es la forma que hoy manda el backend al abrir una opción de menú: el mismo App que en
   * el bootstrap, pero pedido para una SUB-ruta (route por debajo de rootRoute). reduceContexts lo
   * absorbe como shell y el contexto queda vacío, así que mediatorOf(host) no lo detecta y la 2ª carga
   * —la del contenido real: search form + listado del crud— nunca se dispara. Se lee entonces del
   * incremento: si trae un App cuyo rootRoute es prefijo de la ruta pedida, hay contenido que buscar.
   *
   * La raíz del app (route === rootRoute) es la shell/home y NO pasa por aquí: la resuelve el
   * bootstrap. Sólo una navegación por debajo de la raíz necesita el segundo salto.
   */
  function mediatorFromShellApp(increment, route) {
    for (const fr of increment?.fragments || []) {
      const c = fr.component
      const md = c?.metadata
      if (c?.type !== 'ClientSide' || md?.type !== 'App') continue
      const rootRoute = md.rootRoute || ''
      if (rootRoute && route && route.startsWith(`${rootRoute}/`)) {
        return {
          rootRoute: md.homeConsumedRoute || rootRoute,
          serverSideType: md.homeServerSideType ?? md.serverSideType,
        }
      }
    }
    return null
  }

  /**
   * Carga una ruta EN el registro y sigue el mediador si lo hay (crud/isla: la 1ª carga
   * devuelve el App chromeless; el contenido llega con consumedRoute + serverSideType).
   * Devuelve el registro nuevo. targetId = clave del contexto destino (initiator).
   */
  async function loadRouteInto(base, reg, route, targetId = '', extra = {}) {
    // el INCREMENTO crudo se conserva: la 1ª carga de una opción de menú llega como App de mediador
    // (ClientSide type App), que reduceContexts encamina al CHROME (shell) y no al contexto —
    // mediatorOf(host) no lo ve, así que hay que sacar el mediador del incremento mismo.
    const firstIncrement = await loadRoute(base, route, targetId, extra)
    let next = reduceContexts(reg, firstIncrement)
    const ctxId = targetId === '' ? HOST_ID : targetId
    let outbound = { route, consumedRoute: '', serverSideType: undefined, baseUrl: base }
    // las ACTIONS del componente (con su flag sse) viajan en el WRAPPER del mediador —
    // la carga de contenido las pierde, así que se conservan aquí
    const wrapperTree = next.contexts[ctxId] && next.contexts[ctxId].tree
    const wrapperActions = (wrapperTree && wrapperTree.actions) || []
    const info = mediatorOf(next.contexts[ctxId]) || mediatorFromShellApp(firstIncrement, route)
    if (info) {
      outbound = {
        route,
        consumedRoute: info.rootRoute || route,
        serverSideType: info.serverSideType,
        baseUrl: base,
      }
      next = reduceContexts(
        next,
        await loadRoute(base, route, targetId, {
          ...extra,
          consumedRoute: outbound.consumedRoute,
          serverSideType: outbound.serverSideType,
        }),
      )
    }
    // el contexto RECUERDA cómo se cargó: las acciones salientes reconstruyen los campos
    // de ruta desde aquí (structural sharing: solo cambia la ref de esta entrada).
    // sseActionIds: acciones anunciadas Action.sse(true) — van por el endpoint /sse
    next = {
      ...next,
      contexts: {
        ...next.contexts,
        [ctxId]: {
          ...next.contexts[ctxId],
          outbound,
          sseActionIds: wrapperActions.filter((a) => a && a.sse).map((a) => a.id),
        },
      },
    }
    return next
  }

  /**
   * De qué backend se cargó una superficie, o undefined si aún no se sabe.
   *
   * Una isla se carga con `loadRouteInto`, que recibe la base como argumento: la cadena que la
   * dispara conoce el id del contexto, no el pod. Preguntándoselo al HOST (el valor por defecto)
   * la isla se carga de donde vino la pantalla que la contiene, que es lo que siempre quiere.
   */
  function baseOf(reg, ctxId = HOST_ID) {
    const ctx = reg && reg.contexts && reg.contexts[ctxId]
    return ctx && ctx.outbound ? ctx.outbound.baseUrl : undefined
  }

  // ── menús federados ────────────────────────────────────────────────────────────────────────
  //
  // Una shell declara secciones que sirve OTRO pod: `RemoteMenu("/_workflow")`. El árbol que llega
  // en el bootstrap trae esas opciones marcadas `remote` y SIN hijos — los hijos son del pod, y hay
  // que ir a buscarlos. Hasta ahora este renderer no lo hacía: pintaba el rótulo que la shell había
  // escrito y nada debajo, que se lee como "ese servicio no tiene pantallas" en vez de como "nadie
  // se lo ha preguntado".
  //
  // Lo que sigue es la mitad fácil. La otra está en la navegación: una entrada traída de otro pod
  // solo se puede cargar llamando a ESE pod, y este bridge llamaba siempre al base de la shell. Por
  // eso cada opción adoptada queda registrada en `remoteRoutes`, y la cadena de navegación consulta
  // ahí a dónde tiene que ir. Sin esa segunda mitad, expandir el menú es peor que no expandirlo:
  // aparecen entradas que al pulsarlas no llevan a ninguna parte.

  /** Ruta de menú → dónde vive de verdad. La llena expandRemoteMenus; la lee la navegación. */
  const remoteRoutes = new Map()

  /**
   * Dónde vive una ruta, o undefined si la sirve la propia shell.
   *
   * Casa también por PREFIJO, con el registro más largo que encaje: al registro solo llegan las
   * rutas del MENÚ (`/workflow/processes`), y todo lo que cuelga de ellas —el detalle de un
   * proceso, `/new`, `/{id}/edit`— vive en el mismo pod. Sin esto, un deep-link a
   * `/workflow/processes/<id>` salía al backend de la shell, que contesta "Not found.".
   */
  function remoteRouteOf(route) {
    if (route == null) return undefined
    const bare = String(route).replace(/^\//, '')
    const exact = remoteRoutes.get(route) || remoteRoutes.get(bare)
    if (exact) return exact
    let best = null
    let bestLength = -1
    for (const [registered, descriptor] of remoteRoutes) {
      const prefix = String(registered).replace(/^\//, '')
      if (!prefix || prefix.length <= bestLength) continue
      if (bare === prefix || bare.indexOf(prefix + '/') === 0) {
        best = descriptor
        bestLength = prefix.length
      }
    }
    return best || undefined
  }

  /**
   * Registra a qué pod va una ruta que NO vino del menú: la navegación que pide un widget remoto
   * (el enlace del badge de la bandeja emite navigation-requested con su baseUrl y su
   * serverSideType). Una ruta que el menú ya registró se queda como está — el menú manda.
   */
  function registerRemoteRoute(route, descriptor) {
    if (!route || !descriptor || !descriptor.baseUrl || remoteRouteOf(route)) return false
    const entry = {
      baseUrl: descriptor.baseUrl,
      consumedRoute: descriptor.consumedRoute || '',
      serverSideType: descriptor.serverSideType,
      uriPrefix: descriptor.uriPrefix || '',
    }
    remoteRoutes.set(route, entry)
    remoteRoutes.set(String(route).replace(/^\//, ''), entry)
    return true
  }

  const childrenOf = (option) => option.submenus || option.submenu || []

  /** Las opciones remotas del árbol, a cualquier profundidad.
   *  No se baja DENTRO de una remota: lo que cuelgue de ella es del pod, y aún no ha contestado. */
  function collectRemoteMenus(menu, found = []) {
    for (const option of menu || []) {
      if (option.remote) found.push(option)
      else if (childrenOf(option).length) collectRemoteMenus(childrenOf(option), found)
    }
    return found
  }

  /** El menú del App que contesta un pod, o null si no contestó con uno. */
  function appMenuOf(increment) {
    for (const fragment of (increment && increment.fragments) || []) {
      const md = (fragment.component && fragment.component.metadata) || {}
      if (fragment.component && fragment.component.type === 'ClientSide' && md.type === 'App') {
        return { menu: md.menu || [], route: md.route || '', serverSideType: md.serverSideType }
      }
    }
    return null
  }

  /**
   * Marca las hojas traídas de un pod con dónde vive ese pod.
   *
   * Solo las que no traen `baseUrl` propio: un pod puede a su vez federar, y su respuesta ya viene
   * resuelta. Un grupo no se marca, se recorre — lo que navega es la hoja.
   */
  function adoptRemote(menu, option, app) {
    const serverSideType = option.serverSideType ? option.serverSideType : app.serverSideType
    for (const child of menu || []) {
      if (child.baseUrl) continue
      if (childrenOf(child).length) {
        adoptRemote(childrenOf(child), option, app)
        continue
      }
      child.baseUrl = option.baseUrl
      child.consumedRoute = app.route || ''
      child.serverSideType = serverSideType
      child.uriPrefix = option.route
      const descriptor = {
        baseUrl: option.baseUrl,
        consumedRoute: app.route || '',
        serverSideType,
        uriPrefix: option.route,
      }
      // Por la ruta tal cual, y por la que verá la navegación cuando shellNavOf le quite el
      // prefijo del padre. Dos claves para la misma entrada es más barato que reconstruir
      // aquí el cálculo que hace el nav, y que se desincronicen luego.
      const route = child.route || child.path || ''
      remoteRoutes.set(route, descriptor)
      remoteRoutes.set(String(route).replace(/^\//, ''), descriptor)
    }
  }

  function spliceRemote(menu, answers) {
    const out = []
    for (const option of menu || []) {
      if (option.remote) {
        const app = answers.get(option)
        // Remota OCULTA (`@Menu @Hidden RemoteMenu`, visible:false en el wire): sus rutas se
        // registran igual —un deep-link o una recarga bajo ellas tiene que ir a su pod— pero no
        // aporta nada al menú, ni siquiera el rótulo si el pod no contestó.
        if (option.visible === false) {
          if (app) adoptRemote(app.menu, option, app)
          continue
        }
        if (app) {
          adoptRemote(app.menu, option, app)
          out.push(...app.menu)
        } else {
          // El pod no contestó. Se queda el rótulo: una sección vacía se entiende, una que
          // desaparece parece que nunca existió.
          out.push(option)
        }
      } else if (option.visible === false) {
        continue
      } else if (childrenOf(option).length) {
        out.push({ ...option, submenus: spliceRemote(childrenOf(option), answers) })
      } else {
        out.push(option)
      }
    }
    return out
  }

  /**
   * Pide a cada pod su menú y lo pone donde estaba su opción.
   *
   * En paralelo, y un pod que falle no tumba al resto: su sección se queda como estaba en vez de
   * llevarse por delante las que sí contestaron.
   */
  async function expandRemoteMenus(menu) {
    const remotes = collectRemoteMenus(menu)
    if (!remotes.length) return menu
    const answers = new Map()
    await Promise.all(remotes.map(async (option) => {
      try {
        const increment = await callMateu(option.baseUrl || '', {
          route: option.route || '',
          actionId: '',
          consumedRoute: '_empty',
          initiatorComponentId: (option.baseUrl || '') + '#' + (option.route || ''),
          parameters: option.params || {},
        })
        const app = appMenuOf(increment)
        if (app) answers.set(option, app)
      } catch (e) {
        // Ya reportado por el transporte. Aquí solo se decide no propagarlo.
      }
    }))
    return spliceRemote(menu, answers)
  }


  // Widgets de CABECERA del App (WidgetSupplier.widgets / @Widget): llegan como hijos del App con
  // slot "widgets" — un layout con, típicamente, un MicroFrontend (el badge de la bandeja, otro pod
  // que se refresca solo) y un Popover sobre un Text (el saludo al usuario, que abre su email y el
  // Logout). El renderer Vaadin los pinta tal cual en su barra; aquí se reparten entre las DOS zonas
  // que declara oj-sp-global-header:
  //
  //  - slot `usermenu`: el área de perfil de la cabecera global de Redwood (FA pone ahí el avatar del
  //    usuario, y al pulsarlo su menú). Un Popover cuyo disparador es un TEXT es el idioma Mateu de
  //    "quién soy + un menú": un texto no es un control, así que lo único que puede estar diciendo es
  //    un rótulo — y en la cabecera, el del usuario. El PRIMERO de esos va al área de perfil como
  //    avatar con iniciales + nombre, y su contenido a un oj-popup anclado. Es un reconocimiento de
  //    FORMA, no de valores: no se mira qué dice el texto.
  //  - slot `end` (zona de acciones): todo lo demás, en orden — HTML de un Text, el HTML vivo de un
  //    MicroFrontend, y cualquier otro Popover como botón + oj-popup.
  //
  // El HTML se pinta como HTML (lo es en el wire: un <a> con su onclick que emite
  // navigation-requested), con una sola traducción: <vaadin-icon> no existe en Redwood y se cambia
  // por el icono de fuente oj-ux-ico equivalente. La navegación que emite la escucha la shell.


  const CONTAINERS = new Set([
    'HorizontalLayout', 'VerticalLayout', 'FormLayout', 'Container', 'Div', 'Scroller',
    'SplitLayout', 'FlexLayout',
  ])

  const ENTITIES = { nbsp: ' ', amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", '#39': "'" }

  /** El texto visible de un fragmento HTML: sin etiquetas, entidades resueltas, blancos plegados. */
  function plainTextOf(html) {
    return String(html == null ? '' : html)
      .replace(/<[^>]*>/g, ' ')
      .replace(/&(nbsp|amp|lt|gt|quot|apos|#39);/g, (all, name) => ENTITIES[name])
      .replace(/\s+/g, ' ')
      .trim()
  }

  /** Iniciales para el avatar: del nombre que sigue al saludo ("Hola, Demo User" → "DU"). */
  function initialsOf(label) {
    const text = plainTextOf(label)
    const who = text.indexOf(',') >= 0 ? text.slice(text.lastIndexOf(',') + 1) : text
    const words = who.trim().split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w))
    if (!words.length) return ''
    const first = words[0][0]
    const last = words.length > 1 ? words[words.length - 1][0] : (words[0][1] || '')
    return (first + last).toUpperCase()
  }

  const attrOf = (attrs, name) => {
    const m = new RegExp(`\\b${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, 'i').exec(attrs || '')
    return m ? (m[2] != null ? m[2] : m[3]) : null
  }

  /**
   * El HTML de un widget, apto para Redwood: cada <vaadin-icon icon="vaadin:x"> pasa a un
   * <span class="oj-ux-ico-…"> (fuente de iconos de Redwood) conservando su style — su tamaño, su
   * alineación y su color (p.ej. el rojo del badge cuando hay algo urgente). Un icono sin
   * equivalente se quita: un elemento desconocido no pinta nada y ocupa su sitio igual.
   */
  function redwoodHtmlOf(html) {
    const swap = (all, attrs) => {
      const cls = ojIconOf(attrOf(attrs, 'icon'))
      if (!cls) return ''
      const style = attrOf(attrs, 'style')
      return `<span class="${cls} mateu-widget-icon" aria-hidden="true"${style ? ` style="${style}"` : ''}></span>`
    }
    return String(html == null ? '' : html)
      .replace(/<vaadin-icon\b([^>]*?)\/>/gi, swap)
      .replace(/<vaadin-icon\b([^>]*)>\s*<\/vaadin-icon>/gi, swap)
  }

  /** El contenido de un Popover → filas del popup (texto, enlace), en orden. */
  function popoverContentOf(node) {
    const out = []
    const visit = (n) => {
      if (!n) return
      if (Array.isArray(n)) { n.forEach(visit); return }
      const md = n.metadata || {}
      if (md.type === 'Text') {
        const text = plainTextOf(md.text)
        if (text) out.push({ id: 'r' + out.length, isText: true, text })
        return
      }
      if (md.type === 'Anchor') {
        out.push({ id: 'r' + out.length, isLink: true, label: md.text || md.url || '', href: md.url || '#', target: md.target || '' })
        return
      }
      if (md.type === 'Button') {
        // un botón en el popup de un widget solo puede navegar o ejecutar JS del cliente: sin
        // contexto propio no tiene a quién mandar una acción de servidor
        const label = md.label || md.text || ''
        if (label) out.push({ id: 'r' + out.length, isText: true, text: label })
        return
      }
      for (const child of n.children || []) visit(child)
      if (md.content) visit(md.content)
    }
    visit(node)
    return out
  }

  /**
   * La proyección de los widgets de cabecera del registro: `user` (el área de perfil) o null, e
   * `items` (la zona de acciones), cada uno con un id estable por POSICIÓN — el mismo en cada
   * bootstrap, que es lo que deja al DOM y al refresco reencontrar su hueco.
   */
  function headerWidgetsOf(reg) {
    const nodes = (reg && reg.shell && reg.shell.widgets) || []
    let user = null
    const items = []
    const visit = (node, path) => {
      if (!node) return
      const md = node.metadata || {}
      const id = 'mateu-widget-' + path
      if (CONTAINERS.has(md.type)) {
        (node.children || []).forEach((child, i) => visit(child, path + '-' + i))
        if (md.content) (Array.isArray(md.content) ? md.content : [md.content]).forEach((c, i) => visit(c, path + '-c' + i))
        return
      }
      if (md.type === 'Popover') {
        const wrapped = md.wrapped || {}
        const wmd = wrapped.metadata || {}
        const label = wmd.type === 'Text' ? plainTextOf(wmd.text) : plainTextOf(wmd.label || wmd.text || '')
        const rows = popoverContentOf(md.content)
        if (!user && wmd.type === 'Text' && label) {
          user = { id, label, initials: initialsOf(label), rows }
        } else {
          items.push({ id, isPopover: true, label: label || '…', rows, buttonId: id + '-button', popupId: id + '-popup' })
        }
        return
      }
      if (md.type === 'MicroFrontend') {
        items.push({
          id,
          isRemote: true,
          baseUrl: md.baseUrl || '',
          route: md.route || '',
          consumedRoute: md.consumedRoute || '',
          serverSideType: md.serverSideType || undefined,
          appState: md.appState || null,
        })
        return
      }
      if (md.type === 'Text') {
        const html = redwoodHtmlOf(md.text)
        if (plainTextOf(html) || /<span class="oj-ux-ico-/.test(html)) items.push({ id, isHtml: true, html })
        return
      }
      if (md.type === 'Anchor') {
        items.push({ id, isHtml: true, html: `<a href="${String(md.url || '#').replace(/"/g, '&quot;')}"${md.target ? ` target="${md.target}"` : ''}>${md.text || ''}</a>` })
      }
    }
    nodes.forEach((node, i) => visit(node, String(i)))
    return { user, items }
  }

  /** El HTML de un widget remoto ya cargado: sus Text, interpolados contra su state. */
  function remoteWidgetHtmlOf(tree, state) {
    const parts = []
    const visit = (n) => {
      if (!n) return
      const md = n.metadata || {}
      if (md.type === 'Text') parts.push(redwoodHtmlOf(interpolate(md.text, state)))
      for (const child of n.children || []) visit(child)
    }
    visit(tree)
    return parts.join('')
  }

  const widgetRuntimes = new Map()

  /**
   * Carga un MicroFrontend de cabecera y lo mantiene vivo con SUS triggers: OnLoad al cargar y
   * OnSuccess tras cada acción que los nombre (el badge: `refresh` cada 10 s, encadenado). Es el
   * mismo contrato que el renderer web — si un refresco falla, no se reprograma (OnSuccess).
   *
   * Las peticiones van en modo `quiet`: un refresco de fondo cada pocos segundos no debe encender la
   * barra de ocupado ni la banda de error de la pantalla, que hablan de lo que el usuario hace.
   *
   * `deps` existe para los tests (call/schedule/cancel); `onHtml(html)` recibe cada repintado.
   * Arrancar de nuevo el mismo id para el anterior: un rebootstrap no deja dos bucles.
   */
  function startRemoteWidget(item, onHtml, deps = {}) {
    const call = deps.call || callMateu
    const schedule = deps.schedule || ((fn, ms) => setTimeout(fn, ms))
    const cancel = deps.cancel || ((h) => clearTimeout(h))
    const appState = deps.appState || (() => ({}))
    stopRemoteWidget(item.id, cancel)
    const rt = { stopped: false, timers: new Set(), ctx: null, outbound: {} }
    widgetRuntimes.set(item.id, rt)

    const request = (actionId, extra = {}) => call(item.baseUrl || '', {
      route: item.route || '',
      consumedRoute: rt.outbound.consumedRoute != null ? rt.outbound.consumedRoute : (item.consumedRoute || ''),
      serverSideType: rt.outbound.serverSideType || (rt.ctx && rt.ctx.tree && rt.ctx.tree.serverSideType) || item.serverSideType,
      actionId,
      initiatorComponentId: item.id,
      componentState: (rt.ctx && rt.ctx.state) || {},
      appState: Object.assign({}, appState(), item.appState || {}),
      ...extra,
    }, { quiet: true, idempotent: true })

    const apply = (increment) => {
      for (const fr of (increment && increment.fragments) || []) {
        if (fr.component) {
          rt.ctx = { tree: fr.component, state: fr.state || fr.component.initialData || {} }
        } else if (fr.state && rt.ctx) {
          rt.ctx = { tree: rt.ctx.tree, state: Object.assign({}, rt.ctx.state, fr.state) }
        }
      }
      if (!rt.stopped && rt.ctx) onHtml(remoteWidgetHtmlOf(rt.ctx.tree, rt.ctx.state))
    }

    const plan = (trigger) => {
      if (rt.stopped) return
      const handle = schedule(() => { rt.timers.delete(handle); run(trigger.actionId) }, trigger.timeoutMillis || 0)
      rt.timers.add(handle)
    }
    const triggers = () => (rt.ctx && rt.ctx.tree && rt.ctx.tree.triggers) || []

    const run = async (actionId) => {
      if (rt.stopped) return
      try {
        apply(await request(actionId))
      } catch (e) {
        return
      }
      for (const t of triggers()) if (t.type === 'OnSuccess' && t.calledActionId === actionId) plan(t)
    }

    const load = (async () => {
      try {
        apply(await request(''))
        // un remoto que conteste con un mediador (App chromeless) trae el contenido en un 2º salto
        const info = rt.ctx && mediatorOf(rt.ctx)
        if (info) {
          rt.outbound = { consumedRoute: info.rootRoute || item.route || '', serverSideType: info.serverSideType }
          apply(await request('', { consumedRoute: rt.outbound.consumedRoute, serverSideType: info.serverSideType }))
        }
      } catch (e) {
        return
      }
      for (const t of triggers()) if (t.type === 'OnLoad' && t.actionId) plan(t)
    })()

    return {
      loaded: load,
      stop: () => stopRemoteWidget(item.id, cancel),
      // para los tests: cuántos refrescos hay programados
      pending: () => rt.timers.size,
    }
  }

  function stopRemoteWidget(id, cancel = (h) => clearTimeout(h)) {
    const previous = widgetRuntimes.get(id)
    if (!previous) return
    previous.stopped = true
    for (const h of previous.timers) cancel(h)
    previous.timers.clear()
    widgetRuntimes.delete(id)
  }

  function stopRemoteWidgets() {
    for (const [id, rt] of widgetRuntimes) {
      rt.stopped = true
      for (const h of rt.timers) clearTimeout(h)
      widgetRuntimes.delete(id)
    }
  }

  // ── DOM ─────────────────────────────────────────────────────────────────────────────────────
  // VB no sabe estampar HTML crudo desde un binding: el hueco (<span class="mateu-header-widget"
  // data-widget-id>) lo pinta la plantilla y el HTML lo pone el bridge, como con los componentes web
  // de terceros (elements.mjs). Se recuerda el último HTML de cada hueco: si VB lo re-estampa, el
  // siguiente montaje lo rellena otra vez; si no cambió, no se toca (un clic en curso sobre el
  // enlace no pierde su elemento cada 10 s).

  const lastHtml = {}

  function mountHeaderHtml(id, html) {
    if (html != null) lastHtml[id] = html
    if (typeof document === 'undefined') return false
    const hole = document.querySelector(`.mateu-header-widget[data-widget-id="${id}"]`)
    if (!hole) return false
    const next = lastHtml[id] || ''
    if (hole.__mateuHtml !== next) {
      hole.innerHTML = next
      hole.__mateuHtml = next
    }
    return true
  }

  /** Igual, esperando a que VB pinte el hueco (sus bindings son asíncronos). */
  function mountHeaderHtmlSoon(id, html, frames = 30) {
    if (html != null) lastHtml[id] = html
    if (typeof requestAnimationFrame === 'undefined') return
    let left = frames
    const tick = () => {
      if (mountHeaderHtml(id)) return
      left -= 1
      if (left > 0) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }

  // ── FAB de "ask" del shell ──────────────────────────────────────────────────────────────────
  // oj-sp-simple-ui-shell estampa su propio FAB (evento ojSpChatAction) con `oj-ux-ico-oracle-chat`:
  // el bocadillo de conversación del asistente DIGITAL de Oracle. Aquí ese FAB abre Ask Oracle — el
  // buscador de destinos —, y el chat del agente tiene su propio FAB con `oj-ux-ico-chat`: dos
  // bocadillos para dos cosas distintas. Así que el del shell lleva la marca de Ask Oracle, el glifo
  // que usa el propio oj-sp-ask-oracle en la cabecera de Fusion (`oj-ux-ico-oracle-o`, la "O" de
  // Oracle), y su rótulo. Un App que no quiera la marca Oracle pone la suya con @App(askLabel,
  // askIcon): una inicial, una imagen (su logo) o un icono.

  const ASK_FAB_LABEL = 'Ask Oracle'
  const ASK_FAB_GLYPH = 'oj-ux-ico-oracle-o'
  /** El glifo con el que lo estampa el shell (el que se quita). */
  const SHELL_CHAT_GLYPH = 'oj-ux-ico-oracle-chat'

  const isImageRef = (value) => /^(data:|https?:|\/\/)/i.test(value) || /[/.]/.test(value)

  /**
   * Qué lleva el FAB de "ask" del shell: `{ label, kind, glyph?, text?, src? }`.
   *  - sin @App(askIcon): el glifo de Ask Oracle de Redwood (kind 'glyph');
   *  - una o dos letras ("R"): la inicial (kind 'initial');
   *  - una ruta o url ("/images/riu.svg"): la imagen (kind 'image'), relativa al backend como el logo;
   *  - `oj-ux-ico-…` o un nombre Mateu (`vaadin:…`) con equivalente: ese icono (kind 'glyph').
   * Un askIcon que no es nada de eso (un icono sin equivalente, una palabra) no deja el FAB vacío:
   * vuelve al glifo de Ask Oracle.
   */
  function askFabOf(shell, base = '') {
    const label = String((shell && shell.askLabel) || '').trim() || ASK_FAB_LABEL
    const raw = String((shell && shell.askIcon) || '').trim()
    const glyph = (cls) => ({ label, kind: 'glyph', glyph: cls })
    if (!raw) return glyph(ASK_FAB_GLYPH)
    if (isImageRef(raw)) {
      const absolute = /^(data:|https?:|\/\/)/i.test(raw)
      return { label, kind: 'image', src: absolute ? raw : base + raw }
    }
    if (raw.startsWith('oj-ux-') || raw.includes(':')) return glyph(ojIconOf(raw) || ASK_FAB_GLYPH)
    const letters = Array.from(raw)
    if (letters.length <= 2) return { label, kind: 'initial', text: raw.toUpperCase() }
    return glyph(ASK_FAB_GLYPH)
  }

  const MARK_CLASS = 'mateu-ask-fab-mark'
  const BRANDED_CLASS = 'mateu-ask-fab-branded'

  /**
   * Pone la marca y el nombre al FAB del shell (`fab`, el `<a>`; dentro, el `div role=img` del
   * glifo). Idempotente: se puede volver a aplicar con otra marca. Además le da lo que el shell no le
   * da: sin href ni rol, no se alcanzaba con el tabulador y sólo decía "Ask".
   */
  function brandAskFab(fab, spec) {
    if (!fab || !spec) return false
    const icon = fab.querySelector('.oj-sp-rw-chat-icon-image')
    if (!icon) return false
    fab.setAttribute('role', 'button')
    fab.setAttribute('tabindex', '0')
    fab.setAttribute('aria-label', spec.label)
    fab.setAttribute('title', spec.label)
    if (!fab.__mateuKeys) {
      fab.__mateuKeys = true
      fab.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          fab.click()
        }
      })
    }
    icon.setAttribute('aria-label', spec.label)
    icon.classList.remove(SHELL_CHAT_GLYPH, BRANDED_CLASS)
    if (icon.__mateuGlyph) icon.classList.remove(icon.__mateuGlyph)
    icon.__mateuGlyph = null
    const old = icon.querySelector(`.${MARK_CLASS}`)
    if (old) old.remove()
    if (spec.kind === 'glyph') {
      icon.classList.add(spec.glyph)
      icon.__mateuGlyph = spec.glyph
      return true
    }
    const mark = icon.ownerDocument.createElement(spec.kind === 'image' ? 'img' : 'span')
    mark.className = `${MARK_CLASS} ${MARK_CLASS}-${spec.kind}`
    mark.setAttribute('aria-hidden', 'true')
    if (spec.kind === 'image') {
      mark.setAttribute('alt', '')
      mark.setAttribute('src', spec.src)
    } else {
      mark.textContent = spec.text
    }
    icon.classList.add(BRANDED_CLASS)
    icon.appendChild(mark)
    return true
  }


  // poc/chat.mjs — núcleo de transporte del CHAT de IA, renderer-neutral (paridad Redwood/VB).
  //
  // El chat compartido (libs/mateu/.../mateu-chat.ts, ~939 líneas) mezcla transporte y UI de Lit. Para
  // llevarlo a VB "apoyándonos en VB al máximo" (la UI la pone un componente de conversación de JET, no
  // dibujada a mano), lo que se comparte es SOLO la lógica de transporte: construir el body, elegir la
  // URL (agente local vs sseUrl), aplanar el menú como contexto, discriminar cada payload `data:` y
  // acumular el texto del asistente. Ese núcleo va aquí — probado en Node (poc/test.mjs) — y el bucle
  // de streaming acepta un `fetchImpl` inyectable para no tocar globals. Es la capa "lógica" del
  // roadmap; el panel VB (gate visual) la consume. Sin imports: se concatena en el bundle AMD.

  /** Discrimina un payload `data:` que es un objeto de uso de tokens ({inputTokens|outputTokens|totalTokens}). */
  function tryParseTokenUsage(payload) {
    const trimmed = (payload || '').trim()
    if (!trimmed.startsWith('{')) return null
    try {
      const obj = JSON.parse(trimmed)
      if ('inputTokens' in obj || 'outputTokens' in obj || 'totalTokens' in obj) return obj
    } catch {
      // no es JSON válido
    }
    return null
  }

  /** Discrimina un payload `data:` que es un evento personalizado del agente ({event, detail}). */
  function tryParseCustomEvent(payload) {
    const trimmed = (payload || '').trim()
    if (!trimmed.startsWith('{')) return null
    try {
      const obj = JSON.parse(trimmed)
      if (typeof obj.event === 'string') return { event: obj.event, detail: obj.detail ?? {} }
    } catch {
      // no es JSON válido
    }
    return null
  }

  /** Aplana el menú al contexto que recibe el LLM (solo en el primer mensaje). Misma forma que
   *  `MenuContextEntry` del chat compartido: breadcrumb `path` + objeto `navigation`. Salta
   *  separadores y entradas remotas aún sin resolver (su ruta apunta al loader, no a una pantalla). */
  function buildChatMenuContext(options, parentPath = []) {
    const result = []
    for (const opt of options || []) {
      if (opt.separator) continue
      if (opt.remote) continue
      const path = [...parentPath, opt.label]
      if (opt.submenus && opt.submenus.length > 0) {
        result.push(...buildChatMenuContext(opt.submenus, path))
      } else {
        const entry = {
          path,
          navigation: {
            route: opt.route,
            consumedRoute: opt.consumedRoute,
            actionId: opt.actionId ?? '',
            baseUrl: opt.baseUrl,
            serverSideType: opt.serverSideType,
            uriPrefix: opt.uriPrefix,
          },
        }
        if (opt.description) entry.description = opt.description
        result.push(entry)
      }
    }
    return result
  }

  /** La URL efectiva del stream: el agente local si respondió a /health, si no el `sseUrl` del wire. */
  function effectiveChatUrl({ localAgentAlive, localAgentUrl, sseUrl }) {
    return localAgentAlive && localAgentUrl ? localAgentUrl + '/mateu/agent/stream' : sseUrl
  }

  /** El body del POST del chat. `menuContext` solo viaja en el primer mensaje (lo decide el llamante). */
  function buildChatBody({ message, sessionId, attachments, context, mcpUrl, menuContext, currentRoute }) {
    return {
      message: message ?? '',
      sessionId,
      // la ruta de la pantalla desde la que se pregunta: las reglas de enrutado del plano de control
      // eligen el agente por ella
      ...(currentRoute ? { currentRoute } : {}),
      ...(attachments && attachments.length ? { attachments } : {}),
      ...(context !== undefined && context !== null ? { context } : {}),
      ...(mcpUrl ? { mcpUrl } : {}),
      ...(menuContext && menuContext.length ? { menuContext } : {}),
    }
  }

  /** Sube ficheros al endpoint de `@AI(upload=…)` como multipart; devuelve los `{name, path}` guardados. */
  async function uploadChatFiles({ uploadUrl, files, sessionId, headers = {}, fetchImpl = globalThis.fetch, FormDataImpl = globalThis.FormData }) {
    const form = new FormDataImpl()
    for (const f of files || []) form.append('files', f)
    if (sessionId) form.append('sessionId', sessionId)
    const response = await fetchImpl(uploadUrl, { method: 'POST', headers, body: form })
    if (!response.ok) throw new Error(`Upload failed: ${response.status}`)
    const result = await response.json()
    return ((result && result.files) || []).filter((f) => f && f.path)
  }

  /**
   * Postea un mensaje al stream del chat y consume la respuesta SSE. Idéntico al bucle del chat
   * compartido: parte por líneas, cada `data:` es uso de tokens, un evento personalizado, o texto que
   * se ACUMULA en el mensaje del asistente. `agent-error` se muestra como el texto del asistente.
   * Devuelve el texto acumulado. `fetchImpl` es inyectable para tests.
   *
   * @param onText   (accumulatedText) => void   — en cada trozo de texto (para repintar el mensaje)
   * @param onEvent  ({event, detail}) => void   — evento personalizado del agente (≠ agent-error)
   * @param onUsage  (usage) => void             — objeto de uso de tokens
   */
  async function streamChat({ url, body, headers = {}, fetchImpl = globalThis.fetch, onText, onEvent, onUsage }) {
    const response = await fetchImpl(url, {
      method: 'POST',
      headers: { Accept: 'text/event-stream', 'Content-Type': 'application/json', ...headers },
      body: typeof body === 'string' ? body : JSON.stringify(body),
    })
    if (!response.ok) {
      const errorText = response.text ? await response.text() : ''
      throw new Error(`Servidor respondió ${response.status}: ${errorText}`)
    }
    const reader = response.body && response.body.getReader ? response.body.getReader() : null
    if (!reader) throw new Error('No se pudo obtener el reader del stream.')

    const decoder = new TextDecoder()
    let buffer = ''
    let accumulated = ''

    const handlePayload = (payload) => {
      const usage = tryParseTokenUsage(payload)
      const customEvent = !usage && tryParseCustomEvent(payload)
      if (usage) {
        if (onUsage) onUsage(usage)
      } else if (customEvent) {
        if (customEvent.event === 'agent-error') {
          accumulated = '⚠️ ' + ((customEvent.detail && customEvent.detail.message) || 'Error desconocido del agente')
          if (onText) onText(accumulated)
        } else if (onEvent) {
          onEvent(customEvent)
        }
      } else {
        accumulated += payload
        if (onText) onText(accumulated)
      }
    }

    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        if (buffer.trim().startsWith('data:')) handlePayload(buffer.trim().slice(5).trim())
        break
      }
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''
      for (const line of lines) {
        if (line.trim().startsWith('data:')) handlePayload(line.trim().slice(5).trim())
      }
    }
    return accumulated
  }

  // los grids embebidos necesitan un data provider de JET; el core es agnóstico y lo recibe
  setDataProviderFactory((rows) => new ArrayDataProvider(rows || [], { keyAttributes: '_rowNumber' }));
  // el editor de cada filtro del buscador (smartFilters.filtersMetadata): oj-dynamic se carga
  // sólo cuando un listado declara filtros
  setMetadataProviderFactory((data) => new Promise((resolve, reject) => {
    require(['oj-dynamic/providers/JsonMetadataProvider'], (JsonMetadataProvider) => {
      resolve(new JsonMetadataProvider({ data }));
    }, reject);
  }));

  return {
    HOST_ID,
    mountElements,
    mountElementsSoon,
    elementAtomsOf,
    reduceContexts,
    collectFields,
    collectActions,
    collectIslands,
    mediatorOf,
    buildOverlay,
    dynFormMetadataOf,
    actionsOf,
    summarizeHost,
    findByType,
    listingOf,
    // selección de filas del listing → crud_selected_items de las acciones del host
    selectionOfKeySet,
    selectedRowsOf,
    withListingSelection,
    onLoadTriggers,
    // filtros del listado: descriptores ya resueltos a widget, y la config smartFilters de la
    // cabecera del buscador (sugerencias, aplicados y editores) con su vuelta a estado Mateu
    filterChipsOf,
    multiValuesOf,
    smartFiltersOf,
    filterStateOfSmartFilters,
    fieldListOf,
    secondaryActionOf,
    formSectionsOf,
    // el paso de un wizard: contenido + campos (cada uno una vez) + el pie Back/Next
    wizardStepViewOf,
    isRichAtom,
    // editor de filas modal de una lista del formulario (@DetailFormCustomisation modal)
    listActionOf,
    listActionRequestOf,
    rowEditorOf,
    rowFieldsOf,
    validateRow,
    pendingLookupsOf,
    lookupRequestOf,
    ROW_VALIDATING_VERBS,
    overlayOf,
    eventTriggersOf,
    dismissOverlay,
    shellNavOf,
    ojIconOf,
    longTaskWatcher,
    findAllByType,
    cardOf,
    welcomeOf,
    generalOverviewOf,
    itemOverviewOf,
    itemOverviewPageOf,
    autoSaveOf,
    taskQueueOf,
    emptyStateOf,
    interpolate,
    islandContentOf,
    mergeNestedContent,
    hostContentOf,
    wizardForwardOf,
    bannersOf,
    pageStyleOf,
    pageToolbarOf,
    primaryToolbarButton,
    backToolbarButton,
    entityHeaderOf,
    collectTexts,
    foldoutOf,
    wizardOf,
    callMateu,
    bootstrapShell,
    loadRoute,
    loadRouteInto,
    composeInnerRoute,
    routeFlipOf,
    // menús federados: la shell los expande al arrancar, la navegación consulta a qué pod ir
    expandRemoteMenus,
    remoteRouteOf,
    registerRemoteRoute,
    baseOf,
    // widgets de cabecera del App: área de perfil (usermenu) + zona de acciones, remotos vivos
    headerWidgetsOf,
    // el FAB de "ask" del shell: su marca (Ask Oracle por defecto, o la del @App) y su nombre
    askFabOf,
    brandAskFab,
    startRemoteWidget,
    stopRemoteWidgets,
    mountHeaderHtml,
    mountHeaderHtmlSoon,
    redwoodHtmlOf,
    runMateuAction,
    runMateuActionSse,
    // resiliencia: la app las usa para pintar el estado de carga, la banda de sin-conexión
    // y el mensaje de error ya traducido
    classifyRequestFailure,
    isIdempotentAction,
    connectivity,
    pendingActions,
    setTransportHooks,
    authHeadersOf,
    DEFAULT_TIMEOUT_MS,
    // static bundle: la shell carga el manifest al arrancar; loadRoute responde desde él sin backend
    loadBundleManifest,
    hasBundle,
    awaitBundle,
    // accesibilidad: lo que los componentes oj-* no traen (una SPA no cambia de página, así
    // que no hay nada que un lector de pantalla anuncie por su cuenta)
    installAnnouncer,
    announce,
    announceNavigation,
    focusContent,
    focusContentSoon,
    mountSkipLink,
    resetNavigationState,
    markPending,
    clearPending,
    pressedControl,
    trackPressedControls,
    markPressedControlBusy,
    clearPressedControlBusy,
    setLastRetry,
    hasLastRetry,
    takeLastRetry,
    // chat de IA: el panel de conversación (sseUrl) usa estas para POSTear y consumir el stream
    effectiveChatUrl,
    buildChatBody,
    buildChatMenuContext,
    streamChat,
    uploadChatFiles,
  };
});
