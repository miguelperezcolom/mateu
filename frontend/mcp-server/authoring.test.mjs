// The sidecar against the MCP authoring corpus (../../conformance/mcp/authoring.json) plus the
// authoring plane's protocol behaviour: resources, validate/preview through the backend's reserved
// sync actions, mateu_save_spec's path rule.
//   node --test
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync, mkdtempSync, mkdirSync, symlinkSync, rmSync, realpathSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { handleRpc } from "./index.mjs";
import { MateuWire } from "./wire.mjs";
import { RESOURCE_FILES, isAcceptablePath, refusal, suggest } from "./authoring.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const corpus = JSON.parse(readFileSync(join(here, "..", "..", "conformance", "mcp", "authoring.json"), "utf8"));

let nextId = 1;
const rpc = (method, params, wire = null, env = {}) =>
  handleRpc({ jsonrpc: "2.0", id: nextId++, method, ...(params ? { params } : {}) }, wire, { env });
const call = (name, args, wire, env = {}) => rpc("tools/call", { name, arguments: args }, wire, env);
const json = (r) => JSON.parse(r.result.content[0].text);
const errorOf = (r) => {
  assert.equal(r.result.isError, true, JSON.stringify(r));
  return r.result.content[0].text;
};

/** A wire whose backend answers each sync with `answer(body)` and records the requests. */
function stubWire(answer) {
  const sent = [];
  const wire = new MateuWire({
    baseUrl: "http://backend",
    fetchImpl: async (url, init) => {
      const body = JSON.parse(init.body);
      sent.push({ url, body });
      const out = answer(body);
      if (out && out.__status) {
        return { ok: false, status: out.__status, statusText: "Nope", text: async () => "secret body", json: async () => ({}) };
      }
      return { ok: true, status: 200, json: async () => out };
    },
  });
  return { wire, sent };
}

/** A backend validating with `report` (and previewing with `increment`). */
const validatingBackend = (report, increment = { fragments: [] }) =>
  stubWire((body) => (body.actionId === "__validate__" ? { appData: { _validation: report } } : increment));

// ── corpus ─────────────────────────────────────────────────────────────────────────────────────

test("corpus: tools/list outside development mode, byte for byte", async () => {
  const r = await rpc("tools/list");
  assert.equal(JSON.stringify(r.result.tools), JSON.stringify(corpus.tools));
});

test("corpus: development mode appends mateu_save_spec", async () => {
  for (const v of ["true", "1"]) {
    const r = await rpc("tools/list", null, null, { MATEU_DEV: v });
    assert.equal(JSON.stringify(r.result.tools), JSON.stringify([...corpus.tools, ...corpus.devTools]));
  }
  const off = await rpc("tools/list", null, null, { MATEU_DEV: "yes" });
  assert.equal(off.result.tools.length, corpus.tools.length);
});

test("corpus: resources/list, byte for byte", async () => {
  const r = await rpc("resources/list");
  assert.equal(JSON.stringify(r.result.resources), JSON.stringify(corpus.resources));
});

for (const c of corpus.listComponents) {
  test(`corpus: mateu_list_components "${c.query}"`, async () => {
    const result = json(await call("mateu_list_components", { query: c.query }));
    if (c.expected) assert.equal(JSON.stringify(result), JSON.stringify(c.expected));
    else assert.equal(result.count, c.expectedCount);
    assert.equal(result.count, result.components.length);
  });
}

for (const c of corpus.componentSchemas) {
  test(`corpus: mateu_get_component_schema "${c.type}"`, async () => {
    const r = await call("mateu_get_component_schema", { type: c.type });
    if (c.expectedError) assert.equal(errorOf(r), "Error: " + c.expectedError);
    else assert.equal(JSON.stringify(json(r)), JSON.stringify(c.expected));
  });
}

for (const c of corpus.validate) {
  test(`corpus: mateu_validate_uidl relays the backend's report (${c.name})`, async () => {
    const { wire, sent } = validatingBackend(c.expected);
    const result = json(await call("mateu_validate_uidl", { yaml: c.yaml }, wire));
    assert.deepEqual(result, c.expected);
    assert.equal(sent.length, 1);
    assert.equal(sent[0].url, "http://backend/mateu/v3/sync/_no_route");
    assert.equal(sent[0].body.actionId, "__validate__");
    assert.deepEqual(sent[0].body.parameters, { _yaml: c.yaml });
  });
}

/** The answer a backend gives __preview__ for the sample page (the shape the projection reads). */
const sampleIncrement = {
  fragments: [
    {
      component: {
        type: "ServerSide",
        actions: [],
        children: [
          { type: "ClientSide", metadata: { type: "FormField", fieldId: "name", label: "Name", dataType: "string", required: true } },
          { type: "ClientSide", metadata: { type: "FormField", fieldId: "email", label: "Email", dataType: "string", stereotype: "email" } },
          { type: "ClientSide", metadata: { type: "Button", label: "Save", actionId: "save" } },
        ],
      },
    },
  ],
};

for (const c of corpus.preview) {
  test(`corpus: mateu_preview_uidl (${c.name})`, async () => {
    const { wire, sent } = validatingBackend(c.expected.validation, sampleIncrement);
    const result = json(await call("mateu_preview_uidl", { yaml: c.yaml, route: "customers" }, wire));
    assert.deepEqual(Object.keys(result), ["rendered", "screen", "validation"]);
    assert.equal(result.rendered, c.expected.rendered);
    assert.deepEqual(result.screen.fields, c.expected.fields);
    assert.deepEqual(result.screen.actions, c.expected.actions);
    assert.deepEqual(result.validation, c.expected.validation);
    assert.deepEqual(
      sent.map((s) => [s.url, s.body.actionId, s.body.parameters._yaml]),
      [
        ["http://backend/mateu/v3/sync/customers", "__validate__", c.yaml],
        ["http://backend/mateu/v3/sync/customers", "__preview__", c.yaml],
      ],
    );
  });
}

// ── preview refusals, validation failures ──────────────────────────────────────────────────────

test("preview: a definition with errors is not rendered", async () => {
  const report = { valid: false, kind: "component", errors: [{ code: "x" }], warnings: [] };
  const { wire, sent } = validatingBackend(report);
  const result = json(await call("mateu_preview_uidl", { yaml: "type: X" }, wire));
  assert.deepEqual(result, { rendered: false, reason: "The definition has errors; fix them first.", validation: report });
  assert.equal(sent.length, 1);
});

test("preview: only a page can be previewed", async () => {
  const report = { valid: true, kind: "routes", errors: [], warnings: [] };
  const { wire } = validatingBackend(report);
  const result = json(await call("mateu_preview_uidl", { yaml: "- route: x" }, wire));
  assert.deepEqual(result, {
    rendered: false,
    reason: "Only a page (a component, or a layout: envelope) can be previewed.",
    validation: report,
  });
});

test("validate: no report → the answer's first message, else 'validation failed'", async () => {
  const refused = stubWire(() => ({ messages: [{ text: "Not allowed here" }] }));
  assert.equal(errorOf(await call("mateu_validate_uidl", { yaml: "a: 1" }, refused.wire)), "Error: Not allowed here");
  const silent = stubWire(() => ({}));
  assert.equal(errorOf(await call("mateu_validate_uidl", { yaml: "a: 1" }, silent.wire)), "Error: validation failed");
});

test("missing arguments and unknown tools are caller errors, shown as written", async () => {
  assert.equal(errorOf(await call("mateu_validate_uidl", {}, null)), 'Error: Missing argument "yaml".');
  assert.equal(errorOf(await call("mateu_get_component_schema", { type: 3 }, null)), 'Error: Missing argument "type".');
  assert.equal(errorOf(await call("x", {}, null)), "Error: Unknown tool: x");
  // save_spec is not callable outside development mode
  assert.equal(errorOf(await call("mateu_save_spec", { path: "a.yaml", yaml: "x" }, null)), "Error: Unknown tool: mateu_save_spec");
});

test("a request the backend refuses (403) is the tool error Forbidden; other HTTP errors are generic", async () => {
  const forbidden = stubWire(() => ({ __status: 403 }));
  assert.equal(errorOf(await call("mateu_validate_uidl", { yaml: "a: 1" }, forbidden.wire)), "Error: Forbidden");
  assert.equal(errorOf(await call("mateu_describe_screen", { route: "x" }, forbidden.wire)), "Error: Forbidden");
  const broken = stubWire(() => ({ __status: 500 }));
  const text = errorOf(await call("mateu_describe_screen", { route: "x" }, broken.wire));
  assert.match(text, /^Error: An unexpected error occurred\. Reference: [0-9a-f]{12}$/);
  assert.ok(!text.includes("secret body"));
});

// ── protocol ───────────────────────────────────────────────────────────────────────────────────

test("initialize advertises tools and resources", async () => {
  const r = await rpc("initialize", {});
  assert.deepEqual(r.result, {
    protocolVersion: "2024-11-05",
    capabilities: { tools: {}, resources: {} },
    serverInfo: { name: "mateu-mcp", version: "0.1.0" },
  });
});

test("resources/read serves each file verbatim; errors for a missing or unknown uri", async () => {
  for (const resource of corpus.resources) {
    const r = await rpc("resources/read", { uri: resource.uri });
    const [content] = r.result.contents;
    assert.equal(content.uri, resource.uri);
    assert.equal(content.mimeType, resource.mimeType);
    assert.ok(content.text.length > 0);
  }
  const guide = await rpc("resources/read", { uri: "mateu://guide" });
  assert.equal(guide.result.contents[0].text, readFileSync(join(here, "resources", "authoring-guide.md"), "utf8"));
  assert.deepEqual((await rpc("resources/read", {})).error, { code: -32602, message: "Invalid params: uri is required" });
  assert.deepEqual((await rpc("resources/read", { uri: "mateu://nope" })).error, {
    code: -32002,
    message: "Resource not found: mateu://nope",
  });
});

test("a JSON value that is not an object is an Invalid Request (id null)", async () => {
  for (const message of [[], 3, "x", null, true]) {
    assert.deepEqual(await handleRpc(message, null), { jsonrpc: "2.0", id: null, error: { code: -32600, message: "Invalid Request" } });
  }
});

test("the resource copies are byte-equal to backend/shared/uidl (npm run sync-resources)", (t) => {
  const source = join(here, "..", "..", "backend", "shared", "uidl");
  let compared = 0;
  for (const file of RESOURCE_FILES) {
    const original = join(source, file);
    if (!existsSync(original)) continue;
    assert.ok(readFileSync(join(here, "resources", file)).equals(readFileSync(original)), `${file} is stale: run npm run sync-resources`);
    compared++;
  }
  if (compared === 0) t.skip("not inside the Mateu repository");
});

test("suggest: equal ignoring case first, else distance ≤ 2 and smaller than the value", () => {
  assert.equal(suggest("button", ["Badge", "Button"]), "Button");
  assert.equal(suggest("Buton", ["Badge", "Button"]), "Button");
  assert.equal(suggest("ab", ["xy"]), null);
  assert.equal(suggest("Zzzzzz", ["Button"]), null);
});

// ── mateu_save_spec ────────────────────────────────────────────────────────────────────────────

const REFUSED = [
  "",
  "   ",
  "a".repeat(252) + ".yaml",
  "a\0.yaml",
  "a\\b.yaml",
  "/abs.yaml",
  "C:x.yaml",
  "a.json",
  "a.yaml.txt",
  "a//b.yaml",
  "./a.yaml",
  "../a.yaml",
  "a/../../b.yaml",
  "a/.",
  "dir/",
];

test("save_spec: the path rule refuses before touching the disk", () => {
  for (const p of REFUSED) assert.equal(isAcceptablePath(p), false, JSON.stringify(p));
  for (const p of ["a.yaml", "a.yml", "partials/address.yaml", "a..b.yaml", "x/y/z.yml"]) {
    assert.equal(isAcceptablePath(p), true, p);
  }
  assert.equal(
    refusal('a"b'),
    'Invalid path "a\\"b": give a relative .yaml or .yml path inside the specs directory (no "..", no absolute path).',
  );
});

function devEnv(dir) {
  return { MATEU_DEV: "true", MATEU_SPECS_DIR: dir };
}

test("save_spec: refused paths and a symbolic link out of the specs directory are caller errors", async (t) => {
  const tmp = realpathSync(mkdtempSync(join(tmpdir(), "mateu-mcp-")));
  t.after(() => rmSync(tmp, { recursive: true, force: true }));
  const specs = join(tmp, "specs");
  const outside = join(tmp, "outside");
  mkdirSync(specs);
  mkdirSync(outside);
  symlinkSync(outside, join(specs, "escape"));
  symlinkSync(join(outside, "target.yaml"), join(specs, "link.yaml"));
  const { wire, sent } = validatingBackend({ valid: true, kind: "component", errors: [], warnings: [] });
  for (const p of ["../x.yaml", "/etc/x.yaml", "a\\b.yaml", "escape/x.yaml", "escape/deeper/x.yaml", "link.yaml"]) {
    const text = errorOf(await call("mateu_save_spec", { path: p, yaml: "type: Text" }, wire, devEnv(specs)));
    assert.equal(text, "Error: " + refusal(p), p);
  }
  assert.ok(!existsSync(join(outside, "x.yaml")));
  assert.ok(!existsSync(join(outside, "deeper")));
  assert.ok(!existsSync(join(outside, "target.yaml")));
  // the syntactic refusals never reached the backend; the link ones were validated first
  assert.equal(sent.length, 3);
});

test("save_spec: a valid definition is written (folders created); one with errors is not", async (t) => {
  const tmp = realpathSync(mkdtempSync(join(tmpdir(), "mateu-mcp-")));
  t.after(() => rmSync(tmp, { recursive: true, force: true }));
  const report = { valid: true, kind: "component", errors: [], warnings: [] };
  const { wire, sent } = validatingBackend(report);
  const yaml = "type: Text\ntext: Señor\n";
  const result = json(await call("mateu_save_spec", { path: "partials/address.yaml", yaml }, wire, devEnv(tmp)));
  assert.deepEqual(result, { saved: true, path: "partials/address.yaml", bytes: Buffer.byteLength(yaml, "utf8"), validation: report });
  assert.equal(result.bytes, yaml.length + 1);
  assert.equal(readFileSync(join(tmp, "partials", "address.yaml"), "utf8"), yaml);
  assert.equal(sent[0].body.actionId, "__validate__");

  const bad = { valid: false, kind: "component", errors: [{ code: "x" }], warnings: [] };
  const failing = validatingBackend(bad);
  const refused = json(await call("mateu_save_spec", { path: "b.yaml", yaml: "type: X" }, failing.wire, devEnv(tmp)));
  assert.deepEqual(refused, { saved: false, reason: "The definition has errors; nothing was written.", validation: bad });
  assert.ok(!existsSync(join(tmp, "b.yaml")));
});

test("save_spec: no specs directory is a caller error", async () => {
  const text = errorOf(
    await call("mateu_save_spec", { path: "a.yaml", yaml: "x" }, null, devEnv(join(tmpdir(), "mateu-mcp-does-not-exist-" + Date.now()))),
  );
  assert.equal(text, "Error: No specs directory found (set MATEU_SPECS_DIR).");
});
