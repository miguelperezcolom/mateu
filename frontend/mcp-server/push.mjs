// Live UI push (phase C): the tools that send UI to a UI open in a browser tab or app window, and read
// and operate its screen.
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
  {
    name: "mateu_get_session_screen",
    description:
      "Read what the user sees in a live UI session, as that tab draws it: route, window title, page " +
      "header, fields (id, label, type, value, required, readOnly, error, options), the actions the " +
      "user can press (id, label, enabled), the rows of each listing's current page with its search, " +
      "filters, sort, page and total, an open dialog or drawer (focus: overlay, in front of the page) " +
      "and the last messages. Only what the screen shows; long values and lists are capped and named " +
      "in truncated. Returns {session, screen}.",
    inputSchema: objSchema({ session: SESSION }, ["session"]),
  },
  {
    name: "mateu_set_session_fields",
    description:
      "Type values into fields of the screen in a live UI session (the dialog's or drawer's when one " +
      "is open), exactly as the user editing them: validation, client rules and the unsaved-changes " +
      "state follow. Only fields the screen shows as editable: any other refuses the whole call and " +
      "nothing changes. Returns {session, screen} after the change.",
    inputSchema: objSchema(
      {
        session: SESSION,
        values: {
          type: "object",
          description: "field id -> value (a string, number, boolean, or a list for a multi-value field)",
        },
      },
      ["session", "values"],
    ),
  },
  {
    name: "mateu_run_session_action",
    description:
      "Press an action the screen in a live UI session offers (an id from mateu_get_session_screen; a " +
      "row action needs row), as the user clicking it: validation runs, and a confirmation the action " +
      "asks for is shown to the user, who answers it. Returns {session, screen} once the screen " +
      "settled.",
    inputSchema: objSchema(
      {
        session: SESSION,
        actionId: str("an action id from mateu_get_session_screen"),
        parameters: { type: "object", description: "optional: extra parameters of the action" },
        row: {
          type: "integer",
          description: "optional, for a row action: the 0-based index of the row in the listing's rows",
        },
        listing: str("optional, for a row action on a screen with several listings: the listing id"),
      },
      ["session", "actionId"],
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
  return withoutTrailingSlashes(env.MATEU_BASE_URL) + "/mateu/mcp";
}

/**
 * `url` without its trailing slashes. A scan from the end, not `/\/+$/`: that regex backtracks
 * quadratically on a long run of slashes followed by anything else (CodeQL js/polynomial-redos).
 */
export function withoutTrailingSlashes(url) {
  let end = url.length;
  while (end > 0 && url.charCodeAt(end - 1) === 47 /* "/" */) end--;
  return url.slice(0, end);
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
