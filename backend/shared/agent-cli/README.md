# Agent CLI (`io.mateu:agent-cli`)

A **pseudo-agent for local development**: it serves the Mateu chat's SSE contract by
bridging to an LLM CLI that is already authenticated on the developer's machine
(`claude`, `gemini`), so the application needs **no API key**.

You get the in-app AI assistant — streaming replies, conversation continuity,
navigation events, token usage — with zero LLM configuration, because it reuses the
login of the CLI you already have on your `PATH`.

## Setup

1. Add the dependency to your Spring Boot app:

   ```xml
   <dependency>
     <groupId>io.mateu</groupId>
     <artifactId>agent-cli</artifactId>
   </dependency>
   ```

2. Point the app shell at the endpoint the module exposes:

   ```java
   @UI("")
   @AI(sse = "/mateu/agent/stream")
   public class MyApp { ... }
   ```

   A relative URL keeps the request same-origin, so the chat's auth headers travel with it.

That's it — the chat panel now talks to whatever LLM CLI is installed locally.

## Behavior

- **CLI auto-detection** — with the default `mateu.agent.cli.command=auto`, the first
  CLI found on the `PATH` is used, `claude` preferred, then `gemini`.
- **Streaming** — the CLI's answer is forwarded to the chat **line by line**, matching
  the chat's line-oriented SSE contract (every `data:` event is one line of the reply).
  With `claude`, `--output-format stream-json --include-partial-messages` is parsed so
  text flows as it is produced.
- **Conversation continuity** — `claude`'s init event hands back its session id, which is
  mapped to the chat's `sessionId`; follow-up messages run with `--resume`, so the
  conversation keeps its context. `gemini` is stateless for now.
- **Token usage** — `claude`'s final result event is translated to the chat's usage JSON
  (`{"inputTokens":…,"outputTokens":…,"totalTokens":…}`), which the chat shows in its
  token bar.
- **UI protocol** — a system preamble teaches the model the chat's event protocol: to
  operate the UI it emits one line holding only
  `{"event":"navigation-requested","detail":<navigation>}`, using the `menuContext`
  (breadcrumb path + navigation payload per screen) that the chat sends with the first
  message. The chat dispatches that line as a DOM event instead of rendering it.
- **Isolation** — the CLI process runs in a throwaway temp directory, so the assistant
  never sees the server's working directory.
- **Errors** — if no CLI is found, the process fails, or the timeout is hit, the chat
  receives an `{"event":"agent-error","detail":{"message":…}}` event and renders the
  message in the reply bubble.

## Configuration

| Property | Default | Description |
|---|---|---|
| `mateu.agent.cli.command` | `auto` | Which CLI to use: `auto` (first found on the `PATH`, `claude` preferred), `claude`, or `gemini`. |
| `mateu.agent.cli.path` | `/mateu/agent/stream` | The endpoint path the controller listens on (what `@AI(sse = …)` should point to). |
| `mateu.agent.cli.timeout-seconds` | `180` | Maximum time a CLI run may take before it is killed and an `agent-error` is emitted. |
| `mateu.agent.cli.upload-path` | `/mateu/agent/upload` | The endpoint path the file-upload controller listens on (what `@AI(upload = …)` should point to). |
| `mateu.agent.cli.upload-dir` | `$TMPDIR/mateu-agent-uploads` | Base directory where attached files are stored, one subdirectory per chat session. |
| `mateu.agent.cli.max-upload-mb` | `25` | Maximum size per attached file; larger files are rejected with a `400`. |

## Security note

This module is meant for **localhost development**. It spawns a locally authenticated
CLI on behalf of whoever calls the endpoint — an exposed server should run a real agent
(an API-backed SSE endpoint with its own authentication and quota) instead. The same goes
for file uploads: they land on the server's local disk with only size/name sanitization —
an exposed server should store uploads behind real auth and quota.

## Code map

- `CliAgentController` — `POST` endpoint producing `text/event-stream` (`SseEmitter`).
- `CliAgentService` — resolves the provider, spawns the CLI (message via stdin), forwards
  its output line by line, keeps the chat-session → CLI-session map, handles timeout/errors.
- `CliAgentBridge` — pure translation between `claude`'s `stream-json` output and the
  chat's SSE contract, plus the system preamble; process-free and unit-tested
  (`CliAgentBridgeTest`).
- `AgentUploadController` / `AgentUploadStore` — the multipart file-upload endpoint and the
  per-session on-disk store the filesystem MCP is rooted at; store logic unit-tested
  (`AgentUploadStoreTest`).


## Screen context

Every chat message may carry a `context` object (the shell sends url, screen title,
appState/appData and the component's state). The service prefixes the user message with an
automatic `### Contexto de pantalla` header (truncated at 6000 chars) and the system prompt
teaches the model to ground its actions on it — no blind navigation when the user is
already on the relevant screen.

## Giving the agent tools (MCP)

Two more properties turn the chat's assistant into an actor:

| Property | Meaning |
|---|---|
| `mateu.agent.cli.mcp-config` | MCP servers for the CLI (claude only): inline JSON or a file path, passed as `--mcp-config` with `--strict-mcp-config` so only these servers load. |
| `mateu.agent.cli.allowed-tools` | Tools the CLI may use without prompting (`--allowedTools`), e.g. `mcp__modux`. |

### Dynamic MCP: the app advertises, the agent verifies

When the app is annotated `@AI(mcp = "/mcp")`, the chat forwards that endpoint (absolute,
same-origin) with every message. The agent accepts it **only when its origin is allowed** —
localhost always, plus `mateu.agent.cli.allowed-mcp-origins` (and, in the companion, its CORS
allowlist doubles as consent) — and passes the user's own `Authorization` header along, so the
remote MCP sees the actual user. This is what lets the local companion operate a REMOTE app:
`browser → companion (user's CLI) → remote /mcp with the user's token`.

The host app can also point `mcp-config` at its own MCP endpoint statically — e.g.
`{"mcpServers":{"app":{"type":"http","url":"http://localhost:${server.port}/mcp"}}}` —
so the assistant operates the very instance the user is looking at.


## Attaching files (the agent reads them)

Annotate the shell with a third `@AI` attribute so the chat shows an **attach** button:

```java
@UI("")
@AI(sse = "/mateu/agent/stream", upload = "/mateu/agent/upload")
public class MyApp { ... }
```

The chat POSTs each picked file (multipart `files`, plus the chat's `sessionId`) to that URL.
`AgentUploadController` saves them via `AgentUploadStore` into a **per-session directory** under
`mateu.agent.cli.upload-dir` (default `$TMPDIR/mateu-agent-uploads/<sessionId>`) and echoes back
`{"files":[{"name","path"}]}`, which the chat shows as removable chips and sends as `attachments`
on the next message.

How the model reads them: because the CLI runs in a throwaway temp dir (see **Isolation**), the
uploads are otherwise invisible to it. When the session has files, the service starts a **per-session
filesystem MCP** rooted at that directory —
`npx -y @modelcontextprotocol/server-filesystem <sessionDir>` — as a **second** `--mcp-config`
(claude merges several) and adds `mcp__files` to `--allowedTools`; the message is prefixed with a
`### Ficheros adjuntos` header naming the files and telling the model to read them via that server.
So it stacks with the app MCP above rather than replacing it. Filenames are sanitized and confined to
the session directory (path-traversal defence); oversized files are rejected.

## Remote server? The local companion

When the app is served from a REMOTE server, the CLI lives on the user's machine — out of the
server's reach. The `agent-cli-companion` module is a runnable jar that serves this same SSE
contract on `127.0.0.1:8776`:

```bash
java -jar agent-cli-companion.jar --mateu.agent.companion.allow-origins=https://app.acme.com
```

The chat probes `http://127.0.0.1:8776/health` on load and, when a companion answers, prefers
it over the server's sseUrl — showing an «agente local» badge. Consent is explicit twice: the
user starts the companion naming which origin may use it (CORS enforced), and the badge tells
them who they are talking to. `localAgentUrl` on `<mateu-chat>` overrides the default base.
