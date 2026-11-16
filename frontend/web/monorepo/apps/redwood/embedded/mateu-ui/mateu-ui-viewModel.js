/* Mateu — Apache License 2.0 (LICENSE.txt at the repository root).
 *
 * The viewModel of <mateu-ui>. Thin on purpose: the runtime (variables, listeners, the chains' five
 * VB Actions), the boot and the property handling live in the bridge (poc/embedded.mjs), tested in
 * Node; this file only gives them what only a browser has — Knockout observables, JET's
 * ArrayDataProvider, the element, its DOM events.
 *
 * The view is the content page of the standalone app, generated (make-embedded.mjs), with VB's
 * context names renamed to the component's own ($application → $mateuApplication, $functions →
 * $mateuFunctions…): under a real Visual Builder runtime the host page has its own $application,
 * and the view must never depend on which one a binding sees.
 */
define([
  'require',
  'knockout',
  'ojs/ojarraydataprovider',
  './mateu-ui-bridge',
  './mateu-ui-chains',
  './mateu-ui-descriptors',
  './mateu-ui-functions',
  'ojs/ojknockout',
], (require, ko, ArrayDataProvider, bridge, chains, descriptors, ContentPageModule) => {
  'use strict';

  /** VB's ArrayDataProvider2 variables, on JET's ArrayDataProvider over an observableArray. */
  const adpFactory = (rows, keyAttributes) => {
    const items = ko.observableArray((rows || []).slice());
    const provider = new ArrayDataProvider(items, { keyAttributes });
    const keyOf = (item) => (item == null ? undefined : item[keyAttributes]);
    return {
      provider,
      setData: (next) => items((next || []).slice()),
      add: (list) => items.push(...list),
      remove: (keys) => items.remove((item) => keys.indexOf(keyOf(item)) >= 0),
      refresh: () => items.valueHasMutated(),
    };
  };

  /**
   * The Spectra components (oj-sp) and oj-dynamic come from the HOST. A Redwood VB app configures
   * them already; a page that does not (a plain JET app) gets the paths the standalone app pins —
   * Oracle's CDN, never a copy of ours. Only what is missing is added.
   */
  const ensureRequirePaths = () => {
    const rjs = window.requirejs;
    if (!rjs || typeof rjs.config !== 'function') return;
    const current = (rjs.s && rjs.s.contexts && rjs.s.contexts._ && rjs.s.contexts._.config) || {};
    const paths = current.paths || {};
    const wanted = descriptors.requirejs || {};
    const missing = {};
    for (const name of Object.keys(wanted.paths || {})) {
      if (!paths[name]) missing[name] = wanted.paths[name];
    }
    if (!Object.keys(missing).length) return;
    withIntegrity(rjs, wanted.integrity || {}, missing);
    const bundles = {};
    for (const [bundle, ids] of Object.entries(wanted.bundles || {})) {
      if (Object.keys(missing).some((p) => bundle.indexOf(p + '/') === 0)) bundles[bundle] = ids;
    }
    rjs.config({ paths: missing, bundles });
  };

  /** The third-party fallbacks (descriptors.requirejs.integrity) are loaded with their SRI hash:
   *  requirejs creates the <script>, its onNodeCreated hook (chained after the page's) marks it. */
  const withIntegrity = (rjs, integrity, added) => {
    const urls = Object.keys(integrity).filter((url) => Object.values(added).some((p) => url === p + '.js' || url.indexOf(p + '/') === 0));
    if (!urls.length) return;
    const ctx = rjs.s && rjs.s.contexts && rjs.s.contexts._;
    const previous = ctx && ctx.config ? ctx.config.onNodeCreated : undefined;
    if (previous && previous.__mateuUiIntegrity) return;
    const hook = function (node, config, moduleName, url) {
      if (typeof previous === 'function') previous.call(this, node, config, moduleName, url);
      const hash = integrity[String(url || '').split('?')[0]];
      if (hash) {
        node.setAttribute('integrity', hash);
        node.setAttribute('crossorigin', 'anonymous');
      }
    };
    hook.__mateuUiIntegrity = true;
    rjs.config({ onNodeCreated: hook });
  };

  let active = null;

  class MateuUiViewModel {
    constructor(context) {
      this._element = context.element;
      this._config = bridge.embeddedConfigOf(context.properties);
      this._booted = false;
      const element = context.element;
      this._emit = (name, detail) => element.dispatchEvent(new CustomEvent(name, {
        detail,
        bubbles: true,
        cancelable: name === bridge.EMBEDDED_EVENTS.navigate,
      }));
      this._runtime = bridge.createVbRuntime({
        app: descriptors.app,
        pages: descriptors.pages,
        chains,
        constants: { mateuBaseUrl: this._config.baseUrl, mateuBundleUrl: '' },
        translations: { appBundle: bridge.chromeTextsOf() },
        observable: ko.observable,
        adpFactory,
        root: element,
        policy: () => this._config.navigation,
        emit: this._emit,
      });
      this._runtime.emitMessage = (n) => this._emit(bridge.EMBEDDED_EVENTS.message, {
        summary: n.summary || '', message: n.message || '', type: n.type || '', displayMode: n.displayMode || '',
      });
      // the binding context of the view, under the names make-embedded gave it (never VB's own:
      // a VB host page has an $application of its own): $mateuApplication, $mateuPage,
      // $mateuVariables, $mateuListeners, $mateuFlow and $mateuFunctions (the content page module)
      const names = this._runtime.bindingContext;
      this.$mateuApplication = names.$application;
      this.$mateuPage = names.$page;
      this.$mateuVariables = names.$variables;
      this.$mateuListeners = names.$listeners;
      this.$mateuFlow = names.$flow;
      // the content page module's functions, and the shell page's the menu band binds (the bridge's)
      const functions = new ContentPageModule();
      for (const name of descriptors.shellFunctions || []) functions[name] = bridge[name];
      this.$mateuFunctions = functions;
      // `route` is written back when the screen navigates inside the component: a host binding it
      // with {{ }} follows it, and setting it again later is a real change
      this._properties = context.properties;
      this._runtime.watch('app.mateuSelectedNavId', (route) => {
        if (route && this._properties.route !== route) this._properties.route = route;
        // shell="true": the component scrolls its content itself, so another screen starts at its
        // top (the standalone app scrolls the window to the top on a navigation; mount.mjs)
        if (this._config.shell) {
          const scroller = this._element.querySelector('.mateu-embedded-scroller');
          if (scroller) scroller.scrollTop = 0;
        }
      });
    }

    /** The view binds once the components it uses are defined (from the host's JET / Spectra). */
    activated() {
      ensureRequirePaths();
      // one by one: a component the host cannot load paints as an unknown element, and must not
      // keep the others from being defined before the view binds
      return Promise.all(descriptors.modules.map((id) => new Promise((resolve) => {
        require([id], () => resolve(), (err) => {
          console.warn('mateu-ui: component module ' + id + ' could not be loaded', err);
          resolve();
        });
      })));
    }

    connected() {
      if (active && active !== this) {
        console.warn('mateu-ui: only one <mateu-ui> per page is supported; the newest one takes over');
      }
      active = this;
      bridge.setEmbeddedHost({ emit: this._emit });
      // the content runtime (rules, keys, calendars, maps…): installed once per page, its sinks
      // and transport hooks re-pointed at THIS component
      bridge.installEmbeddedContentRuntime(bridge, this._runtime);
      this._onClick = (event) => this._handleLink(event);
      // navigation-requested: from inside the component (a widget's link) and on the DOCUMENT,
      // where the chains dispatch it (the header's peer arrows and go-to-parent, a content menu's
      // route, a FAB) — the standalone shell listens there; embedded, the component does
      this._onNavigationRequested = (event) => {
        const params = bridge.embeddedNavigationRequestOf(event, this._element, bridge.chatNavigationOf);
        if (!params) return;
        event.stopPropagation();
        bridge.registerRemoteRoute(params.event.detail.route, event.detail);
        this._runtime.callChain('onMateuNavigate', params);
      };
      this._element.addEventListener('click', this._onClick);
      this._element.addEventListener('navigation-requested', this._onNavigationRequested);
      document.addEventListener('navigation-requested', this._onNavigationRequested);
      this._onResize = () => this._applyPageMode();
      window.addEventListener('resize', this._onResize);
      this._applyPageMode();
      if (!this._booted) {
        this._booted = true;
        this._boot();
      }
    }

    disconnected() {
      this._element.removeEventListener('click', this._onClick);
      this._element.removeEventListener('navigation-requested', this._onNavigationRequested);
      document.removeEventListener('navigation-requested', this._onNavigationRequested);
      window.removeEventListener('resize', this._onResize);
      if (active === this) {
        active = null;
        bridge.setEmbeddedHost(null);
        bridge.setHostHeaderProvider(null);
      }
    }

    propertyChanged(context) {
      const next = bridge.embeddedConfigOf(this._element);
      const previous = this._config;
      this._config = next;
      if (context.property === 'shell') this._applyPageMode();
      // our own writeback of `route` (the screen navigated): already on display
      if (!this._booted || context.updatedFrom === 'internal') return;
      // the identity is read on every request: a new token needs no reload
      if (context.property === 'token' || context.property === 'headers' || context.property === 'headersProvider') {
        bridge.setHostHeaderProvider(bridge.headerProviderOf(next));
        return;
      }
      const change = bridge.propertyChangeOf(previous, next);
      // the designer without a base-url: nothing is called — a route typed first changes nothing
      if (this._placeholder()) {
        if (change === 'boot') this._boot();
        return;
      }
      if (change === 'boot') {
        this._boot();
      } else if (change === 'context') {
        this._runtime.$application.variables.mateuAppState = Object.assign({}, next.appContext);
        this.reload();
      } else if (change === 'navigate') {
        bridge.navigateEmbedded(this._runtime, next).catch((e) => this._failed(e));
      }
    }

    /** Method: open a route inside the component. */
    navigate(route, params) {
      if (this._placeholder()) return Promise.resolve();
      return bridge.navigateEmbedded(this._runtime, Object.assign({}, this._config, { route: route || '', params: params || {}, initialState: null }));
    }

    /** Method: reload the screen on display. */
    reload() {
      if (this._placeholder()) return Promise.resolve();
      const current = this._runtime.$application.variables.mateuSelectedNavId
        || this._runtime.$application.variables.mateuSelectedRoute || '';
      return bridge.navigateEmbedded(this._runtime, Object.assign({}, this._config, { route: current, params: {}, initialState: null }));
    }

    /** shell="true": the component is the page, so it scrolls its content itself (mateu-ui-embedded.css,
     *  .mateu-ui-page: the shell band stays, .mateu-embedded-scroller under it scrolls) and takes the
     *  window's height from where it starts. Off: the host scrolls. */
    _applyPageMode() {
      const element = this._element;
      const on = !!this._config.shell;
      element.classList.toggle('mateu-ui-page', on);
      if (!on) {
        element.style.removeProperty('--mateu-ui-page-top');
        return;
      }
      const top = element.getBoundingClientRect().top + (window.scrollY || 0);
      element.style.setProperty('--mateu-ui-page-top', Math.max(0, Math.round(top)) + 'px');
    }

    /** Whether the component must not call any backend now (the designer, no base-url yet). */
    _placeholder() {
      return bridge.embeddedStartOf(this._config, window.location, window).start === 'placeholder';
    }

    /** Starts over: no request and a placeholder when the designer has no base-url yet (or a request
     *  failed there), else the backend's App and the route (embedded.mjs startEmbedded). */
    _boot() {
      return bridge.startEmbedded(bridge, this._runtime, this._config, window.location, window).catch((e) => this._failed(e));
    }

    _failed(e) {
      if (e && e.stale === true) return;
      console.error('mateu-ui: could not load the screen', e);
      const failure = (e && e.failure) || {};
      this._emit(bridge.EMBEDDED_EVENTS.error, {
        kind: failure.kind || 'unknown',
        message: failure.message || (e && e.message) || String(e),
        status: failure.status,
      });
    }

    /** An ordinary link of the content opens its screen inside the component (resolved against
     *  the backend: the app's links are written for the app, not for this page). */
    _handleLink(event) {
      const path = typeof event.composedPath === 'function' ? event.composedPath() : [];
      const anchor = path.find((node) => node && node.tagName === 'A');
      if (!anchor) return;
      const route = bridge.embeddedRouteOfLink(anchor, event, this._config.baseUrl, window.location);
      if (!route) return;
      event.preventDefault();
      this._runtime.callChain('onMateuNavigate', { event: { detail: { route } } });
    }
  }

  return MateuUiViewModel;
});
