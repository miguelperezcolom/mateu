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
// passed through to the backend — RBAC is enforced by the backend, this server only relays it),
// MATEU_DEV ("true"/"1": offer mateu_save_spec), MATEU_SPECS_DIR (where it writes; default
// src/main/resources/specs/ui under the working directory), MATEU_ERRORS_DETAILED (raw errors),
// MATEU_PUSH ("true"/"1": offer the live UI push tools, forwarded to the backend's MCP endpoint),
// MATEU_MCP_URL (that endpoint; default <MATEU_BASE_URL>/mateu/mcp), MATEU_AGENT_KEY (the
// X-Mateu-Agent-Key sent with them; default a random key generated once per process).

import { createInterface } from "node:readline";
import { randomBytes } from "node:crypto";
import { MateuWire, HttpError } from "./wire.mjs";
import {
  UserFacingError,
  quote,
  listComponents,
  componentSchema,
  validate,
  preview,
  saveSpec,
  specsDir,
  resourceList,
  resourceByUri,
  resourceText,
} from "./authoring.mjs";
import { PUSH_TOOLS, isPushMode, isPushTool, forwardPushTool } from "./push.mjs";

const PROTOCOL_VERSION = "2024-11-05";
const SERVER_INFO = { name: "mateu-mcp", version: "0.1.0" };

const objSchema = (properties, required) => ({
  type: "object",
  properties,
  additionalProperties: false,
  ...(required ? { required } : {}),
});
const str = (description) => (description ? { type: "string", description } : { type: "string" });
const obj = (description) => (description ? { type: "object", description } : { type: "object" });

/**
 * The tool list — identical (names, descriptions, schemas, order) in the Java, .NET and Python
 * backends and this sidecar; pinned by conformance/mcp/authoring.json. Outside development mode.
 */
export const TOOLS = [
  {
    name: "mateu_list_routes",
    description:
      "List the navigable routes of the Mateu app (derived from its menu). Returns [{route, caption}].",
    inputSchema: objSchema({}),
  },
  {
    name: "mateu_describe_screen",
    description:
      "Load a screen by route and return a flat description an agent can act on: title, fields " +
      "(id, label, dataType, required, value, options), actions (id, label), listing (if any), and " +
      "the current state. Use route \"\" for the home screen.",
    inputSchema: objSchema({ route: str("route relative to the mount, \"\" = home") }, ["route"]),
  },
  {
    name: "mateu_run_action",
    description:
      "Run an action on a screen (an action id from mateu_describe_screen), optionally seeding field " +
      "values via componentState. Returns the resulting screen projection (messages, navigation, new state).",
    inputSchema: objSchema(
      {
        route: str(),
        actionId: str(),
        componentState: obj("field id -> value; seeds/overrides form state"),
      },
      ["route", "actionId"],
    ),
  },
  {
    name: "mateu_search",
    description: "Search a listing screen with free text (and optional filter values). Returns the listing.",
    inputSchema: objSchema({ route: str(), searchText: str(), filters: obj() }, ["route"]),
  },
  {
    name: "mateu_list_components",
    description:
      "List the component types a YAML definition can use, each with a one-line description and the " +
      "names of its main attributes. Read mateu://guide first if you have not authored Mateu YAML before.",
    inputSchema: objSchema({ query: str("optional: only the types whose name or description contains it") }),
  },
  {
    name: "mateu_get_component_schema",
    description:
      "Return the JSON Schema of one component type: every key it accepts with its value type, plus " +
      "every definition it references (enums, nested records). A #/$defs/Component reference means any component.",
    inputSchema: objSchema(
      { type: str("a component type (e.g. FormField) or any other schema definition") },
      ["type"],
    ),
  },
  {
    name: "mateu_validate_uidl",
    description:
      "Validate a YAML definition (a page, an app shell or any specs/ui file kind) without rendering " +
      "it. Returns {valid, kind, errors, warnings}; each issue has a code, a message, a JSONPath and " +
      "its line/column. Errors make the definition fail to load; warnings are ignored keys, undeclared " +
      "actions and references that do not resolve.",
    inputSchema: objSchema({ yaml: str("the definition's YAML text") }, ["yaml"]),
  },
  {
    name: "mateu_preview_uidl",
    description:
      "Render a YAML page as the app would — layout only: no view model is bound and nothing is " +
      "saved — and return {rendered, screen, validation}: the screen projection (title, fields, " +
      "actions…) plus the validation report.",
    inputSchema: objSchema(
      {
        yaml: str("the page's YAML text"),
        route: str("optional: the route to render it under (its access rules apply)"),
      },
      ["yaml"],
    ),
  },
];

/** The tools appended in development mode. */
export const DEV_TOOLS = [
  {
    name: "mateu_save_spec",
    description:
      "Development mode only: validate a YAML definition and, when it has no errors, write it into " +
      "the app's specs directory (path relative to it, e.g. customers.yaml or partials/address.yaml); " +
      "live reload shows it in the open browsers. Paths outside the specs directory are refused.",
    inputSchema: objSchema(
      {
        path: str("relative to the specs directory, e.g. customers.yaml"),
        yaml: str("the definition's YAML text"),
      },
      ["path", "yaml"],
    ),
  },
];

const truthy = (v) => v === "true" || v === "1";

/** Development mode: MATEU_DEV = "true" | "1". */
export const isDevMode = (env = process.env) => truthy(env.MATEU_DEV);

/**
 * The tools/list answer for the given environment: the base tools, then the push tools (MATEU_PUSH),
 * then mateu_save_spec (MATEU_DEV) — the same order as the backends.
 */
export function toolsFor(env = process.env) {
  return [...TOOLS, ...(isPushMode(env) ? PUSH_TOOLS : []), ...(isDevMode(env) ? DEV_TOOLS : [])];
}

/** A required string argument, or the caller's mistake. */
function argument(args, name) {
  const value = args?.[name];
  if (typeof value !== "string") throw new UserFacingError(`Missing argument ${quote(name)}.`);
  return value;
}

/** An optional string argument ("" when absent or not a string, like Jackson's asText("")). */
const optional = (args, name) => (typeof args?.[name] === "string" ? args[name] : "");
const optionalObject = (args, name) =>
  args?.[name] && typeof args[name] === "object" && !Array.isArray(args[name]) ? args[name] : null;

async function dispatchTool(wire, name, args, env) {
  switch (name) {
    case "mateu_list_routes":
      return wire.listRoutes();
    case "mateu_describe_screen":
      return wire.describeScreen(optional(args, "route"));
    case "mateu_run_action":
      return wire.runAction(optional(args, "route"), argument(args, "actionId"), optionalObject(args, "componentState"));
    case "mateu_search":
      return wire.search(optional(args, "route"), optional(args, "searchText"), optionalObject(args, "filters"));
    case "mateu_list_components":
      return listComponents(optional(args, "query"));
    case "mateu_get_component_schema":
      return componentSchema(argument(args, "type"));
    case "mateu_validate_uidl":
      return validate(wire, argument(args, "yaml"));
    case "mateu_preview_uidl":
      return preview(wire, argument(args, "yaml"), optional(args, "route"));
    case "mateu_save_spec": {
      if (!isDevMode(env)) throw new UserFacingError(`Unknown tool: ${name}`);
      const dir = specsDir(env);
      if (!dir) throw new UserFacingError("No specs directory found (set MATEU_SPECS_DIR).");
      return saveSpec(wire, argument(args, "path"), argument(args, "yaml"), dir);
    }
    default:
      throw new UserFacingError(`Unknown tool: ${name ?? ""}`);
  }
}

/**
 * What a failed call tells the agent: a caller mistake as written; a refused request (403) as
 * "Forbidden"; anything else a generic text with a reference, written to stderr with the real
 * error (the raw message too only with MATEU_ERRORS_DETAILED=true).
 */
export function errorText(err, tool, env = process.env) {
  if (err instanceof UserFacingError) return err.message;
  if (err instanceof HttpError && err.status === 403) return "Forbidden";
  const reference = randomBytes(6).toString("hex");
  process.stderr.write(
    `mateu-mcp: ERROR handling ${tool ? "tool " + tool : "request"} [ref ${reference}]: ` +
      `${err && err.stack ? err.stack : String(err)}${err instanceof HttpError && err.body ? "\n" + err.body : ""}\n`,
  );
  if (truthy(env.MATEU_ERRORS_DETAILED)) {
    const raw = err && err.message ? err.message : String(err);
    const body = err instanceof HttpError && err.body ? ": " + err.body : "";
    return `${raw}${body} (ref ${reference})`;
  }
  return `An unexpected error occurred. Reference: ${reference}`;
}

/**
 * Handle a single parsed JSON-RPC message; returns a response object, or null for notifications.
 * `options.env` (default process.env) carries MATEU_DEV / MATEU_SPECS_DIR / MATEU_ERRORS_DETAILED /
 * MATEU_PUSH / MATEU_MCP_URL / MATEU_AGENT_KEY; `options.fetch` overrides the fetch used to forward
 * the push tools.
 */
export async function handleRpc(message, wire, options = {}) {
  const env = options.env ?? process.env;
  if (message === null || typeof message !== "object" || Array.isArray(message)) {
    return { jsonrpc: "2.0", id: null, error: { code: -32600, message: "Invalid Request" } };
  }
  const { id, method, params } = message;
  const isNotification = id === undefined || id === null;
  const respond = (result) => (isNotification ? null : { jsonrpc: "2.0", id, result });
  const fail = (code, msg) => (isNotification ? null : { jsonrpc: "2.0", id, error: { code, message: msg } });
  try {
    switch (method) {
      case "initialize":
        return respond({
          protocolVersion: PROTOCOL_VERSION,
          capabilities: { tools: {}, resources: {} },
          serverInfo: SERVER_INFO,
        });
      case "notifications/initialized":
      case "initialized":
        return null; // notification, no response
      case "ping":
        return respond({});
      case "tools/list":
        return respond({ tools: toolsFor(env) });
      case "resources/list":
        return respond({ resources: resourceList() });
      case "resources/read": {
        const uri = params?.uri;
        if (typeof uri !== "string") return fail(-32602, "Invalid params: uri is required");
        const resource = resourceByUri(uri);
        if (!resource) return fail(-32002, `Resource not found: ${uri}`);
        return respond({
          contents: [{ uri: resource.uri, mimeType: resource.mimeType, text: resourceText(resource.file) }],
        });
      }
      case "tools/call": {
        if (isPushMode(env) && isPushTool(params?.name)) {
          // Forwarded to the backend's MCP endpoint; its tool result is relayed as is.
          return respond(
            await forwardPushTool(params.name, params?.arguments ?? {}, env, options.fetch ?? globalThis.fetch),
          );
        }
        const data = await dispatchTool(wire, params?.name, params?.arguments ?? {}, env);
        return respond({ content: [{ type: "text", text: JSON.stringify(data, null, 2) }] });
      }
      default:
        return fail(-32601, `Method not found: ${method}`);
    }
  } catch (err) {
    if (isNotification) return null;
    const text = errorText(err, method === "tools/call" ? String(params?.name ?? "") : null, env);
    if (method === "tools/call") {
      // MCP convention: tool errors are a result with isError, not a protocol error.
      return { jsonrpc: "2.0", id, result: { isError: true, content: [{ type: "text", text: `Error: ${text}` }] } };
    }
    return { jsonrpc: "2.0", id, error: { code: -32603, message: text } };
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
