/* Mateu — Apache License 2.0 (LICENSE.txt at the repository root).
 *
 * The viewModel of <mateu-ui>. Thin on purpose: the runtime (variables, listeners, the chains' five
 * VB Actions), the boot and the property handling live in the bridge (poc/embedded.mjs), tested in
 * Node; this file only gives them what only a browser has — Knockout observables, JET's
 * ArrayDataProvider, the element, its DOM events.
 *
 * The view binds against the SAME names a VB page sees ($application, $page, $variables,
 * $listeners): it is the content page of the standalone app, generated (make-embedded.mjs).
 */
define([
  'require',
  'knockout',
  'ojs/ojarraydataprovider',
  './mateu-ui-bridge',
  './mateu-ui-chains',
  './mateu-ui-descriptors',
  'ojs/ojknockout',
], (require, ko, ArrayDataProvider, bridge, chains, descriptors) => {
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
    const bundles = {};
    for (const [bundle, ids] of Object.entries(wanted.bundles || {})) {
      if (Object.keys(missing).some((p) => bundle.indexOf(p + '/') === 0)) bundles[bundle] = ids;
    }
    rjs.config({ paths: missing, bundles });
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
      // the binding context of the view: $application, $page, $variables, $listeners, $flow
      Object.assign(this, this._runtime.bindingContext);
      // `route` is written back when the screen navigates inside the component: a host binding it
      // with {{ }} follows it, and setting it again later is a real change
      this._properties = context.properties;
      this._runtime.watch('app.mateuSelectedNavId', (route) => {
        if (route && this._properties.route !== route) this._properties.route = route;
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
      this._onNavigationRequested = (event) => {
        const detail = (event && event.detail) || {};
        if (detail.route == null) return;
        event.stopPropagation();
        this._runtime.callChain('onMateuNavigate', { event: { detail: { route: detail.route } } });
      };
      this._element.addEventListener('click', this._onClick);
      this._element.addEventListener('navigation-requested', this._onNavigationRequested);
      if (!this._booted) {
        this._booted = true;
        this._boot();
      }
    }

    disconnected() {
      this._element.removeEventListener('click', this._onClick);
      this._element.removeEventListener('navigation-requested', this._onNavigationRequested);
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
      // our own writeback of `route` (the screen navigated): already on display
      if (!this._booted || context.updatedFrom === 'internal') return;
      // the identity is read on every request: a new token needs no reload
      if (context.property === 'token' || context.property === 'headers' || context.property === 'headersProvider') {
        bridge.setHostHeaderProvider(bridge.headerProviderOf(next));
        return;
      }
      const change = bridge.propertyChangeOf(previous, next);
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
      return bridge.navigateEmbedded(this._runtime, Object.assign({}, this._config, { route: route || '', params: params || {}, initialState: null }));
    }

    /** Method: reload the screen on display. */
    reload() {
      const current = this._runtime.$application.variables.mateuSelectedNavId
        || this._runtime.$application.variables.mateuSelectedRoute || '';
      return bridge.navigateEmbedded(this._runtime, Object.assign({}, this._config, { route: current, params: {}, initialState: null }));
    }

    _boot() {
      return bridge.bootEmbedded(bridge, this._runtime, this._config).catch((e) => this._failed(e));
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
