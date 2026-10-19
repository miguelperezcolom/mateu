// Live UI push (phase C): the five tools that send UI to a UI open in a browser tab or app window.
// The sidecar holds no sessions — each call is forwarded as a JSON-RPC `tools/call` to the backend's
// own MCP endpoint, which owns sessions, pairing, visibility and rate limits, and its result is
// relayed as is. Spec: conformance/mcp/README.md, "Live UI push (phase C)" → "The sidecar"; the
// tool list is pinned byte for byte by conformance/mcp/push.json.

import { randomBytes } from "node:crypto";

const objSchema = (properties, required) => ({
  type: "object",
  properties,
  additionalProperties: false,
  ...(required ? { required } : {}),
});
const str = (description) => ({ type: "string", description });
const SESSION = str("a session from mateu_list_sessions or mateu_pair_session");

/** The push tools — listed after the base tools and before mateu_save_spec, only with MATEU_PUSH. */
export const PUSH_TOOLS = [
  {
    name: "mateu_list_sessions",
    description:
      "List the live UI sessions (browser tabs, app windows) this caller may send UI to: its own " +
      "(same signed-in user) and the ones paired to it with mateu_pair_session. Returns {sessions: " +
      "[{session, user, route, renderer, connectedAt, connected, paired}]}.",
    inputSchema: objSchema({}),
  },
  {
    name: "mateu_pair_session",
    description:
      "Pair a live UI session with this caller, using the one-time code the user sees after clicking " +
      "\"Connect AI\" in the app. Returns the session; it can then be addressed by mateu_push_ui, " +
      "mateu_navigate and mateu_dispatch_event. The code expires in minutes and works once.",
    inputSchema: objSchema({ code: str("the pairing code shown in the app, e.g. K7QF-4MZP") }, ["code"]),
  },
  {
    name: "mateu_push_ui",
    description:
      "Show a screen in a live UI session: validate the YAML page first (nothing is sent when it has " +
      "errors), then render it in that tab, in the content area (default), a drawer or a dialog. " +
      "Layout only: no view model is bound. Returns {delivered, session, target, validation} or " +
      "{delivered: false, reason, validation}.",
    inputSchema: objSchema(
      {
        session: SESSION,
        yaml: str("the page's YAML text"),
        target: {
          type: "string",
          enum: ["content", "drawer", "dialog"],
          description: "where to show it (default content)",
        },
        title: str("optional: the drawer's or dialog's header"),
      },
      ["session", "yaml"],
    ),
  },
  {
    name: "mateu_navigate",
    description:
      "Navigate a live UI session to a route of the app, like a click on the menu entry carrying " +
      "these fields. Returns {delivered, session}.",
    inputSchema: objSchema(
      {
        session: SESSION,
        route: str("the target route, e.g. /orders/42"),
        consumedRoute: str("optional: the route consumed by the app shell (usually \"\")"),
        actionId: str("optional: an action to run on arrival"),
        baseUrl: str("optional: the base URL of the target micro-frontend"),
        serverSideType: str("optional: the server-side type of the target UI"),
        uriPrefix: str("optional: the URI prefix (usually \"\")"),
      },
      ["session", "route"],
    ),
  },
  {
    name: "mateu_dispatch_event",
    description:
      "Dispatch a named UI event in a live UI session, for the components that subscribe to it " +
      "(@SubscribeTo). The built-in events are reserved: use mateu_push_ui and mateu_navigate for " +
      "them. Returns {delivered, session}.",
    inputSchema: objSchema(
      {
        session: SESSION,
        event: str("the event name, e.g. highlight-row"),
        detail: { type: "object", description: "optional: the event's detail" },
      },
      ["session", "event"],
    ),
  },
];

const PUSH_TOOL_NAMES = new Set(PUSH_TOOLS.map((t) => t.name));

/** Push mode: MATEU_PUSH = "true" | "1". */
export const isPushMode = (env = process.env) => env.MATEU_PUSH === "true" || env.MATEU_PUSH === "1";

/** Whether `name` is one of the push tools (regardless of the switch). */
export const isPushTool = (name) => PUSH_TOOL_NAMES.has(name);

/** The backend's MCP endpoint: MATEU_MCP_URL, else <MATEU_BASE_URL>/mateu/mcp. */
export function mcpUrl(env = process.env) {
  if (env.MATEU_MCP_URL) return env.MATEU_MCP_URL;
  if (!env.MATEU_BASE_URL) return null;
  return env.MATEU_BASE_URL.replace(/\/+$/, "") + "/mateu/mcp";
}

let processAgentKey = null;

/**
 * The X-Mateu-Agent-Key this sidecar identifies itself with: MATEU_AGENT_KEY, else a random key
 * (43 URL-safe characters, 256 bits) generated once per process — so pairings survive across calls
 * for the life of the process.
 */
export function agentKey(env = process.env) {
  if (env.MATEU_AGENT_KEY) return env.MATEU_AGENT_KEY;
  if (!processAgentKey) processAgentKey = randomBytes(32).toString("base64url");
  return processAgentKey;
}

const toolError = (text) => ({ isError: true, content: [{ type: "text", text: `Error: ${text}` }] });

let nextForwardId = 1;

/**
 * Forward one push tool call to the backend and return the MCP tool result (`{content, isError?}`)
 * to relay — the backend's own result as is, or a tool error naming what went wrong on the way.
 */
export async function forwardPushTool(name, args, env = process.env, fetchImpl = globalThis.fetch) {
  const url = mcpUrl(env);
  if (!url) return toolError("Set MATEU_MCP_URL or MATEU_BASE_URL to reach the backend's MCP endpoint.");
  const unreachable = `The backend's MCP endpoint is not reachable at ${url}`;
  const hint = "is the backend running with mateu.mcp.enabled=true?";
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Mateu-Agent-Key": agentKey(env),
  };
  if (env.MATEU_TOKEN) headers.Authorization = `Bearer ${env.MATEU_TOKEN}`;
  const body = JSON.stringify({
    jsonrpc: "2.0",
    id: nextForwardId++,
    method: "tools/call",
    params: { name, arguments: args ?? {} },
  });

  let res;
  try {
    res = await fetchImpl(url, { method: "POST", headers, body });
  } catch (err) {
    const cause = err?.cause?.code || err?.cause?.message || err?.message || String(err);
    return toolError(`${unreachable} (${cause}) — ${hint}`);
  }
  if (res.status === 401 || res.status === 403) {
    return toolError(`The backend's MCP endpoint refused the call (HTTP ${res.status}): check MATEU_TOKEN.`);
  }
  if (!res.ok) return toolError(`${unreachable} (HTTP ${res.status}) — ${hint}`);

  let answer;
  try {
    answer = JSON.parse(await res.text());
  } catch {
    return toolError(`The backend's MCP endpoint at ${url} did not answer JSON-RPC — ${hint}`);
  }
  if (answer?.error) {
    return toolError(`The backend's MCP endpoint answered: ${answer.error.message ?? JSON.stringify(answer.error)}`);
  }
  const result = answer?.result;
  if (!result || typeof result !== "object" || !Array.isArray(result.content)) {
    return toolError(`The backend's MCP endpoint at ${url} answered no tool result.`);
  }
  const text = result.content[0]?.text;
  if (result.isError && typeof text === "string" && text.trim() === `Error: Unknown tool: ${name}`) {
    return toolError(
      `The backend does not offer ${name}: live UI push must be enabled on the backend ` +
        "(mateu.mcp.push.enabled=true / MATEU_MCP_PUSH_ENABLED=true).",
    );
  }
  return result;
}
