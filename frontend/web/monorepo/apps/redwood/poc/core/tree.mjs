import { islandContentOf, subresourceIslandOf, inlineIslandOf, editorNodeIds } from './content.mjs'
import { fieldWidgetOf, isExtraLayoutField, isListingOverlay, plainValueOf } from './rowEditor.mjs'
import { findFirst } from './listing.mjs'
// Part of the Redwood core (reduceContexts.mjs re-exports every piece): the component tree: walks, fields, actions, islands, overlays, texts.

export const HOST_ID = '__root__'

/** A walk that does NOT cross island boundaries: an INNER ServerSide is another surface
 *  (its fields/actions belong to its own context, not to the host). */
export function walkWithinSurface(node, visit) {
  const walk = (n, isRoot) => {
    if (!n || typeof n !== 'object') return
    if (!isRoot && n.type === 'ServerSide') return // island boundary: stop
    visit(n)
    for (const [k, v] of Object.entries(n)) {
      // the page header's record/context switcher (Page.metadata.switcher) is header chrome, not
      // content: its actionId + label made a stray «Customer» button in the form's action row. A
      // YAML page authors the same header on its `type: Form` (and its FABs: chrome, not row buttons)
      if (k === 'switcher' && (n.type === 'Page' || n.type === 'Form')) continue
      if (k === 'fabs' && n.type === 'Form') continue
      // nor are an EntityHeader's facts: one with an action ({label, value, actionId}) has a
      // button's shape, and «BALANCE» and «EMPRESA» showed up again as a row under the content —
      // the header draws their actions beside their values (factActions)
      if (k === 'facts' && n.type === 'EntityHeader') continue
      if (Array.isArray(v)) v.forEach((x) => walk(x, false))
      else if (v && typeof v === 'object') walk(v, false)
    }
  }
  walk(node, true)
}

/** The node id of every metadata object of the tree (metadata → its node's id), for the visual
 *  editor's canvas: the fields and the buttons are collected as their METADATA, and what the
 *  editor selects is the node. Only asked for in editor mode (setEditorNodeIds). */
export function ownerIdsOf(tree) {
  const ids = new Map()
  walkWithinSurface(tree, (n) => { if (n.metadata && typeof n.metadata === 'object' && n.id) ids.set(n.metadata, String(n.id)) })
  return ids
}

/** RENDER helper: collects the surface's FormFields (without crossing islands). */
export function collectFields(node, out = []) {
  walkWithinSurface(node, (n) => { if (n.fieldId) out.push(n) })
  return out
}

/** RENDER helper: collects the surface's buttons/actions (without crossing islands). */
export function collectActions(node, out = []) {
  walkWithinSurface(node, (n) => { if (n.actionId && n.label && !n.fieldId) out.push(n) })
  return out
}

/** Embedded island boundaries — TWO flavours confirmed on the real wire:
 *  (a) INNER ServerSide nodes (own id, e.g. '_guestNote');
 *  (b) ClientSide App variant=MEDIATOR nodes with a stable id (e.g.
 *      'island_checkin_st_maria') whose OWN metadata carries homeRoute
 *      (?_embeddedMediator=1) + homeConsumedRoute + homeServerSideType —
 *      the front-office TaskQueue detail arrives like this. */
export function collectIslands(tree, out = []) {
  const walk = (node, isRoot) => {
    if (!node || typeof node !== 'object') return
    if (!isRoot && node.type === 'ServerSide') {
      // a @Subresource is not the screen's island: loadSubresources loads it when it comes into
      // view (see subresourceIslandOf); nor is an INLINE island (a component field with its own
      // ServerSide, tree included): it is another surface, painted in its slot (inlineIslandOf)
      if (!subresourceIslandOf(node) && !inlineIslandOf(node)) out.push(node)
      return // its children belong to the island, not the host
    }
    if (!isRoot && node.type === 'ClientSide' && node.id && node.metadata
        && node.metadata.type === 'App' && node.metadata.variant === 'MEDIATOR') {
      out.push({
        id: node.id,
        route: node.metadata.homeRoute,
        consumedRoute: node.metadata.homeConsumedRoute || node.metadata.homeRoute,
        serverSideType: node.metadata.homeServerSideType,
        // the CONTEXT seeded by the host (stayId, paxIndex…): it must travel as
        // componentState in the island's initial load (mateu-ux.initialState)
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

/** RENDER helper: FormField[] of the tree → oj-dyn-form metadata (field → meta map).
 *  null if the tree has no fields (page without a form). */
export function dynFormMetadataOf(tree) {
  const NUMERIC = ['integer', 'int', 'long', 'number', 'double', 'float', 'money']
  const metadata = {}
  for (const f of collectFields(tree)) {
    if (!f.dataType || metadata[f.fieldId]) continue // duplicates = FormRow references
    // a LIST (form grid) is not a text field: the content paints it as a table
    // (a multi-id @Searchable IS a field: its chips)
    // a list is a table (not a field) except @Searchable and multiple-choice ones
    if ((f.dataType === 'array' && f.stereotype !== 'searchable' && !isExtraLayoutField(f)) || (f.columns || []).length) continue
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

/** RENDER helper: the tree's unique buttons. chroming comes PRECOMPUTED (VB bindings
 *  must stay simple paths: a ternary in an attribute breaks the CSP evaluation
 *  of ALL the element's properties). */
export function actionsOf(tree) {
  const seen = {}
  const out = []
  const ids = editorNodeIds ? ownerIdsOf(tree) : null
  for (const a of collectActions(tree)) {
    if (seen[a.actionId]) continue
    seen[a.actionId] = true
    out.push({
      actionId: a.actionId,
      label: a.label,
      style: a.buttonStyle || 'outlined',
      chroming: a.buttonStyle === 'primary' ? 'callToAction' : 'outlined',
      parameters: a.parameters || {},
      // shown but inert (a Toggle.disabled wizard/crud button): the oj-button's disabled
      disabled: !!a.disabled,
      // a RouteLink button navigates (see content.mjs buttonOf)
      ...(a.route ? { route: a.route } : {}),
      ...(ids && ids.get(a) ? { nodeId: ids.get(a) } : {}),
    })
  }
  return out
}

/** RENDER helper: list of fields for the widgetFor switch (isText/isNumber/isBoolean/
 *  isSelect/isDate/isDateTime PRECOMPUTED — VB bindings must be simple paths), with the
 *  value taken from the state. It is the SAME widget resolution as the row editor
 *  (fieldWidgetOf): a select with options (options/OptionsSupplier/enum) is painted as
 *  oj-select-one and a date as oj-input-date also in the page form, the drawer
 *  and the island, not only in the row dialog. A REMOTE lookup with no options yet stays
 *  as text: nobody launches its search here (only the row editor does). */
export function fieldListOf(tree, state, data) {
  if (!dynFormMetadataOf(tree)) return []
  const s = state || {}
  const seen = {}
  const out = []
  const ids = editorNodeIds ? ownerIdsOf(tree) : null
  for (const f of collectFields(tree)) {
    if (!f.dataType || seen[f.fieldId]) continue
    seen[f.fieldId] = true
    // a list is a table (not a field) except @Searchable and multiple-choice ones
    if ((f.dataType === 'array' && f.stereotype !== 'searchable' && !isExtraLayoutField(f)) || (f.columns || []).length) continue
    // the detail view of a @Searchable arrives as `<campo>-label`: its text travels in data
    const raw = s[f.fieldId] == null && f.stereotype === 'searchable' && data ? data[f.fieldId] : s[f.fieldId]
    // a REMOTE lookup is a dropdown here too: the chain loads its options
    // (bridge.loadLookups) when the screen opens, like the row editor's
    const widget = fieldWidgetOf(f, data, { lookups: true, value: raw, textWhenEmpty: true })
    let value = raw == null ? null : (widget.isSelect ? plainValueOf(raw) : raw)
    if (widget.isMultiSelect || widget.isCheckboxSet)
      value = Array.isArray(raw) ? raw.map((v) => plainValueOf(v)) : (raw == null || raw === '' ? [] : String(raw).split(','))
    else if (widget.isMoney) {
      // an Amount travels as {currency, value, locale}: the input shows its number
      const n = raw != null && typeof raw === 'object' && !Array.isArray(raw) ? raw.value : raw
      value = n == null || n === '' || Number.isNaN(Number(n)) ? null : Number(n)
    }
    out.push({ ...widget, value, ...(ids && ids.get(f) ? { nodeId: ids.get(f) } : {}) })
  }
  return out
}

/** Is this node a form SECTION (@Section)? The wire sends it as a Card with the
 *  mateu-section class, its title in a header Text (h3) and its fields in a FormLayout. */
export function isSectionNode(n) {
  return !!(n && n.metadata && n.metadata.type === 'Card' && /(^|\s)mateu-section(\s|$)/.test(n.cssClasses || ''))
}

/** A section's title and columns: the first header Text and the first FormLayout
 *  of ITS content (without descending into a nested section or another island). */
export function sectionHeadOf(card) {
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
  return { title, columns: columns > 0 ? Math.min(columns, 4) : 1, declaredColumns: columns > 0 }
}

/**
 * The buttons a SECTION carries (@Section(editAction, addAction, viewMoreAction), an @Inline type's
 * @Toolbar/@Button): those in the title row (the HorizontalLayout holding the section's heading)
 * stay beside the title, the rest go under the section's content — they belong to the section,
 * not to the form's action row. Not crossing a nested section or an island.
 */
export function sectionButtonsOf(card) {
  const titleButtons = []
  const footerButtons = []
  const isHeading = (k) => !!(k && k.metadata && k.metadata.type === 'Text' && /^h[1-6]$/.test(k.metadata.container || ''))
  const buttonOf = (m) => ({
    actionId: m.actionId,
    label: m.label || m.actionId,
    // tertiary (the affordances) = JET borderless
    chroming: m.buttonStyle === 'primary' ? 'callToAction' : m.buttonStyle === 'tertiary' ? 'borderless' : 'outlined',
    disabled: !!m.disabled,
    parameters: m.parameters || {},
    // a RouteLink button navigates (see content.mjs buttonOf)
    ...(m.route ? { route: m.route } : {}),
  })
  const walk = (n, isRoot, inTitleRow) => {
    if (!n || typeof n !== 'object') return
    if (Array.isArray(n)) { n.forEach((x) => walk(x, false, inTitleRow)); return }
    if (!isRoot && (n.type === 'ServerSide' || isSectionNode(n))) return
    const md = n.metadata
    if (md && md.type === 'Button' && md.actionId) {
      (inTitleRow ? titleButtons : footerButtons).push(buttonOf(md))
      return
    }
    const titleRow = !!(md && md.type === 'HorizontalLayout' && (n.children || []).some(isHeading))
    for (const [k, v] of Object.entries(n)) {
      if (k === 'metadata' && md) {
        for (const mv of Object.values(md)) if (mv && typeof mv === 'object') walk(mv, false, inTitleRow || titleRow)
        continue
      }
      if (v && typeof v === 'object') walk(v, false, inTitleRow || titleRow)
    }
  }
  walk(card, true, false)
  return { titleButtons, footerButtons }
}

/**
 * The columns of a field group in a FULL-WIDTH form (page, wizard): the declared ones
 * (FormLayout maxColumns, @Section(columns)) or, when undeclared, two — the default split
 * of Vaadin's FormLayout on desktop. oj-form-layout lowers them by itself only when they don't fit
 * (each column asks for at least 18rem), so on a phone it is one again.
 */
export function wideColumnsOf(section) {
  return section.declaredColumns ? section.columns : 2
}

/** The columns of a layout grouping loose fields (formSectionsOf byLayout): a FormLayout its
 *  maxColumns (undeclared without one), a HorizontalLayout one per field of the row — at most 4,
 *  like a section. */
export function layoutColumnsOf(layout, byId) {
  const md = layout.metadata || {}
  if (md.type === 'FormLayout') {
    const declared = md.maxColumns || md.columns || 0
    return { columns: declared > 0 ? Math.min(declared, 4) : 1, declaredColumns: declared > 0 }
  }
  const ids = new Set()
  const count = (n) => {
    if (!n || typeof n !== 'object' || n.type === 'ServerSide') return
    if (n.fieldId && byId[n.fieldId]) ids.add(n.fieldId)
    for (const v of Object.values(n)) {
      if (Array.isArray(v)) v.forEach(count)
      else if (v && typeof v === 'object') count(v)
    }
  }
  count(layout)
  return { columns: Math.max(1, Math.min(ids.size, 4)), declaredColumns: true }
}

/**
 * RENDER helper: the form fields GROUPED by their sections (@Section), in
 * wire order → [{ key, title, hasTitle, columns, fields }]. Fields outside any
 * section go to an untitled group; a form without sections is ONE untitled group, so
 * the template always paints sections → fields. [] if the tree has no form.
 */
export function formSectionsOf(tree, state, data, opts = {}) {
  const fields = fieldListOf(tree, state, data)
  if (!fields.length) return []
  const byId = {}
  for (const f of fields) byId[f.fieldId] = f
  const sections = []
  const placed = {}
  let loose = null
  // opts.byLayout (an overlay's content, where fields arrive placed by hand — a HorizontalLayout
  // row, a FormLayout with maxColumns — instead of a form's sections): fields outside any section
  // are grouped by their NEAREST layout, which gives the group its columns
  const layoutGroups = new Map()
  const isLayout = (n) => !!(opts.byLayout && n.metadata
    && (n.metadata.type === 'FormLayout' || n.metadata.type === 'HorizontalLayout'))
  const walk = (n, isRoot, section, layout) => {
    if (!n || typeof n !== 'object') return
    if (!isRoot && n.type === 'ServerSide') return // island boundary: its fields are not ours
    let here = section
    if (isSectionNode(n)) {
      // its @Section affordances are oj-sp-section's own (add / edit / view more): out of its buttons
      const affordances = sectionAffordancesOf(n)
      const buttons = sectionButtonsOf(n)
      const ids = new Set(affordances.drawn)
      here = { key: 's' + sections.length, ...sectionHeadOf(n),
        titleButtons: buttons.titleButtons.filter((x) => !ids.has(x.actionId)),
        footerButtons: buttons.footerButtons.filter((x) => !ids.has(x.actionId)),
        sectionActions: affordances, fields: [] }
      sections.push(here)
    }
    const lay = !here && isLayout(n) ? n : layout
    if (n.fieldId && byId[n.fieldId] && !placed[n.fieldId]) {
      placed[n.fieldId] = true
      if (here) {
        here.fields.push(byId[n.fieldId])
      } else if (lay) {
        let group = layoutGroups.get(lay)
        if (!group) {
          group = { key: 's' + sections.length, title: '', ...layoutColumnsOf(lay, byId), titleButtons: [], footerButtons: [], fields: [] }
          layoutGroups.set(lay, group)
          sections.push(group)
        }
        group.fields.push(byId[n.fieldId])
      } else {
        if (!loose || sections[sections.length - 1] !== loose) {
          loose = { key: 's' + sections.length, title: '', columns: 1, declaredColumns: false, titleButtons: [], footerButtons: [], fields: [] }
          sections.push(loose)
        }
        loose.fields.push(byId[n.fieldId])
      }
    }
    for (const v of Object.values(n)) {
      if (Array.isArray(v)) v.forEach((x) => walk(x, false, here, lay))
      else if (v && typeof v === 'object') walk(v, false, here, lay)
    }
  }
  walk(tree, true, null, null)
  // a form without its own FormLayout (the loose fields of a ServerSide) takes its columns
  // from the root FormLayout, if there is one
  const rootColumns = sectionHeadOf(tree)
  return sections
    .filter((sec) => sec.fields.length)
    .map((sec) => {
      const head = !sec.declaredColumns && rootColumns.declaredColumns ? { ...sec, columns: rootColumns.columns, declaredColumns: true } : sec
      // (a field's @Colspan is not applied: of the classic oj-form-layout's children only
      // oj-label-value has colspan, and wrapping the control in one misaligns the grid)
      return { ...head, hasTitle: !!sec.title, wideColumns: wideColumnsOf(head),
        sectionActions: sec.sectionActions || NO_SECTION_AFFORDANCES,
        hasTitleButtons: !!(sec.titleButtons && sec.titleButtons.length),
        hasFooterButtons: !!(sec.footerButtons && sec.footerButtons.length) }
    })
}

/** Projection of the TOP OVERLAY of the stack (the crud's drawer): title + fields + actions.
 *  null if there are no overlays. Its actions are posted against the HOST (the drawer carries
 *  no ServerSide of its own — confirmed on the wire). */
export function overlayOf(reg) {
  const id = reg.stack && reg.stack.length ? reg.stack[reg.stack.length - 1] : null
  return overlayProjectionOf(reg, id)
}

/** Is this overlay context a Dialog (the decision modal), not a Drawer? */
export function isDialogOverlay(ctx) {
  return !!(ctx && ctx.tree && ctx.tree.metadata && ctx.tree.metadata.type === 'Dialog')
}

/**
 * The top-most DRAWER of the stack (the first non-Dialog overlay from the top), projected — or null.
 * A Dialog opened over a Drawer is painted by the modal, so the drawer panel must keep showing the
 * drawer UNDER it: projecting the top overlay for the panel closed the drawer while the modal was
 * open (its ojBeforeClose then popped the dialog off the stack) and nothing reopened it afterwards.
 */
export function drawerOverlayOf(reg) {
  const stack = (reg && reg.stack) || []
  for (let i = stack.length - 1; i >= 0; i--) {
    const ctx = reg.contexts[stack[i]]
    if (ctx && !isDialogOverlay(ctx)) return overlayProjectionOf(reg, stack[i])
  }
  return null
}

/** The top overlay when it is a Dialog (what the modal shows), else null. */
export function dialogOverlayOf(reg) {
  const id = reg && reg.stack && reg.stack.length ? reg.stack[reg.stack.length - 1] : null
  const ctx = id && reg.contexts ? reg.contexts[id] : null
  return isDialogOverlay(ctx) ? overlayProjectionOf(reg, id) : null
}

/** Pops a given overlay (not necessarily the top one) — the user dismissed THAT panel. */
export function dismissOverlayById(reg, id) {
  if (!id || !reg.contexts || !reg.contexts[id]) return reg
  const contexts = { ...reg.contexts }
  delete contexts[id]
  return { ...reg, contexts, stack: (reg.stack || []).filter((k) => k !== id) }
}

function overlayProjectionOf(reg, id) {
  if (!id || !reg.contexts[id]) return null
  const ctx = reg.contexts[id]
  // display blocks of the drawer content (ResourceGrid/OfferCard/StatusList…):
  // the VB panel paints them with the SAME atoms template as the host — a drawer is not
  // just fields and buttons (e.g. the room picker)
  // the drawer's FormFields are already painted by its FIELDS grammar (oj-form-layout):
  // drop the blocks' isInput atoms or they would come out DUPLICATED (and the user
  // would type into the wrong one of the pair)
  // Redwood drawer guideline: ACTIONS go in the footer bar. A content Button
  // WITHOUT parameters moves to the footer (e.g. Send); those carrying parameters
  // (option lists: payment methods, rooms…) stay in place and are NOT
  // repeated in the footer. In a DIALOG (one-off decision modal) ALL buttons are
  // footer actions — the modal's listener dispatches actionId + parameters, so
  // "Check-in de <nombre>" (with its _item) travels just like "Volver al listado"
  const isDialog = isDialogOverlay(ctx)
  const conParams = (btn) => !!(btn.parameters && Object.keys(btn.parameters).length)
  const keepInContent = isDialog ? () => false : conParams
  // a form EMBEDDED in the overlay (EmbeddedView: its own ServerSide inside the Dialog
  // or the Drawer) is the surface: its fields, its buttons and its texts. Walking the
  // overlay's tree did not find them — the walk does not cross into another ServerSide — and the dialog
  // came out empty.
  const surface = ctx.surface || ctx.tree
  const surfaceCtx = surface === ctx.tree ? ctx : { ...ctx, tree: surface }
  // the overlay's header already shows its title (an EmbeddedView form's TitleSupplier title is
  // both the drawer's title and the form's own heading): the first text repeating it goes
  const overlayTitle = ctx.title || ''
  let titleDropped = false
  const notTheTitle = (a) => {
    if (titleDropped || !overlayTitle || !a.isText || a.text !== overlayTitle) return true
    titleDropped = true
    return false
  }
  const content = (islandContentOf(surfaceCtx) || [])
    .map((block) => ({
      ...block,
      items: block.items
        .filter((a) => !a.isInput && !a.isFormLayout)
        .filter(notTheTitle)
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
  // a LISTING in the overlay (a Listing embedded in a Drawer): the selector's projection draws it
  // (searchPickerOf, inDrawer) — search, columns, pages, row click; walked here as a form, the
  // crud came out as its title and a stray «Id» button
  if (isListingOverlay(ctx)) {
    return {
      id, title: ctx.title || '', subtitle: ctx.subtitle || '', position: ctx.position || 'end',
      width: ctx.width, state: ctx.state || {}, fields: [], sections: [], actions: [], content: [],
      hasContent: false, isDialog, isListing: true, texts: [],
      sp: spectraDrawerOf(ctx, { fields: [], actions: [] }),
    }
  }
  const fields = fieldListOf(surface, ctx.state, ctx.data)
  const actions = actionsOf(surface).filter((a) => !contentActionIds.has(a.actionId))
  // the Spectra drawer template the panel is painted with (spectraDrawerOf): its error banner
  // replaces the danger Notice the crud puts on top of the form, which then leaves the content
  const sp = isDialog ? null : spectraDrawerOf(ctx, { fields, actions })
  const shownContent = sp && sp.errorBanner
    ? content.map((block) => ({ ...block, items: block.items.filter((a) => !(a.isNotice && a.text === sp.errorMessage)) }))
      .filter((block) => block.items.length)
    : content
  return {
    id,
    title: ctx.title || '',
    // the Drawer subtitle (General Drawer: «Room 102 · 12 oct → 14 oct») under the title
    subtitle: ctx.subtitle || '',
    position: ctx.position || 'end',
    width: ctx.width,
    state: ctx.state || {},
    fields,
    // the fields keep the layout they were given: a section's columns, a FormLayout's
    // maxColumns, a HorizontalLayout row (the templates bind max-columns to each group)
    sections: formSectionsOf(surface, ctx.state, ctx.data, { byLayout: true }),
    actions,
    content: shownContent,
    hasContent: !!shownContent.length,
    ...(sp ? { sp } : {}),
    // a Dialog overlay is painted as a MODAL (oj-dialog: one-off decision), not as a
    // drawer (task with a form); texts = its message lines. A dialog showing more than lines (an
    // EntityHeader, a Badge, a Meter, a StatusList…) is painted from its content, in order — the modal
    // drew only the texts and the rest was lost (a drawer already drew them)
    isDialog,
    hasRichContent: isDialog && content.some((block) => block.items.some((a) => !a.isText)),
    texts: isDialog && content.some((block) => block.items.some((a) => !a.isText)) ? [] : withoutFirst(collectTexts(surface), overlayTitle),
  }
}

// ── Spectra drawer templates ────────────────────────────────────────────────────────────────
// A Drawer is painted INSIDE the oj-drawer-popup with one of Spectra's drawer templates (the
// Redwood rule: their template and contract before our own drawing):
//   bottom      → oj-sp-bottom-drawer-template   (DrawerPosition.bottom; collapsible = drawerMode fixed)
//   createEdit  → oj-sp-create-edit-drawer-template (a drawer you TYPE into and save: editable fields
//                 and an action — the crud's editInDrawer, an operation's form)
//   general     → oj-sp-general-drawer-template  (read-only detail: everything else)
// The id of the crud's create/edit drawer and of its refused-save banner (CrudDrawerBuilder).
export const CRUD_DRAWER_ID = 'crud-edit-drawer'
export const CRUD_DRAWER_ERROR_ID = 'crud-drawer-error'
/** The crud drawer's "Save and next" (PersistActionHandler.SAVE_AND_NEXT). */
export const SAVE_AND_NEXT = 'save-and-next'

/** Mateu's DrawerSize (s|m|l|xl) — or, without one, the drawer's CSS width — as Spectra's drawerSize
 *  (sm 29rem · md 40.5rem · lg 60.5rem · xl 90vw): the template sizes itself by class, so a width is
 *  read as the NEAREST standard size (the crud's 36rem → md; no width → sm). */
export function spectraDrawerSize(size, width) {
  const bySize = { s: 'sm', m: 'md', l: 'lg', xl: 'xl', sm: 'sm', md: 'md', lg: 'lg' }
  if (size && bySize[String(size).toLowerCase()]) return bySize[String(size).toLowerCase()]
  const w = String(width || '').trim()
  const m = /^([\d.]+)\s*(rem|em|px|vw|%)?$/.exec(w)
  if (!m) return 'sm'
  const n = parseFloat(m[1])
  const unit = m[2] || 'px'
  if (unit === 'vw' || unit === '%') return n >= 75 ? 'xl' : n >= 55 ? 'lg' : n >= 38 ? 'md' : 'sm'
  const px = unit === 'px' ? n : n * 16
  const sizes = [['sm', 464], ['md', 648], ['lg', 968], ['xl', 1296]]
  return sizes.reduce((best, s) => (Math.abs(s[1] - px) < Math.abs(best[1] - px) ? s : best))[0]
}

/** PeerNav → the templates' previousItem/nextItem ({id, label, display}); a side without a route is
 *  shown DISABLED while the other side exists (Vaadin's rule), none at all → null. The id is the
 *  route, which spPrevious/spNext hand back. */
export function spectraPeersOf(peerNav) {
  const p = peerNav || {}
  if (!p.prevRoute && !p.nextRoute) return { previousItem: null, nextItem: null }
  const side = (route, label) => ({ id: route || '-', label: label || '', display: route ? 'on' : 'disabled' })
  return { previousItem: side(p.prevRoute, p.prevLabel), nextItem: side(p.nextRoute, p.nextLabel) }
}

const isCancelAction = (a) => /^cancel(-|$)/.test(a.actionId || '') && a.actionId !== 'cancel-view'
const isSaveAction = (a) => ['save', 'create'].includes(a.actionId)

/**
 * Projection of a drawer onto its Spectra template (the `sp` of the overlay projection).
 * `parts` = the overlay's own projected fields and footer actions. What the template cannot carry
 * (a third secondary action…) stays in `footerActions`, drawn by our own bar inside its default slot.
 */
export function spectraDrawerOf(ctx, parts) {
  const md = (ctx.tree && ctx.tree.metadata) || {}
  const surface = ctx.surface || ctx.tree
  const actions = parts.actions || []
  const editable = (parts.fields || []).some((f) => !f.readonly)
  const position = ctx.position || md.position || 'end'
  const template = position === 'bottom' ? 'bottom'
    : (ctx.tree && (ctx.tree.id === CRUD_DRAWER_ID || md.id === CRUD_DRAWER_ID)) || (editable && actions.length) ? 'createEdit' : 'general'
  const peers = spectraPeersOf(md.peerNav)
  const base = {
    template,
    isGeneral: template === 'general',
    isCreateEdit: template === 'createEdit',
    isBottom: template === 'bottom',
    // JET's popup docks at the edge the drawer names (a bottom drawer used to open on the right)
    edge: position === 'start' ? 'start' : position === 'bottom' ? 'bottom' : 'end',
    // modeless/layout: no backdrop, the page stays usable (a collapsible bottom drawer is docked)
    modality: md.modeless || md.layout || (template === 'bottom' && md.collapsible) ? 'modeless' : 'modal',
    // a docked bottom drawer is not dismissed by a click on the page it sits under
    autoDismiss: template === 'bottom' && md.collapsible ? 'none' : 'focus-loss',
    size: spectraDrawerSize(md.size || ctx.size, md.width || ctx.width),
    displayOptions: { maximize: md.maximizable ? 'on' : 'off' },
    previousItem: peers.previousItem,
    nextItem: peers.nextItem,
    peerRoutes: !!(peers.previousItem || peers.nextItem),
    hasNavigation: !!(peers.previousItem || peers.nextItem),
    closeAction: { display: 'on' },
    primaryAction: null,
    primaryActionId: '',
    secondaryActions: [],
    secondaryAction: null,
    secondaryActionId: '',
    cancelActionId: '',
    saveAndNextActionId: '',
    errorBanner: false,
    errorMessage: '',
    footerActions: actions,
  }
  if (template === 'bottom') {
    return {
      ...base,
      bottomOptions: { drawerMode: md.collapsible ? 'fixed' : 'closable', title: 'on', maximize: md.maximizable ? 'on' : 'off' },
    }
  }
  if (template === 'general') {
    // footer: the primary (the call-to-action, else the last) and up to two secondaries — more than
    // the template holds keeps our own bar
    if (!actions.length || actions.length > 3) return base
    const primary = actions.find((a) => a.chroming === 'callToAction') || actions[actions.length - 1]
    const rest = actions.filter((a) => a !== primary)
    return {
      ...base,
      primaryAction: { label: primary.label || primary.actionId, display: primary.disabled ? 'disabled' : 'on' },
      primaryActionId: primary.actionId,
      // the footer lays secondaries out REVERSED: handed reversed, they read in the wire's order
      secondaryActions: rest.map((a) => ({ id: a.actionId, label: a.label || a.actionId, display: a.disabled ? 'disabled' : 'on' })).reverse(),
      footerActions: [],
    }
  }
  // createEdit: Cancel is the template's own button (spCancel → the form's cancel action), the save is
  // its primary; "Save and next" turns the primary into Spectra's «Save and next / Save and close»
  const cancel = actions.find(isCancelAction)
  const saveAndNext = actions.find((a) => a.actionId === SAVE_AND_NEXT && !a.disabled)
  const others = actions.filter((a) => a !== cancel && a.actionId !== SAVE_AND_NEXT)
  const primary = others.find(isSaveAction) || others.find((a) => a.chroming === 'callToAction') || others[others.length - 1]
  const rest = others.filter((a) => a !== primary)
  const errorNotice = findFirst(surface, (n) => n.id === CRUD_DRAWER_ERROR_ID)
    || (surface !== ctx.tree ? findFirst(ctx.tree, (n) => n.id === CRUD_DRAWER_ERROR_ID) : null)
  // without arrows of its own the footer still says «Save and next» when the crud offers it: a
  // nextItem WITHOUT id opens the template's navigation footer and draws no header arrow
  const nextItem = base.nextItem || (saveAndNext ? { label: saveAndNext.label || '', display: 'on' } : null)
  return {
    ...base,
    nextItem,
    hasNavigation: !!(base.previousItem || nextItem),
    primaryAction: primary ? { label: primary.label || primary.actionId, display: primary.disabled ? 'disabled' : 'on' } : null,
    primaryActionId: primary ? primary.actionId : '',
    secondaryAction: rest.length === 1 ? { label: rest[0].label || rest[0].actionId, display: rest[0].disabled ? 'disabled' : 'on' } : null,
    secondaryActionId: rest.length === 1 ? rest[0].actionId : '',
    cancelActionId: cancel ? cancel.actionId : '',
    saveAndNextActionId: saveAndNext ? saveAndNext.actionId : '',
    errorBanner: !!errorNotice,
    errorMessage: errorNotice ? String((errorNotice.metadata && errorNotice.metadata.text) || '') : '',
    footerActions: rest.length > 1 ? rest : [],
  }
}

/** The listing rows around the record a crud drawer edits (by its `id`), as the create-edit template's
 *  previous/next items — so its arrows and «Save and next» walk the rows on screen. A drawer with
 *  arrows of its own (peerNav), a new record or a record not on this page keeps what it had. */
export function withListingPeers(drawer, rows) {
  const sp = drawer && drawer.sp
  if (!sp || !sp.isCreateEdit || sp.peerRoutes || !sp.saveAndNextActionId) return drawer
  const id = drawer.state && drawer.state.id
  const list = (rows || []).filter((r) => r && !r._group && r.id != null)
  const at = id == null ? -1 : list.findIndex((r) => String(r.id) === String(id))
  if (at < 0) return drawer
  const labelOf = (r) => {
    const v = [r.name, r.title, r.label].find((x) => typeof x === 'string' && x)
    return v || String(r.id)
  }
  const prev = list[at - 1]
  const next = list[at + 1]
  return {
    ...drawer,
    sp: {
      ...sp,
      previousItem: prev ? { id: String(prev.id), label: labelOf(prev), display: 'on' } : { id: '-', label: '', display: 'disabled' },
      nextItem: next ? { id: String(next.id), label: labelOf(next), display: 'on' } : { id: '-', label: sp.nextItem ? sp.nextItem.label : '', display: 'disabled' },
      hasNavigation: true,
      listingPeers: true,
    },
  }
}

/** `list` without the first entry equal to `value` (none when value is blank). */
function withoutFirst(list, value) {
  const i = value ? list.indexOf(value) : -1
  return i < 0 ? list : list.slice(0, i).concat(list.slice(i + 1))
}

/** Watcher of a LongTask's progress dialog over the SSE stream: consumes the Add of the
 *  Dialog-with-ProgressBar and the state-only fragments targeted at its id; returns events
 *  {kind: open|progress, title?, text?, value?, rest} so the chain paints the
 *  oj-dialog — `rest` carries the increment's commands/messages (the last one brings them:
 *  the refresh dispatchEvent) WITHOUT the dialog fragment, ready to reduce. */
export function longTaskWatcher() {
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

/** RENDER helper: collects the texts (metadata.type Text) of a subtree. */
export function collectTexts(node, out = []) {
  if (!node || typeof node !== 'object') return out
  if (node.metadata && node.metadata.type === 'Text' && node.metadata.text != null) {
    out.push(node.metadata.text)
  }
  // a Markdown (the Welcome tiles') is text too — as plain text, its markup dropped: the tiles
  // used to show their titles only
  if (node.metadata && node.metadata.type === 'Markdown' && node.metadata.markdown) {
    out.push(String(node.metadata.markdown).replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/[*_`#>]/g, '').trim())
  }
  for (const v of Object.values(node)) {
    if (Array.isArray(v)) v.forEach((x) => collectTexts(x, out))
    else if (v && typeof v === 'object') collectTexts(v, out)
  }
  return out
}

/** A group with no @Section of its own: no affordances. */
const NO_SECTION_AFFORDANCES = { primary: { type: 'edit', display: 'off' }, primaryAction: null,
  viewMore: 'off', viewMoreAction: null, drawn: [], any: false }

/** The id prefix the server gives each @Section affordance button (SectionAffordances.java). */
const SECTION_AFFORDANCES = { 'section-add-': 'add', 'section-edit-': 'edit', 'section-view-more-': 'viewMore' }

/**
 * A section card's affordances, as oj-sp-section takes them. The component has ONE primary action,
 * of type `edit` or `add` (both fire spPrimaryAction), and its own «View more» (spViewMoreAction):
 * @Section(editAction) is the primary when declared, else @Section(addAction); when a section
 * declares both, its add stays one of its own title buttons (it is not in `drawn`). Returns
 * `primary` ({ type, display }), `primaryAction` / `viewMoreAction` ({ actionId, parameters } or
 * null), `viewMore` ('on' | 'off') and `drawn` — the action ids the section draws itself. Not
 * crossing a nested section or an island.
 */
export function sectionAffordancesOf(card) {
  const found = { add: null, edit: null, viewMore: null }
  const walk = (n, isRoot) => {
    if (!n || typeof n !== 'object') return
    if (Array.isArray(n)) { n.forEach((x) => walk(x, false)); return }
    if (!isRoot && (n.type === 'ServerSide' || isSectionNode(n))) return
    const md = n.metadata
    if (md && md.type === 'Button' && md.actionId) {
      const id = String(n.id || md.id || '')
      for (const [prefix, kind] of Object.entries(SECTION_AFFORDANCES)) {
        if (id.startsWith(prefix) && !found[kind]) found[kind] = { actionId: md.actionId, parameters: md.parameters || {} }
      }
      return
    }
    for (const [k, v] of Object.entries(n)) if (k !== 'metadata' || (v && typeof v === 'object')) walk(v, false)
  }
  walk(card, true)
  const primaryAction = found.edit || found.add
  const drawn = []
  for (const action of [primaryAction, found.viewMore]) if (action) drawn.push(action.actionId)
  return {
    primary: { type: found.edit ? 'edit' : 'add', display: primaryAction ? 'on' : 'off' },
    primaryAction,
    viewMore: found.viewMore ? 'on' : 'off',
    viewMoreAction: found.viewMore,
    drawn,
    any: drawn.length > 0,
  }
}

/** The section's body without the affordance buttons the oj-sp-section draws itself; a button row
 *  or a title row left with nothing in it goes. */
export function withoutSectionAffordances(items, affordances) {
  if (!affordances || !affordances.any) return items
  const ids = new Set(affordances.drawn)
  const out = []
  for (const atom of items || []) {
    if (atom && atom.isRow) {
      const rest = (atom.items || []).filter((i) => !(i && i.rowButton && ids.has(i.actionId)))
      if (rest.length) out.push(rest.length === atom.items.length ? atom : { ...atom, items: rest })
    } else if (atom && atom.isButtons) {
      const rest = (atom.buttons || []).filter((b) => !(b && ids.has(b.actionId)))
      if (rest.length) out.push(rest.length === atom.buttons.length ? atom : { ...atom, buttons: rest })
    } else out.push(atom)
  }
  return out
}
