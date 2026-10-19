#!/usr/bin/env node
// End-to-end probe for the Mateu MCP sidecar (frontend/mcp-server).
//
// Spawns the real server as a child process, talks MCP (JSON-RPC 2.0 over newline-delimited stdio),
// and drives it against a LIVE Mateu backend: initialize -> tools/list -> list_routes ->
// describe_screen -> (optional) run an action, then the AUTHORING plane: resources/list + read,
// list_components, get_component_schema, validate_uidl (errors with lines) and preview_uidl.
// Exits non-zero on any failure.
//
//   MATEU_BASE_URL=http://localhost:8080 node e2e/mcp-probe.mjs [--route <route>] [--action <id>]
//   MATEU_BASE_URL=http://localhost:8080 node e2e/mcp-probe.mjs --native   # the app's own /mateu/mcp
//
// This is the live-backend counterpart to the unit tests (which cover the projection + protocol
// against the conformance corpus with no backend).

import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createInterface } from "node:readline";

const here = dirname(fileURLToPath(import.meta.url));
const serverPath = join(here, "..", "frontend", "mcp-server", "index.mjs");

const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
};
const baseUrl = process.env.MATEU_BASE_URL || opt("--base", "http://localhost:8080");
const wantRoute = opt("--route", null);
const wantAction = opt("--action", null);

const native = args.includes("--native");

const child = native
  ? null
  : spawn("node", [serverPath], {
      env: { ...process.env, MATEU_BASE_URL: baseUrl },
      stdio: ["pipe", "pipe", "inherit"],
    });

let nextId = 1;
const pending = new Map();
const rl = child ? createInterface({ input: child.stdout }) : { on() {} };
rl.on("line", (line) => {
  const t = line.trim();
  if (!t) return;
  let msg;
  try { msg = JSON.parse(t); } catch { return; }
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg);
    pending.delete(msg.id);
  }
});

async function nativeRpc(method, params) {
  const id = nextId++;
  const res = await fetch(baseUrl.replace(/\/+$/, "") + "/mateu/mcp", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id, method, params }),
  });
  const msg = await res.json();
  if (msg.error) throw new Error(JSON.stringify(msg.error));
  return msg.result;
}

function rpc(method, params) {
  if (native) return nativeRpc(method, params);
  const id = nextId++;
  return new Promise((resolve, reject) => {
    pending.set(id, (msg) => (msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result)));
    child.stdin.write(JSON.stringify({ jsonrpc: "2.0", id, method, params }) + "\n");
    setTimeout(() => { if (pending.has(id)) { pending.delete(id); reject(new Error(`timeout on ${method}`)); } }, 30000);
  });
}

const checks = [];
const check = (name, ok, detail) => {
  checks.push({ name, ok });
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? " — " + detail : ""}`);
};

function toolJson(result) {
  return JSON.parse(result.content[0].text);
}

async function run() {
  const init = await rpc("initialize", { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "mcp-probe", version: "1" } });
  check("initialize returns serverInfo", init?.serverInfo?.name === "mateu-mcp", init?.serverInfo?.name);

  const list = await rpc("tools/list", {});
  const names = (list.tools || []).map((t) => t.name).sort();
  const expected = [
    "mateu_describe_screen", "mateu_get_component_schema", "mateu_list_components", "mateu_list_routes",
    "mateu_preview_uidl", "mateu_run_action", "mateu_search", "mateu_validate_uidl",
  ];
  const withoutDev = names.filter((n) => n !== "mateu_save_spec");
  check("tools/list has the 8 tools (+ save_spec in dev mode)", withoutDev.join(",") === expected.join(","), names.join(","));

  const routesRes = await rpc("tools/call", { name: "mateu_list_routes", arguments: {} });
  const routes = toolJson(routesRes);
  check("list_routes returns routes", Array.isArray(routes) && routes.length >= 1, `${routes.length} route(s)`);

  const route = wantRoute ?? (routes.find((r) => r.route)?.route ?? "");
  const screenRes = await rpc("tools/call", { name: "mateu_describe_screen", arguments: { route } });
  const screen = toolJson(screenRes);
  check(`describe_screen("${route}") returns a screen`, !!screen && typeof screen === "object", screen.title || screen.pageType || "(untitled)");
  check("screen has fields[] and actions[]", Array.isArray(screen.fields) && Array.isArray(screen.actions), `${screen.fields?.length} fields, ${screen.actions?.length} actions`);
  check("screen carries wireVersion", !!screen.wireVersion, screen.wireVersion);

  if (wantAction) {
    const actionRes = await rpc("tools/call", { name: "mateu_run_action", arguments: { route, actionId: wantAction } });
    check(`run_action("${wantAction}") did not error`, !actionRes.isError, actionRes.isError ? actionRes.content[0].text : "ok");
  }

  // ── the authoring plane ──
  const resources = await rpc("resources/list", {});
  const uris = (resources.resources || []).map((r) => r.uri);
  check("resources/list has the 4 resources", uris.join(",") === "mateu://guide,mateu://catalog,mateu://schema/specs,mateu://schema/uidl", uris.join(","));
  const guide = await rpc("resources/read", { uri: "mateu://guide" });
  check("the guide reads back", (guide.contents?.[0]?.text || "").includes("dataType"));
  const specs = await rpc("resources/read", { uri: "mateu://schema/specs" });
  check("the specs schema reads back as JSON", !!JSON.parse(specs.contents[0].text).$defs?.Component);

  const comps = toolJson(await rpc("tools/call", { name: "mateu_list_components", arguments: { query: "button" } }));
  check("list_components filters by query", comps.count >= 1 && comps.components.some((c) => c.type === "Button"), `${comps.count} match(es)`);
  const schema = toolJson(await rpc("tools/call", { name: "mateu_get_component_schema", arguments: { type: "FormField" } }));
  check("get_component_schema(FormField) resolves its enums", !!schema.definitions?.FieldDataType, Object.keys(schema.definitions || {}).length + " definitions");

  const bad = "type: FormLayout\ncontent:\n  - type: FormField\n    id: price\n    dataType: decimal\n  - type: Buton\n";
  const report = toolJson(await rpc("tools/call", { name: "mateu_validate_uidl", arguments: { yaml: bad } }));
  const codes = (report.errors || []).map((e) => `${e.code}@${e.line}`).join(",");
  check("validate_uidl reports every error with its line", codes === "invalid_value@5,unknown_type@6", codes);

  const page = "type: FormLayout\ncontent:\n  - type: FormField\n    id: city\n    label: City\n    dataType: string\n";
  const preview = toolJson(await rpc("tools/call", { name: "mateu_preview_uidl", arguments: { yaml: page } }));
  check("preview_uidl renders the page", preview.rendered === true && preview.screen?.fields?.[0]?.id === "city", preview.reason || "");

  const failed = checks.filter((c) => !c.ok);
  console.log(`\n${checks.length - failed.length}/${checks.length} checks passed`);
  child?.kill();
  process.exit(failed.length ? 1 : 0);
}

run().catch((err) => {
  console.error("PROBE ERROR:", err.message);
  child?.kill();
  process.exit(1);
});
