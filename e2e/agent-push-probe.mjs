#!/usr/bin/env node
// End-to-end probe for LIVE UI PUSH (an MCP caller sends UI to a tab that is open).
//
// Against a running app with mateu.mcp.enabled=true + mateu.mcp.push.enabled=true, in a real
// browser (Playwright): two tabs of the same app; tab A clicks "Connect AI" and reads its code; an
// MCP caller pairs with it over the app's own /mateu/mcp and pushes a screen (content and drawer)
// and a navigation — they must appear in tab A and NOT in tab B. Then the same through the stdio
// sidecar (MATEU_PUSH=true), pairing tab B with its own agent key: the sidecar sees only tab B, and
// a third caller (anonymous, unpaired) reaches nothing. Finally Disconnect in tab A cuts the agent off.
// Exits non-zero on any failure.
//
//   MATEU_BASE_URL=http://localhost:8080 node e2e/agent-push-probe.mjs [--route /app] [--headed]

import { chromium } from "playwright";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createInterface } from "node:readline";

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
};
const baseUrl = (process.env.MATEU_BASE_URL || opt("--base", "http://localhost:8080")).replace(/\/+$/, "");
const route = opt("--route", "/app");
const navigateTo = opt("--navigate", "/app/section2");

let failures = 0;
const check = (ok, label, extra = "") => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}${extra ? "  — " + extra : ""}`);
  if (!ok) failures++;
};

// ── the native endpoint ──────────────────────────────────────────────────────────────────────
let rpcId = 1;
async function native(tool, toolArgs, headers = {}) {
  const res = await fetch(baseUrl + "/mateu/mcp", {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify({ jsonrpc: "2.0", id: rpcId++, method: "tools/call", params: { name: tool, arguments: toolArgs } }),
  });
  const body = await res.json();
  return toolResult(body);
}
function toolResult(body) {
  const result = body.result ?? {};
  const text = result.content?.[0]?.text ?? JSON.stringify(body);
  if (result.isError) return { error: text.replace(/^Error: /, "") };
  try { return JSON.parse(text); } catch { return { text }; }
}

// ── the sidecar (stdio) ──────────────────────────────────────────────────────────────────────
function startSidecar() {
  const child = spawn("node", [join(here, "..", "frontend", "mcp-server", "index.mjs")], {
    env: { ...process.env, MATEU_BASE_URL: baseUrl, MATEU_PUSH: "true" },
    stdio: ["pipe", "pipe", "inherit"],
  });
  const pending = new Map();
  let id = 1;
  createInterface({ input: child.stdout }).on("line", (line) => {
    let msg;
    try { msg = JSON.parse(line.trim()); } catch { return; }
    if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
  });
  const rpc = (method, params) => new Promise((resolve, reject) => {
    const n = id++;
    pending.set(n, resolve);
    child.stdin.write(JSON.stringify({ jsonrpc: "2.0", id: n, method, params }) + "\n");
    setTimeout(() => { if (pending.has(n)) { pending.delete(n); reject(new Error("sidecar timeout: " + method)); } }, 20000);
  });
  return {
    child,
    rpc,
    call: async (tool, toolArgs) => toolResult(await rpc("tools/call", { name: tool, arguments: toolArgs })),
  };
}

// ── the browser ──────────────────────────────────────────────────────────────────────────────
async function openTab(context) {
  const page = await context.newPage();
  await page.goto(baseUrl + route);
  await page.locator("mateu-agent-connect button.agent-button").first().waitFor({ timeout: 30000 });
  return page;
}

async function pairingCodeOf(page) {
  await page.locator("mateu-agent-connect button.agent-button").first().click();
  const code = page.locator("mateu-agent-connect-dialog .code");
  await code.waitFor({ timeout: 15000 });
  const text = (await code.innerText()).trim();
  return text;
}

async function closeDialog(page) {
  await page.keyboard.press("Escape");
  await page.locator("mateu-agent-connect-dialog .panel").waitFor({ state: "detached", timeout: 5000 }).catch(() => {});
}

const shows = async (page, text, timeout = 10000) => {
  try {
    await page.getByText(text, { exact: false }).first().waitFor({ timeout });
    return true;
  } catch {
    return false;
  }
};

async function main() {
  const browser = await chromium.launch({ headless: !args.includes("--headed") });
  const context = await browser.newContext();
  const tabA = await openTab(context);
  const tabB = await openTab(context);
  check(true, "both tabs show Connect AI");

  // 1. pair tab A with an anonymous native caller
  const codeA = await pairingCodeOf(tabA);
  check(/^[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(codeA), "tab A shows a pairing code", codeA);
  const pairedA = await native("mateu_pair_session", { code: codeA });
  check(!!pairedA.session && pairedA.paired === true, "the native caller pairs with tab A", JSON.stringify(pairedA));
  check(await shows(tabA, "Connected to"), "tab A's dialog says it is connected");
  await closeDialog(tabA);
  const again = await native("mateu_pair_session", { code: codeA });
  check(again.error === "Invalid or expired pairing code.", "the code works once", JSON.stringify(again));

  // 2. push a screen into tab A's content area, then a drawer
  const invalid = await native("mateu_push_ui", { session: pairedA.session, yaml: "type: Nope\n" });
  check(invalid.delivered === false && invalid.validation?.valid === false, "an invalid page is refused, nothing sent");
  const pushed = await native("mateu_push_ui", {
    session: pairedA.session,
    yaml: "type: VerticalLayout\ncontent:\n  - type: Text\n    text: Pushed into tab A\n",
  });
  check(pushed.delivered === true, "push_ui delivered", JSON.stringify(pushed).slice(0, 200));
  check(await shows(tabA, "Pushed into tab A"), "the pushed screen renders in tab A");
  check(!(await shows(tabB, "Pushed into tab A", 2500)), "…and not in tab B");
  const drawer = await native("mateu_push_ui", {
    session: pairedA.session,
    yaml: "type: Text\ntext: A drawer from the agent\n",
    target: "drawer",
    title: "Agent drawer",
  });
  check(drawer.delivered === true, "push_ui to a drawer delivered");
  check(await shows(tabA, "A drawer from the agent"), "the drawer opens in tab A");
  const inDrawer = await tabA.getByText("A drawer from the agent").first().evaluate((el) => {
    for (let n = el; n; n = n.parentNode instanceof ShadowRoot ? n.parentNode.host : n.parentNode) {
      if (n.tagName && n.tagName.toLowerCase() === "mateu-drawer") return true;
    }
    return false;
  });
  check(inDrawer, "…inside a mateu-drawer");
  await tabA.keyboard.press("Escape");

  // 3. navigate tab A
  const urlB = tabB.url();
  const nav = await native("mateu_navigate", { session: pairedA.session, route: navigateTo });
  check(nav.delivered === true, "navigate delivered");
  let navigated = false;
  for (let i = 0; i < 40 && !navigated; i++) {
    navigated = new URL(tabA.url()).pathname === navigateTo;
    if (!navigated) await tabA.waitForTimeout(250);
  }
  check(navigated, "tab A navigated to " + navigateTo, tabA.url());
  check(tabB.url() === urlB, "tab B did not move", tabB.url());

  // 4. a custom event reaches tab A's document only when a view on screen declares it (NM9): the
  // probed screen subscribes to nothing, so neither an undeclared event nor a framework one arrives
  await tabA.evaluate(() => {
    window.__agentEvents = [];
    for (const n of ["highlight-row", "server-side-action-requested", "page-banners-received"]) {
      document.addEventListener(n, (e) => window.__agentEvents.push(n), true);
    }
  });
  const ev = await native("mateu_dispatch_event", { session: pairedA.session, event: "highlight-row", detail: { id: 7 } });
  check(ev.delivered === true, "dispatch_event delivered");
  for (const name of ["server-side-action-requested", "page-banners-received"]) {
    await native("mateu_dispatch_event", { session: pairedA.session, event: name, detail: { actionId: "delete" } });
  }
  await tabA.waitForTimeout(1000);
  const got = await tabA.evaluate(() => window.__agentEvents);
  check(Array.isArray(got) && got.length === 0, "an event no view declares, or a framework one, does not reach the document", JSON.stringify(got));

  // 5. the sidecar: pairs tab B with its own agent key
  const sidecar = startSidecar();
  await sidecar.rpc("initialize", {});
  const codeB = await pairingCodeOf(tabB);
  const pairedB = await sidecar.call("mateu_pair_session", { code: codeB });
  check(!!pairedB.session && pairedB.paired, "the sidecar pairs with tab B", JSON.stringify(pairedB));
  await closeDialog(tabB);
  const listed = await sidecar.call("mateu_list_sessions", {});
  check(listed.sessions?.length === 1 && listed.sessions[0].session === pairedB.session,
    "the sidecar lists only tab B", JSON.stringify(listed));
  const viaSidecar = await sidecar.call("mateu_push_ui", { session: pairedB.session, yaml: "type: Text\ntext: Pushed into tab B\n" });
  check(viaSidecar.delivered === true, "push through the sidecar delivered");
  check(await shows(tabB, "Pushed into tab B"), "the sidecar's screen renders in tab B");
  check(!(await shows(tabA, "Pushed into tab B", 2500)), "…and not in tab A");
  const crossed = await sidecar.call("mateu_push_ui", { session: pairedA.session, yaml: "type: Text\ntext: nope\n" });
  check(crossed.error?.startsWith("Unknown session"), "the sidecar cannot reach tab A", JSON.stringify(crossed));
  const stranger = await native("mateu_push_ui", { session: pairedB.session, yaml: "type: Text\ntext: nope\n" });
  check(stranger.error?.startsWith("Unknown session"), "an unpaired anonymous caller cannot reach tab B", JSON.stringify(stranger));
  const strangerList = await native("mateu_list_sessions", {}, { "X-Mateu-Agent-Key": "some-other-agent-key-123" });
  check(Array.isArray(strangerList.sessions) && strangerList.sessions.length === 0, "another agent lists nothing", JSON.stringify(strangerList));
  sidecar.child.kill();

  // 6. Disconnect in tab A cuts the native caller off
  await tabA.locator("mateu-agent-connect button.agent-button").first().click();
  await tabA.locator("mateu-agent-connect-dialog button.disconnect").click();
  await tabA.waitForTimeout(1000);
  const afterUnpair = await native("mateu_navigate", { session: pairedA.session, route: "/" });
  check(afterUnpair.error?.startsWith("Unknown session"), "after Disconnect the agent is cut off", JSON.stringify(afterUnpair));

  await browser.close();
  console.log(failures ? `\n${failures} check(s) FAILED` : "\nall checks passed");
  process.exit(failures ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
