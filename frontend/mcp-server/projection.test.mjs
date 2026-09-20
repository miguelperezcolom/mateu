// Unit tests for the wire -> agent projection. Runs against the REAL conformance corpus
// (../../conformance/cases/*/expected.json) plus synthetic increments for actions/listings.
//   node --test
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { projectIncrement } from "./projection.mjs";
import { routeToPath, normalizeRoute } from "./wire.mjs";
import { handleRpc, TOOLS } from "./index.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const corpus = join(here, "..", "..", "conformance", "cases");
const load = (name) => JSON.parse(readFileSync(join(corpus, name, "expected.json"), "utf8"));

test("simple-form: extracts title, fields with types, options and values", () => {
  const s = projectIncrement(load("simple-form"));
  assert.equal(s.title, "Simple form");
  assert.equal(s.pageType, "form");
  assert.equal(s.wireVersion, "3.0");
  const byId = Object.fromEntries(s.fields.map((f) => [f.id, f]));
  assert.ok(byId.name && byId.age && byId.active && byId.birthDate && byId.colour);
  assert.equal(byId.name.dataType, "string");
  assert.equal(byId.age.dataType, "integer");
  assert.equal(byId.active.dataType, "bool");
  // values come from state/initialData
  assert.equal(byId.name.value, "Ada");
  assert.equal(byId.age.value, 36);
  // select field carries its options
  assert.equal(byId.colour.stereotype, "select");
  assert.deepEqual(byId.colour.options.map((o) => o.value), ["red", "green", "blue"]);
});

test("every corpus case projects without throwing and yields a defined shape", () => {
  const names = ["simple-form", "stereotypes", "grid-field", "money-field", "validation", "tabs", "zones", "notice", "dashboard"];
  for (const name of names) {
    if (!existsSync(join(corpus, name, "expected.json"))) continue;
    const s = projectIncrement(load(name));
    assert.ok(Array.isArray(s.fields), `${name}: fields is an array`);
    assert.ok(Array.isArray(s.actions), `${name}: actions is an array`);
    assert.ok("state" in s, `${name}: has state`);
  }
});

test("validation case marks required fields", () => {
  const s = projectIncrement(load("validation"));
  // at least one field should be required in the validation fixture
  assert.ok(s.fields.some((f) => f.required), "expected a required field");
});

test("actions: ids from the ServerSide node, labels enriched from buttons", () => {
  const inc = {
    wireVersion: "3.0",
    commands: [{ type: "SetWindowTitle", data: "Editor" }],
    fragments: [
      {
        component: {
          type: "ServerSide",
          route: "editor",
          serverSideType: "com.acme.Editor",
          actions: [{ id: "save", confirmationRequired: true, shortcut: "ctrl+s" }, { id: "cancel" }],
          children: [
            {
              type: "ClientSide",
              metadata: { type: "Button", actionId: "save", label: "Guardar" },
            },
          ],
        },
        state: {},
      },
    ],
  };
  const s = projectIncrement(inc);
  const byId = Object.fromEntries(s.actions.map((a) => [a.id, a]));
  assert.equal(byId.save.label, "Guardar");
  assert.equal(byId.save.shortcut, "ctrl+s");
  assert.equal(byId.save.confirmationRequired, true);
  assert.equal(byId.cancel.label, "cancel"); // no button -> falls back to id
});

test("listing: Crudl projects columns, searchable and filters", () => {
  const inc = {
    wireVersion: "3.0",
    fragments: [
      {
        component: {
          type: "ServerSide",
          route: "products",
          serverSideType: "com.acme.Products",
          children: [
            {
              type: "ClientSide",
              metadata: {
                type: "Crudl",
                title: "Products",
                searchable: true,
                columns: [
                  { metadata: { id: "name", caption: "Name" } },
                  { metadata: { id: "price", caption: "Price" } },
                ],
                filters: [{ fieldId: "category", label: "Category", dataType: "string" }],
              },
            },
          ],
        },
      },
    ],
  };
  const s = projectIncrement(inc);
  assert.ok(s.listing);
  assert.equal(s.listing.searchable, true);
  assert.deepEqual(s.listing.columns.map((c) => c.id), ["name", "price"]);
  assert.equal(s.listing.filters[0].id, "category");
});

test("navigation commands are surfaced (navigateTo)", () => {
  const s = projectIncrement({
    commands: [{ type: "navigateTo", data: "/thanks" }, { type: "SetWindowTitle", data: "x" }],
    fragments: [],
  });
  assert.deepEqual(s.commands, [{ type: "navigateTo", data: "/thanks" }]);
});

test("routeToPath maps home and nested routes; _empty is the root", () => {
  assert.equal(routeToPath(""), "/_no_route");
  assert.equal(routeToPath("/"), "/_no_route");
  assert.equal(routeToPath("_empty"), "/_no_route");
  assert.equal(routeToPath("products"), "/products");
  assert.equal(routeToPath("/products"), "/products");
  assert.equal(normalizeRoute("_empty"), "");
  assert.equal(normalizeRoute("/products"), "products");
});

test("empty / malformed increment does not throw", () => {
  assert.doesNotThrow(() => projectIncrement({}));
  assert.doesNotThrow(() => projectIncrement(null));
  const s = projectIncrement(null);
  assert.deepEqual(s.fields, []);
  assert.deepEqual(s.actions, []);
});

// ---- MCP protocol layer (no backend needed: a fake wire) ----

const fakeWire = {
  listRoutes: async () => [{ route: "", caption: "Home" }, { route: "products", caption: "Products" }],
  describeScreen: async (route) => ({ route, title: "T", fields: [], actions: [] }),
  runAction: async (route, actionId) => ({ route, ranAction: actionId }),
  search: async (route, searchText) => ({ route, searched: searchText }),
};

test("MCP initialize returns protocol + serverInfo", async () => {
  const r = await handleRpc({ jsonrpc: "2.0", id: 1, method: "initialize", params: {} }, fakeWire);
  assert.equal(r.result.serverInfo.name, "mateu-mcp");
  assert.ok(r.result.protocolVersion);
  assert.ok(r.result.capabilities.tools);
});

test("MCP tools/list returns the 4 tools with schemas", async () => {
  const r = await handleRpc({ jsonrpc: "2.0", id: 2, method: "tools/list" }, fakeWire);
  const names = r.result.tools.map((t) => t.name);
  assert.deepEqual(names.sort(), ["mateu_describe_screen", "mateu_list_routes", "mateu_run_action", "mateu_search"]);
  for (const t of TOOLS) assert.equal(t.inputSchema.type, "object");
});

test("MCP tools/call dispatches and wraps the result as text content", async () => {
  const r = await handleRpc(
    { jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "mateu_run_action", arguments: { route: "editor", actionId: "save" } } },
    fakeWire
  );
  assert.equal(r.result.content[0].type, "text");
  assert.deepEqual(JSON.parse(r.result.content[0].text), { route: "editor", ranAction: "save" });
});

test("MCP tool error becomes an isError result, not a protocol error", async () => {
  const boomWire = { runAction: async () => { throw new Error("boom"); } };
  const r = await handleRpc(
    { jsonrpc: "2.0", id: 4, method: "tools/call", params: { name: "mateu_run_action", arguments: { route: "x", actionId: "y" } } },
    boomWire
  );
  assert.equal(r.result.isError, true);
  assert.match(r.result.content[0].text, /boom/);
});

test("MCP notification (no id) yields no response", async () => {
  const r = await handleRpc({ jsonrpc: "2.0", method: "notifications/initialized" }, fakeWire);
  assert.equal(r, null);
});

test("MCP unknown method yields -32601", async () => {
  const r = await handleRpc({ jsonrpc: "2.0", id: 5, method: "nope/nope" }, fakeWire);
  assert.equal(r.error.code, -32601);
});
