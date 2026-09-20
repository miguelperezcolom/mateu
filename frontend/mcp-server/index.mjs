#!/usr/bin/env node
// Mateu MCP server (sidecar) — exposes any live Mateu backend as Model Context Protocol tools so any
// agent (Claude, Antigravity, an internal copilot) can discover and operate the app. It speaks only
// the public wire, so it works against a Java, .NET or Python backend with no backend change.
//
// This is the "agent renderer": same self-describing model as the web renderers, tools instead of
// pixels. Part of the Riu agent-operability plane (design/riu-agent-operability-plan.md, P1).
//
// Zero external dependencies (same philosophy as frontend/reference-renderer/): the MCP protocol is
// JSON-RPC 2.0 over newline-delimited JSON on stdio, implemented here by hand.
//
// Config (env): MATEU_BASE_URL (required, e.g. http://localhost:8080), MATEU_TOKEN (optional Bearer
// passed through to the backend — RBAC is enforced by the backend, this server only relays it).

import { createInterface } from "node:readline";
import { MateuWire } from "./wire.mjs";

const PROTOCOL_VERSION = "2024-11-05";
const SERVER_INFO = { name: "mateu-mcp", version: "0.1.0" };

export const TOOLS = [
  {
    name: "mateu_list_routes",
    description:
      "List the navigable routes of the Mateu app (derived from its menu). Returns [{route, caption}].",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "mateu_describe_screen",
    description:
      "Load a screen by route and return a flat description an agent can act on: title, fields " +
      "(id, label, dataType, required, value, options), actions (id, label), listing (if any), and " +
      "the current state. Use route \"\" for the home screen.",
    inputSchema: {
      type: "object",
      properties: { route: { type: "string", description: "route relative to the mount, \"\" = home" } },
      required: ["route"],
      additionalProperties: false,
    },
  },
  {
    name: "mateu_run_action",
    description:
      "Run an action on a screen (an action id from mateu_describe_screen), optionally seeding field " +
      "values via componentState. Returns the resulting screen projection (messages, navigation, new state).",
    inputSchema: {
      type: "object",
      properties: {
        route: { type: "string" },
        actionId: { type: "string" },
        componentState: { type: "object", description: "field id -> value; seeds/overrides form state" },
      },
      required: ["route", "actionId"],
      additionalProperties: false,
    },
  },
  {
    name: "mateu_search",
    description: "Search a listing screen with free text (and optional filter values). Returns the listing.",
    inputSchema: {
      type: "object",
      properties: {
        route: { type: "string" },
        searchText: { type: "string" },
        filters: { type: "object" },
      },
      required: ["route"],
      additionalProperties: false,
    },
  },
];

async function dispatchTool(wire, name, args) {
  switch (name) {
    case "mateu_list_routes":
      return wire.listRoutes();
    case "mateu_describe_screen":
      return wire.describeScreen(args.route ?? "");
    case "mateu_run_action":
      return wire.runAction(args.route ?? "", args.actionId, args.componentState ?? null);
    case "mateu_search":
      return wire.search(args.route ?? "", args.searchText ?? "", args.filters ?? null);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

/** Handle a single JSON-RPC request object; returns a response object, or null for notifications. */
export async function handleRpc(message, wire) {
  const { id, method, params } = message;
  const isNotification = id === undefined || id === null;
  try {
    let result;
    switch (method) {
      case "initialize":
        result = {
          protocolVersion: PROTOCOL_VERSION,
          capabilities: { tools: {} },
          serverInfo: SERVER_INFO,
        };
        break;
      case "notifications/initialized":
      case "initialized":
        return null; // notification, no response
      case "ping":
        result = {};
        break;
      case "tools/list":
        result = { tools: TOOLS };
        break;
      case "tools/call": {
        const data = await dispatchTool(wire, params?.name, params?.arguments ?? {});
        result = { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
        break;
      }
      default:
        if (isNotification) return null;
        return { jsonrpc: "2.0", id, error: { code: -32601, message: `Method not found: ${method}` } };
    }
    if (isNotification) return null;
    return { jsonrpc: "2.0", id, result };
  } catch (err) {
    const errMsg = err && err.message ? err.message : String(err);
    if (isNotification) return null;
    if (method === "tools/call") {
      // MCP convention: tool errors are a result with isError, not a protocol error.
      return {
        jsonrpc: "2.0",
        id,
        result: { content: [{ type: "text", text: `Error: ${errMsg}` }], isError: true },
      };
    }
    return { jsonrpc: "2.0", id, error: { code: -32603, message: errMsg } };
  }
}

function main() {
  const wire = new MateuWire({ baseUrl: process.env.MATEU_BASE_URL, token: process.env.MATEU_TOKEN });
  const rl = createInterface({ input: process.stdin });
  const send = (obj) => process.stdout.write(JSON.stringify(obj) + "\n");
  rl.on("line", async (line) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    let message;
    try {
      message = JSON.parse(trimmed);
    } catch {
      send({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } });
      return;
    }
    const response = await handleRpc(message, wire);
    if (response) send(response);
  });
  process.stderr.write(`mateu-mcp: ready (backend ${wire.baseUrl})\n`);
}

// Run only when invoked directly (not when imported by tests).
if (import.meta.url === `file://${process.argv[1]}`) main();
