// Wire client: the thin adapter over Mateu's public sync contract.
//
//   POST {baseUrl}/mateu/v3/sync/{route}      (root route == "/_no_route")
//   body: { serverSideType, appState, componentState, parameters, consumedRoute, route, actionId }
//   response: UIIncrementDto  (see backend/shared/dtos + doc/.../reference/wire-specification.md)
//
// The screen *load* is dispatched with actionId "" (NOT "__load__") — that is what the frontend's
// mateu-ux fires on navigation. Everything here speaks only the wire, so this sidecar works against
// a Java, .NET or Python backend without any change.

import { projectIncrement } from "./projection.mjs";

/** The server encodes the root/empty route as "_empty" on the wire; treat it as "". */
export function normalizeRoute(route) {
  const r = (route ?? "").replace(/^\/+/, "");
  return r === "_empty" ? "" : r;
}

/** Normalise a user-facing route ("", "/", "products", "_empty") to the sync path segment. */
export function routeToPath(route) {
  const r = normalizeRoute(route);
  return r === "" ? "/_no_route" : "/" + r;
}

export class MateuWire {
  constructor({ baseUrl, token, fetchImpl } = {}) {
    if (!baseUrl) throw new Error("MATEU_BASE_URL is required");
    this.baseUrl = baseUrl.replace(/\/+$/, "");
    this.token = token || null;
    this.fetch = fetchImpl || globalThis.fetch;
    if (!this.fetch) throw new Error("global fetch unavailable (need Node 18+ or a fetchImpl)");
  }

  /** POST a sync request and return the raw UIIncrementDto. */
  async sync({ route = "", actionId = "", componentState = null, appState = null, parameters = null } = {}) {
    const url = this.baseUrl + "/mateu/v3/sync" + routeToPath(route);
    const body = {
      serverSideType: null,
      appState: appState ?? {},
      componentState: componentState ?? {},
      parameters: parameters ?? {},
      // NOTE: consumedRoute MUST be null (not "") for a fresh load — an empty string makes the
      // server resolve to nothing (verified against a live backend). null = "nothing consumed yet".
      consumedRoute: null,
      route: normalizeRoute(route),
      actionId: actionId ?? "",
    };
    const headers = { "content-type": "application/json", accept: "application/json" };
    if (this.token) headers.authorization = "Bearer " + this.token;
    const res = await this.fetch(url, { method: "POST", headers, body: JSON.stringify(body) });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Mateu sync ${res.status} ${res.statusText} for ${url}${text ? ": " + text.slice(0, 500) : ""}`);
    }
    return res.json();
  }

  /** Load a screen (route) and return the flat projection. */
  async describeScreen(route = "") {
    const increment = await this.sync({ route, actionId: "" });
    return projectIncrement(increment);
  }

  /** Run an action on a screen, return the resulting projection. */
  async runAction(route, actionId, componentState = null, parameters = null) {
    if (!actionId) throw new Error("actionId is required");
    const increment = await this.sync({ route, actionId, componentState, parameters });
    return projectIncrement(increment);
  }

  /** Run the standard `search` action of a listing screen. */
  async search(route, searchText = "", filters = null) {
    const state = { ...(filters || {}) };
    if (searchText) state.__searchText = searchText;
    return this.runAction(route, "search", state, { searchText });
  }

  /**
   * Enumerate navigable routes from the app's menu. There is no public "route registry" endpoint,
   * so we read what the wire already carries: the App component's menu on the root response.
   * Returns [{ route, caption }]. Best-effort — a bundle would instead expose manifest.json.
   */
  async listRoutes() {
    const increment = await this.sync({ route: "", actionId: "" });
    const routes = new Map();
    const collect = (node) => {
      if (node == null || typeof node !== "object") return;
      if (!Array.isArray(node)) {
        const md = node.metadata && node.metadata.type === "App" ? node.metadata : null;
        if (md) walkMenu(md.menu, routes);
        // A RouteLink / menu option anywhere in the tree.
        if (typeof node.route === "string" && node.route) {
          const r = normalizeRoute(node.route);
          if (!routes.has(r)) routes.set(r, node.caption || node.label || (r || "Home"));
        }
      }
      for (const v of Array.isArray(node) ? node : Object.values(node)) {
        if (v && typeof v === "object") collect(v);
      }
    };
    for (const fragment of increment.fragments || []) collect(fragment.component || fragment);
    // Always include the root.
    if (!routes.has("")) routes.set("", "Home");
    return [...routes.entries()].map(([route, caption]) => ({ route, caption }));
  }
}

function walkMenu(menu, out) {
  if (!Array.isArray(menu)) return;
  for (const item of menu) {
    if (!item || typeof item !== "object") continue;
    const rawRoute = item.route ?? item.path;
    if (typeof rawRoute === "string" && rawRoute) {
      const route = normalizeRoute(rawRoute);
      if (!out.has(route)) out.set(route, item.caption || item.label || (route || "Home"));
    }
    if (Array.isArray(item.submenus)) walkMenu(item.submenus, out);
    if (Array.isArray(item.menu)) walkMenu(item.menu, out);
  }
}
