import { HOST_ID, collectFields } from './tree.mjs'
import { findByType, findFirst } from './listing.mjs'
import { applyOverlayEvent } from './rowEditor.mjs'
import { literalText } from './content.mjs'
// Part of the Redwood core (reduceContexts.mjs re-exports every piece): the reducer: increments → contexts/stack/shell, mediators, overlays.

/** OnLoad triggers of the context (e.g. the listing fires 'search' on load). */
export function onLoadTriggers(ctx) {
  const ids = ((ctx && ctx.tree && ctx.tree.triggers) || [])
    // the ones with a delay (periodic refresh) are scheduled by polling.mjs, not launched now
    .filter((t) => t.type === 'OnLoad' && t.actionId && !(t.timeoutMillis > 0))
    .map((t) => t.actionId)
  // a listing reading its rows from a REST source (rowsSource) loads them on opening, as the web's
  // mateu-table-crud does — a YAML listing carries no OnLoad trigger of its own
  if (ids.indexOf('search') < 0 && ctx && ctx.tree
      && findFirst(ctx.tree, (n) => n && n.metadata && n.metadata.type === 'Crud' && !!n.metadata.rowsSource)) {
    ids.push('search')
  }
  return ids
}

/**
 * The URL of a tab with a route key (@Tab(key)): the page route with the key of the
 * tab of its bar that it already names (if any) replaced — /vcns/7/subnets → /vcns/7/gateways.
 */
export function tabRoutePath(pathname, keys, key) {
  const trimmed = String(pathname || '').replace(/\/+$/, '')
  const segments = trimmed.split('/')
  const last = segments[segments.length - 1]
  const base = keys.includes(last) ? segments.slice(0, -1).join('/') : trimmed
  return base + '/' + key
}

// ── NESTED APPS: the master of a record with tabs that are pages (P1) ─────────────────────────
//
// A route with CHILDREN in routes.yaml (`customers/:customerId` → orders, addresses…) is painted by
// an @App(TABS) whose content is the tab. On the wire it arrives as a TOP-level ClientSide App
// — just like the bootstrap App —, and treating it as the shell clobbered it and left the content
// blank. A nested App is CONTENT: a LEVEL (title, tabs, «← parent») over the
// screen that fills its slot. There is one tab bar per level.

/** If the fragment is a NESTED App (not the shell, not a mediator), its level; otherwise, null. */
export function appLevelOf(fragment, shellServerSideType, requestedRoute = '') {
  const c = fragment && fragment.component
  const md = c && c.metadata
  if (!c || c.type !== 'ClientSide' || !md || md.type !== 'App') return null
  if (md.variant === 'MEDIATOR') return null
  if (shellServerSideType && md.serverSideType === shellServerSideType) return null
  // an App with no slot to fill (its home is itself) is a shell, not a level
  if (!md.homeServerSideType || md.homeServerSideType === md.serverSideType) return null
  const path = (r) => String(r || '').split('?')[0].replace(/\/+$/, '')
  const requested = path(requestedRoute || md.homeRoute)
  const tabs = (md.menu || [])
    .filter((o) => o && !o.separator && (o.route || o.path))
    .map((o) => ({ id: o.route || o.path, label: o.label || '', route: o.route || o.path }))
  // the active tab: the one with the longest route that is a prefix of what was requested (a record
  // inside the tab's crud stays on that tab)
  const pick = (target) => {
    let found = ''
    for (const tab of tabs) {
      const r = path(tab.route)
      if ((target === r || target.startsWith(r + '/')) && r.length > path(found).length) found = tab.route
    }
    return found
  }
  // …or, with the master requested on its own (/customers/3), its home's: the default tab
  const selected = pick(requested) || pick(path(md.homeRoute))
  return {
    id: 'mateuAppTabs-' + path(md.route).replace(/[^a-zA-Z0-9]/g, '_'),
    title: md.title || '',
    route: md.route || '',
    serverSideType: md.serverSideType,
    tabs,
    // a single visible tab is not a choice: no bar (the route is kept)
    showTabs: tabs.length > 1,
    selected,
    backRoute: md.backRoute || '',
    backLabel: md.backLabel || '',
    actions: (md.contextActions || []).map((a) => ({ id: a.actionId, label: a.label })),
    home: { route: md.homeRoute, consumedRoute: md.homeConsumedRoute, serverSideType: md.homeServerSideType },
  }
}

/**
 * Splits the NESTED Apps off the increment: returns the increment without them (so the reducer
 * does not take them for the shell) and their levels, in order.
 */
export function splitNestedApps(increment, shellServerSideType, requestedRoute) {
  const levels = []
  const fragments = []
  for (const fr of (increment && increment.fragments) || []) {
    const level = appLevelOf(fr, shellServerSideType, requestedRoute)
    if (level) levels.push(level)
    else fragments.push(fr)
  }
  return { increment: { ...(increment || {}), fragments }, levels }
}

/** A mediator App of a crud mounted at the ROOT: what it consumes is "" by both accounts. */
const atMountRoot = (md) => md.homeConsumedRoute === '' && md.rootRoute === ''

/** If the context is a MEDIATOR (ServerSide → child App), the info to load its content. */
export function mediatorOf(ctx) {
  const tree = ctx?.tree
  if (tree?.type !== 'ServerSide') return null
  const child = (tree.children || [])[0]
  const md = child?.metadata
  if (md?.type !== 'App') return null
  return {
    // homeConsumedRoute BEFORE rootRoute: in a deep-link to a sub-route (a process's
    // detail) `rootRoute` is the WHOLE route that was requested, whereas what the mediator
    // consumed is its own route (`/workflow/processes`). Sending the whole one as consumedRoute
    // makes the server serve the crud's default view: you came in through a process's link
    // and the listing appeared. On a menu option (the crud's root) both are the same.
    // …and when both say "" (a crud mounted at the ROOT, @UI("")), what is consumed is the root:
    // not the state's _route, which in a deep-link is the record (/P-001)
    rootRoute: md.homeConsumedRoute || md.rootRoute || (atMountRoot(md) ? '' : ctx.state?._route) || '',
    rootKnown: !!(md.homeConsumedRoute || md.rootRoute) || atMountRoot(md),
    homeRoute: md.homeRoute ?? '',
    serverSideType: md.homeServerSideType ?? md.serverSideType,
    variant: md.variant,
  }
}

export const metaOf = (fr) => fr.component?.metadata || {}

/** A surface's state with the INITIAL VALUES of its fields (FormField.initialValue) that
 *  have no value yet: the web renderer falls back to that value when the state lacks the key, and here
 *  it is seeded into the state so it is painted AND travels in the next action. */
export function withInitialValues(tree, state) {
  const out = { ...(state || {}) }
  if (!tree) return out
  for (const f of collectFields(tree)) {
    if (f.initialValue != null && !(f.fieldId in out)) out[f.fieldId] = f.initialValue
  }
  return out
}

export let overlaySeq = 0
/** Builds an overlay context (drawer/dialog) from an Add fragment. */
export function buildOverlay(fr, opener) {
  const md = metaOf(fr)
  const id = 'overlay-' + ++overlaySeq
  // An EMBEDDED form (EmbeddedView: a reservation's «Cancel booking») arrives as its own
  // ServerSide in md.content, with ITS state (initialData), ITS title (its Page's) and
  // ITS actions: it is the overlay's surface.
  const surface = md.content && md.content.type === 'ServerSide' ? md.content : null
  const filled = (o) => (o && typeof o === 'object' && Object.keys(o).length ? o : null)
  const surfacePage = surface ? findByType(surface, 'Page') : null
  return {
    id,
    kind: 'drawer',
    tree: fr.component, // the whole tree — md.content carries the content (Card pattern)
    surface,
    state: withInitialValues(surface || fr.component, filled(md.initialData) || filled(fr.state) || (surface && filled(surface.initialData)) || {}),
    title: md.headerTitle || md.title || (surfacePage && surfacePage.metadata.title) || '',
    subtitle: md.subtitle,
    position: md.position || 'end',
    width: md.width,
    size: md.size,
    dirty: false,
    // whoever opened it: the overlay's value-changed/data-changed go to it (applyOverlayEvent)
    opener: opener || HOST_ID,
  }
}

/** Resolves which registry key a target goes to: echo of the initiator; ''/null → host. */
export const resolveTarget = (contexts, t) => {
  if (t == null || t === '') return HOST_ID
  if (contexts[t]) return t
  // echo of an already registered component id (e.g. SSE answering to the tree's uuid, or an
  // overlay's embedded form, which answers to ITS id)
  const byTreeId = Object.keys(contexts).find((k) => contexts[k].tree?.id === t || contexts[k].surface?.id === t)
  return byTreeId || t
}

/**
 * THE REDUCER. reg = { contexts, stack, shell }; returns the NEW reg + the effects VB
 * applies. Pure and immutable with structural sharing: only the touched entries change ref.
 * opts.initiator = contextId of the surface that launched the request (for commands without a target,
 * like the save-in-drawer's MarkAsClean).
 */
export function reduceContexts(reg, increment, opts = {}) {
  const contexts = { ...reg.contexts }
  const stack = [...reg.stack]
  let shell = reg.shell || null
  const effects = {
    toasts: [],
    banners: increment.banners || [],
    navigate: null,
    urlPush: null,
    download: null,
    downloads: [], // every DownloadFile of the increment (download = the last one, compat)
    print: false, // UICommand.print: print the current page (files.printPage)
    runActions: [],
    docTitle: null,
    // UICommand.announce / announceAssertive: what assistive tech is told (a11y.mjs live regions);
    // nothing is drawn — [{ text, assertive }]
    announcements: [],
    events: [], // bus @SubscribeTo: [{ name, detail }]
    headerValues: [], // UICommand.updateHeaderValue: [{ id, value }] (appExtras.mjs)
  }

  for (const m of increment.messages || [])
    effects.toasts.push({
      text: m.text || m.title, variant: m.variant || 'info',
      // Message.undoable: the toast carries its «Undo» (notify.mjs paints it with oj-message)
      ...(m.undoActionId ? { undoActionId: m.undoActionId, undoLabel: m.undoLabel || 'Undo', undoParameters: m.undoParameters || {} } : {}),
    })

  // PageBanner(s) an ACTION returned (Vaadin draws them under the page header): they were left in
  // effects.banners and nothing drew them. Each goes to the shell's message band as a toast marked
  // `banner` (notify.mjs bannerNotificationOf), where every chain already sends errors and warnings.
  const BANNER_VARIANTS = { SUCCESS: 'confirmation', WARNING: 'warning', DANGER: 'error' }
  for (const b of increment.banners || [])
    effects.toasts.push({ banner: true, text: b.title || '', description: b.description || '', variant: BANNER_VARIANTS[b.theme] || 'info' })

  // ── fragmentos → shell | superficies ──────────────────────────────────────
  for (const fr of increment.fragments || []) {
    const md = metaOf(fr)

    // The BOOTSTRAP App (root ClientSide type App) configures the chrome. A mediator
    // App does NOT go through here: it arrives wrapped in a ServerSide (child0) and is content.
    if (fr.component?.type === 'ClientSide' && md.type === 'App') {
      shell = {
        title: md.title,
        menu: md.menu || [],
        variant: md.variant,
        serverSideType: md.serverSideType, // for the header actions (app-level)
        appContext: md.contextSelectors || [],
        headerActions: md.contextActions || [],
        // the shell's FLOWS (AppShell.actions): a menu RuleLink whose RunAction names one runs
        // its lowered commands client-side (shellFlows.mjs)
        actions: md.actions || [],
        // the app's ACTION catalogue (App.actionCatalogue): an id the shell or the page does not
        // declare runs the catalogue's lowered flow client-side, owner first (shellFlows.mjs)
        actionCatalogue: md.actionCatalogue || [],
        themeToggle: md.themeToggle,
        // @App(accessKeys): holding Alt shows the access keys (keys.mjs)
        accessKeys: !!md.accessKeys,
        // E2 patterns (appExtras.mjs): app shortcuts / quick launch, live header values, idle warning
        shortcuts: md.shortcuts || [],
        headerValues: md.headerValues || [],
        liveUpdates: !!md.liveUpdates,
        idleSession: md.idleSession || null,
        // @App(mobileQr): the header's "Open on mobile" action (qr.mjs)
        mobileQr: !!md.mobileQr,
        // The App's NotificationsSupplier → the header bell (notify.mjs)
        notificationsEnabled: !!md.notificationsEnabled,
        // The App's GlobalSearchSupplier → the Ask palette also searches entities (globalSearch.mjs)
        globalSearchEnabled: !!md.globalSearchEnabled,
        // a data-authored shell's inbox and palette search from REST sources (type: AppShell
        // notifications.source/markRead, globalSearch.source) instead of the app-level actions
        notificationsSource: md.notificationsSource || null,
        notificationsReadSource: md.notificationsReadSource || null,
        globalSearchSource: md.globalSearchSource || null,
        // The App's @Fab: global floating buttons (fabs.mjs)
        fabs: md.fabs || [],
        // the @App logo (@Logo, e.g. /images/riu.svg — relative to the backend)
        logo: md.logo || '',
        // the app's HOME (@HomeRoute) — the shell boot prefers it over the
        // first menu option
        homeRoute: md.homeRoute || '',
        // AI chat (@AI → App.sseUrl): if present, the shell paints the agent chat button in the header
        sseUrl: md.sseUrl || '',
        // @AI(upload) → the chat's attach button; @AI(mcp) → the mcpUrl the agent uses to operate the app
        uploadUrl: md.uploadUrl || '',
        mcpUrl: md.mcpUrl || '',
        // the shell's "ask" FAB (@App(askLabel, askIcon)): empty = the neutral FAB (Search)
        askLabel: md.askLabel || '',
        askIcon: md.askIcon || '',
        // the HEADER widgets (WidgetSupplier / @Widget): they travel as children of the App with
        // slot "widgets"; projected by headerWidgetsOf (widgets.mjs)
        widgets: (fr.component.children || []).filter((child) => child && child.slot === 'widgets'),
      }
      continue
    }

    if (fr.action === 'Add') {
      // a returned ConfirmDialog is not a drawer: the chain asks it (returnedConfirmDialogsOf)
      if (md && md.type === 'ConfirmDialog') continue
      const ctx = buildOverlay(fr, opts.initiator)
      // the SAME overlay re-sent while it is open (a Drawer with the same id: the crud's edit
      // drawer after «Save and next», or with its error banner) REFRESHES IN PLACE — it takes the
      // open one's place in the stack instead of stacking a second drawer on top. It gets a new
      // context id on purpose: the chains reset the drawer's draft when the overlay id changes, and
      // the refreshed drawer carries new values (the next row, or what the server kept).
      // …but only a REAL id says "the same overlay": the server stamps the filler `fieldId` on every
      // record without one (a Drawer and the Dialog opened from inside it both carry it), and the
      // overlay's kind must match too — a Dialog is never a refresh of a Drawer. Taking it for one
      // replaced the drawer in the stack, and the drawer was gone once the dialog closed.
      const sameId = fr.component && fr.component.id && fr.component.id !== 'fieldId' ? fr.component.id : null
      const open = sameId ? stack.find((k) => contexts[k] && contexts[k].tree && contexts[k].tree.id === sameId
        && metaOf({ component: contexts[k].tree }).type === md.type) : null
      if (open) {
        contexts[ctx.id] = { ...ctx, opener: contexts[open].opener || ctx.opener }
        delete contexts[open]
        stack[stack.indexOf(open)] = ctx.id
        continue
      }
      contexts[ctx.id] = ctx
      stack.push(ctx.id)
      continue
    }

    // Replace / ReplaceKeepData / State-only: SAME path for form, mediator, island…
    const id = resolveTarget(contexts, fr.targetComponentId)
    const prev = contexts[id] || { id, kind: id === HOST_ID ? 'host' : 'island', state: {}, data: {} }
    const ss = fr.component?.type === 'ServerSide' ? fr.component : null
    // An ACTION answering a bare component (a fluent Form/Page, a Text — what the web paints INSIDE
    // the component that asked) re-renders that surface's content: it keeps its ServerSide envelope
    // (class, actions, triggers — later actions still reach it) with the new tree as its child.
    // Without this the surface's root became a ClientSide node and nothing was projected.
    const intoEnvelope = fr.component && fr.component.type === 'ClientSide' && fr.action !== 'Add'
      && prev.tree && prev.tree.type === 'ServerSide'
    const nextTree = intoEnvelope ? { ...prev.tree, children: [fr.component] } : (fr.component || prev.tree)
    contexts[id] = {
      ...prev,
      kind: prev.kind,
      tree: nextTree, // no component => State-only: keeps the tree
      pageType: ss?.pageType ?? (fr.component ? undefined : prev.pageType),
      pageWidth: ss?.pageWidth ?? (fr.component ? undefined : prev.pageWidth),
      state: !fr.component
        ? { ...prev.state, ...(fr.state || {}) } // State-only: MERGE (do not erase the island)
        : withInitialValues(fr.component, fr.action === 'ReplaceKeepData'
          ? { ...prev.state, ...(fr.state || md.initialData || {}) }
          : (fr.state ?? md.initialData ?? prev.state)),
      // data = axis of DATA computed by the server (e.g. the listing rows, keyed
      // by component id: {crud: {page: …}}); a data-only fragment MERGES
      data: !fr.component
        ? { ...prev.data, ...(fr.data || {}) }
        : (fr.data ?? {}),
      dirty: false,
    }
  }

  // ── commands → effects (some mutate the registry) ─────────────────────────
  // `source`: the surface whose answer emitted it (opts.initiator) — the @SubscribeTo scopes
  // (COMPONENT `from`, SELF) are decided from it (transport busSubscribersOf)
  const source = opts.initiator || null
  const emit = (data) => {
    if (!data) return
    if (typeof data === 'string') effects.events.push({ name: data, detail: null, source })
    else if (data.eventName) effects.events.push({ name: data.eventName, detail: data.detail ?? null, source })
  }
  for (const c of increment.commands || []) {
    const t = c.targetComponentId
    switch (c.type) {
      case 'SetWindowTitle':
        // as the header shows it: the server's literal escapes around data resolved (`\${` → `${`)
        effects.docTitle = typeof c.data === 'string' ? literalText(c.data) : c.data
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
        emit(c.data) // the close's eventName → bus (e.g. refresh of the crud's listing)
        break
      }
      case 'DispatchEvent':
        // what an overlay component returns to whoever opened it (the selector of a
        // @Searchable: the chosen value, its label, and closing itself)
        if (applyOverlayEvent(contexts, stack, c.data)) break
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
        effects.downloads.push(c.data)
        break
      case 'Print':
        effects.print = true
        break
      case 'RunAction':
        effects.runActions.push(c.data)
        break
      case 'UpdateHeaderValue': {
        // a live header value (the business date…): this tab, and the others through storage
        const d = c.data && typeof c.data === 'object' ? c.data : {}
        if (d.id) effects.headerValues.push({ id: String(d.id), value: d.value == null ? '' : String(d.value) })
        break
      }
      case 'Announce': {
        // the Redwood `announcement` slot: polite by default, assertive when the server says so
        const d = c.data && typeof c.data === 'object' ? c.data : { text: c.data }
        const text = d.text == null ? '' : String(d.text).trim()
        if (text) effects.announcements.push({ text, assertive: !!d.assertive })
        break
      }
    }
  }

  // the app levels (P1) belong to the SCREEN, not to an increment: an action on the tab
  // (the listing's OnLoad search) does not erase them
  const kept = {}
  if (reg.appLevels) kept.appLevels = reg.appLevels
  if (reg.loadedRoute) kept.loadedRoute = reg.loadedRoute
  return { ...kept, contexts, stack, shell, effects }
}
