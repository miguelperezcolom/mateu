// The sidecar's live UI push tools (conformance/mcp/push.json): listed only with MATEU_PUSH, in the
// backends' order, and forwarded verbatim to the backend's own MCP endpoint.
//   node --test
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createServer } from "node:http";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { handleRpc } from "./index.mjs";
import { agentKey, mcpUrl } from "./push.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const mcp = (file) => JSON.parse(readFileSync(join(here, "..", "..", "conformance", "mcp", file), "utf8"));
const authoring = mcp("authoring.json");
const push = mcp("push.json");

let nextId = 1;
const rpc = (method, params, env = {}) =>
  handleRpc({ jsonrpc: "2.0", id: nextId++, method, ...(params ? { params } : {}) }, null, { env });
const call = (name, args, env) => rpc("tools/call", { name, arguments: args }, env);
const errorOf = (r) => {
  assert.equal(r.result.isError, true, JSON.stringify(r));
  return r.result.content[0].text;
};

/** An in-process backend answering each POST with `answer(request)` → {status, body}. */
async function fakeBackend(answer) {
  const requests = [];
  const server = createServer((req, res) => {
    let raw = "";
    req.on("data", (c) => (raw += c));
    req.on("end", () => {
      const request = { method: req.method, url: req.url, headers: req.headers, body: JSON.parse(raw || "null") };
      requests.push(request);
      const { status = 200, body } = answer(request);
      res.writeHead(status, { "Content-Type": "application/json" });
      res.end(typeof body === "string" ? body : JSON.stringify(body));
    });
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  return { base, requests, close: () => new Promise((resolve) => server.close(resolve)) };
}

const rpcResult = (request, result) => ({ body: { jsonrpc: "2.0", id: request.body.id, result } });

// ── the tool list ────────────────────────────────────────────────────────────────────────────

test("push.json: without MATEU_PUSH the push tools are not listed", async () => {
  for (const env of [{}, { MATEU_PUSH: "yes" }, { MATEU_PUSH: "false" }]) {
    const r = await rpc("tools/list", null, env);
    assert.equal(JSON.stringify(r.result.tools), JSON.stringify(authoring.tools));
  }
});

test("push.json: MATEU_PUSH lists the push tools after the base tools, byte for byte", async () => {
  for (const v of ["true", "1"]) {
    const r = await rpc("tools/list", null, { MATEU_PUSH: v });
    assert.equal(JSON.stringify(r.result.tools), JSON.stringify([...authoring.tools, ...push.pushTools]));
  }
});

test("push.json: with MATEU_DEV too, mateu_save_spec comes after the push tools", async () => {
  const r = await rpc("tools/list", null, { MATEU_PUSH: "true", MATEU_DEV: "true" });
  assert.equal(
    JSON.stringify(r.result.tools),
    JSON.stringify([...authoring.tools, ...push.pushTools, ...authoring.devTools]),
  );
});

test("without MATEU_PUSH a push tool is an unknown tool", async () => {
  for (const t of push.pushTools) {
    assert.equal(errorOf(await call(t.name, {}, { MATEU_BASE_URL: "http://127.0.0.1:1" })), `Error: Unknown tool: ${t.name}`);
  }
});

// ── forwarding ───────────────────────────────────────────────────────────────────────────────

test("a push tool call is forwarded to <MATEU_BASE_URL>/mateu/mcp and its result relayed verbatim", async () => {
  const delivered = { content: [{ type: "text", text: '{\n  "delivered": true,\n  "session": "s1"\n}' }] };
  const refused = { isError: true, content: [{ type: "text", text: 'Error: Unknown session "nope".' }] };
  const backend = await fakeBackend((rq) => rpcResult(rq, rq.body.params.arguments.session === "nope" ? refused : delivered));
  try {
    const env = { MATEU_PUSH: "true", MATEU_BASE_URL: backend.base + "/", MATEU_TOKEN: "tok-123" };
    const args = { session: "s1", yaml: "type: Text\ntext: Hello\n", target: "drawer", title: "Greeting" };
    const ok = await call("mateu_push_ui", args, env);
    assert.deepEqual(ok.result, delivered);
    const ko = await call("mateu_navigate", { session: "nope", route: "/" }, env);
    assert.deepEqual(ko.result, refused);

    assert.equal(backend.requests.length, 2);
    const [first, second] = backend.requests;
    for (const rq of backend.requests) {
      assert.equal(rq.method, "POST");
      assert.equal(rq.url, "/mateu/mcp");
      assert.equal(rq.headers.authorization, "Bearer tok-123");
      assert.match(rq.headers["content-type"], /^application\/json/);
      assert.ok(rq.headers["x-mateu-agent-key"].length >= 32, rq.headers["x-mateu-agent-key"]);
      assert.equal(rq.body.jsonrpc, "2.0");
      assert.equal(rq.body.method, "tools/call");
    }
    assert.deepEqual(first.body.params, { name: "mateu_push_ui", arguments: args });
    assert.deepEqual(second.body.params, { name: "mateu_navigate", arguments: { session: "nope", route: "/" } });
    // One key for the life of the process — that is what keeps the pairings.
    assert.equal(first.headers["x-mateu-agent-key"], second.headers["x-mateu-agent-key"]);
    assert.equal(first.headers["x-mateu-agent-key"], agentKey({}));
    assert.notEqual(first.body.id, second.body.id);
  } finally {
    await backend.close();
  }
});

test("MATEU_MCP_URL and MATEU_AGENT_KEY win; no token, no Authorization", async () => {
  const backend = await fakeBackend((rq) => rpcResult(rq, { content: [{ type: "text", text: '{"sessions": []}' }] }));
  try {
    const env = {
      MATEU_PUSH: "1",
      MATEU_BASE_URL: "http://127.0.0.1:1",
      MATEU_MCP_URL: backend.base + "/custom/mcp",
      MATEU_AGENT_KEY: "my-own-agent-key-of-enough-length",
    };
    const r = await call("mateu_list_sessions", {}, env);
    assert.deepEqual(r.result, { content: [{ type: "text", text: '{"sessions": []}' }] });
    const [rq] = backend.requests;
    assert.equal(rq.url, "/custom/mcp");
    assert.equal(rq.headers["x-mateu-agent-key"], "my-own-agent-key-of-enough-length");
    assert.equal(rq.headers.authorization, undefined);
    assert.deepEqual(rq.body.params, { name: "mateu_list_sessions", arguments: {} });
  } finally {
    await backend.close();
  }
});

test("mcpUrl: MATEU_MCP_URL, else the base url's /mateu/mcp", () => {
  assert.equal(mcpUrl({ MATEU_BASE_URL: "http://h:8080//" }), "http://h:8080/mateu/mcp");
  assert.equal(mcpUrl({ MATEU_BASE_URL: "http://h", MATEU_MCP_URL: "http://m/x" }), "http://m/x");
  assert.equal(mcpUrl({}), null);
});

// ── failures on the way ──────────────────────────────────────────────────────────────────────

test("an unreachable backend is a tool error naming the endpoint and the switch", async () => {
  const backend = await fakeBackend(() => ({ body: {} }));
  const base = backend.base;
  await backend.close(); // nothing listens there any more
  const r = await call("mateu_list_sessions", {}, { MATEU_PUSH: "true", MATEU_BASE_URL: base });
  const text = errorOf(r);
  assert.ok(text.startsWith(`Error: The backend's MCP endpoint is not reachable at ${base}/mateu/mcp (`), text);
  assert.ok(text.endsWith("is the backend running with mateu.mcp.enabled=true?"), text);
});

test("a non-2xx answer (the MCP endpoint off: 404) is a tool error", async () => {
  const backend = await fakeBackend(() => ({ status: 404, body: "Not found" }));
  try {
    const text = errorOf(await call("mateu_list_sessions", {}, { MATEU_PUSH: "true", MATEU_BASE_URL: backend.base }));
    assert.equal(
      text,
      `Error: The backend's MCP endpoint is not reachable at ${backend.base}/mateu/mcp (HTTP 404) — ` +
        "is the backend running with mateu.mcp.enabled=true?",
    );
  } finally {
    await backend.close();
  }
});

test("a refused call (401/403) points at the token", async () => {
  const backend = await fakeBackend(() => ({ status: 403, body: "" }));
  try {
    const text = errorOf(await call("mateu_list_sessions", {}, { MATEU_PUSH: "true", MATEU_BASE_URL: backend.base }));
    assert.equal(text, "Error: The backend's MCP endpoint refused the call (HTTP 403): check MATEU_TOKEN.");
  } finally {
    await backend.close();
  }
});

test("a backend with push off (Unknown tool) is told apart: push must be enabled there", async () => {
  const backend = await fakeBackend((rq) =>
    rpcResult(rq, { isError: true, content: [{ type: "text", text: `Error: Unknown tool: ${rq.body.params.name}` }] }),
  );
  try {
    const text = errorOf(
      await call("mateu_pair_session", { code: "K7QF-4MZP" }, { MATEU_PUSH: "true", MATEU_BASE_URL: backend.base }),
    );
    assert.equal(
      text,
      "Error: The backend does not offer mateu_pair_session: live UI push must be enabled on the backend " +
        "(mateu.mcp.push.enabled=true / MATEU_MCP_PUSH_ENABLED=true).",
    );
  } finally {
    await backend.close();
  }
});

test("a JSON-RPC error or a non-JSON answer is a tool error", async () => {
  let mode = "rpcError";
  const backend = await fakeBackend((rq) =>
    mode === "rpcError"
      ? { body: { jsonrpc: "2.0", id: rq.body.id, error: { code: -32601, message: "Method not found: tools/call" } } }
      : { body: "<html>login</html>" },
  );
  try {
    const env = { MATEU_PUSH: "true", MATEU_BASE_URL: backend.base };
    assert.equal(
      errorOf(await call("mateu_list_sessions", {}, env)),
      "Error: The backend's MCP endpoint answered: Method not found: tools/call",
    );
    mode = "html";
    assert.equal(
      errorOf(await call("mateu_list_sessions", {}, env)),
      `Error: The backend's MCP endpoint at ${backend.base}/mateu/mcp did not answer JSON-RPC — ` +
        "is the backend running with mateu.mcp.enabled=true?",
    );
  } finally {
    await backend.close();
  }
});

test("no backend configured at all is a tool error", async () => {
  assert.equal(
    errorOf(await call("mateu_list_sessions", {}, { MATEU_PUSH: "true" })),
    "Error: Set MATEU_MCP_URL or MATEU_BASE_URL to reach the backend's MCP endpoint.",
  );
});
