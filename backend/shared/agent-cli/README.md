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

## Security note

This module is meant for **localhost development**. It spawns a locally authenticated
CLI on behalf of whoever calls the endpoint — an exposed server should run a real agent
(an API-backed SSE endpoint with its own authentication and quota) instead.

## Code map

- `CliAgentController` — `POST` endpoint producing `text/event-stream` (`SseEmitter`).
- `CliAgentService` — resolves the provider, spawns the CLI (message via stdin), forwards
  its output line by line, keeps the chat-session → CLI-session map, handles timeout/errors.
- `CliAgentBridge` — pure translation between `claude`'s `stream-json` output and the
  chat's SSE contract, plus the system preamble; process-free and unit-tested
  (`CliAgentBridgeTest`).


## Giving the agent tools (MCP)

Two more properties turn the chat's assistant into an actor:

| Property | Meaning |
|---|---|
| `mateu.agent.cli.mcp-config` | MCP servers for the CLI (claude only): inline JSON or a file path, passed as `--mcp-config` with `--strict-mcp-config` so only these servers load. |
| `mateu.agent.cli.allowed-tools` | Tools the CLI may use without prompting (`--allowedTools`), e.g. `mcp__modux`. |

The host app typically points `mcp-config` at its own MCP endpoint — e.g.
`{"mcpServers":{"app":{"type":"http","url":"http://localhost:${server.port}/mcp"}}}` —
so the assistant operates the very instance the user is looking at.
