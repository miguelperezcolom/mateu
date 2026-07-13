---
title: "AI"
#icon: "/images/icons/start.svg" # https://fonts.google.com/icons
#icon_bg: ""
description: "Integrate an AI chat assistant into your Mateu application using the @AI annotation."

# don't create a separete form
---

Mateu lets you embed an AI chat assistant directly into your application shell.

Once enabled, a floating **IA** button appears in the navigation bar. Clicking it opens a side panel with a streaming chat interface backed by a Server-Sent Events (SSE) endpoint of your choice.

## Enabling the AI chat

Add `@AI` to your root UI class and provide the SSE endpoint URL:

```java
@UI("")
@Title("My App")
@AI(sse = "/api/ai/chat")
public class MyApp {

    @Menu
    Users users;

    @Menu
    Reports reports;
}
```

That is all that is required on the Java side.

## How it works

1. Mateu reads the `sse` value from `@AI` at startup.
2. It propagates the URL through `AppDto.sseUrl` to the frontend.
3. The frontend renders a `mateu-chat` component inside a `vaadin-master-detail-layout`.
4. An **IA** button is added to the navigation bar (or sidebar, depending on the app variant).
5. Clicking the button shows or hides the chat panel.
6. The chat panel connects to the SSE endpoint and streams responses back to the user.

## SSE endpoint contract

`mateu-chat` sends a **POST** request to the SSE URL with a JSON body and streams back the response as Server-Sent Events.

### Request

**Headers**

| Header          | Description                                      |
|-----------------|--------------------------------------------------|
| `Authorization` | `Bearer <jwt>` — present when the user is logged in |
| `X-Session-Id`  | Mateu session identifier                         |
| `Content-Type`  | `application/json`                               |
| `Accept`        | `text/event-stream`                              |

**Body**

```json
{
  "message": "Show me order ORD-42",
  "sessionId": "chat-session-nanoid",
  "menuContext": [
    {
      "path": ["Orders", "List"],
      "navigation": {
        "route": "/orders",
        "consumedRoute": "",
        "actionId": "",
        "baseUrl": "/_orders",
        "serverSideType": "com.example.OrderHome",
        "uriPrefix": ""
      }
    },
    {
      "path": ["Customers"],
      "navigation": {
        "route": "/customers",
        "consumedRoute": "",
        "actionId": "",
        "baseUrl": "/_customers",
        "serverSideType": "com.example.CustomerHome",
        "uriPrefix": ""
      }
    }
  ]
}
```

Every message also carries a `context` field — a snapshot of what the user is LOOKING AT,
supplied by the shell (`mateu-chat`'s `contextProvider` property): current url and screen
title, `appState`, `appData`, and the active component's state and data. The agent grounds
its answers and actions on it — if the user is already on the relevant screen, it acts
there instead of navigating away.


- `message` — the user's text input.
- `sessionId` — a stable per-chat-panel ID (generated with nanoid), useful for conversational memory or logging on the backend.
- `menuContext` — the full application menu flattened into a list of navigable screens. Each entry includes the breadcrumb `path` (e.g. `["Bookings", "List"]`), an optional `description`, and the exact `navigation` payload the LLM should emit to open that screen. It is sent **only with the first message** of a chat session — cache it against `sessionId` if you need it later in the conversation.

### Response

The response is a stream of Server-Sent Events, and the contract is **line-oriented**: every `data:` event carries **one line of the reply**. `mateu-chat` appends a newline after each data payload, so markdown structure (headings, lists, code fences, tables) survives streaming. Don't stream token-by-token in separate events — buffer until you have a full line.

Each `data:` payload is interpreted, in order of precedence, as:

1. **Token usage** — a JSON object with any of `inputTokens`, `outputTokens`, `totalTokens`. It is not shown as text; the values are merged into the token bar under the message list:

   ```
   data: {"inputTokens": 1200, "outputTokens": 340, "totalTokens": 1540}
   ```

2. **UI event** — a JSON object with a string `event` field (`detail` is optional and defaults to `{}`). It is consumed silently and dispatched as a DOM `CustomEvent` — except the reserved `agent-error` event, whose `detail.message` is rendered as a warning in the reply bubble instead:

   ```
   data: {"event": "navigation-requested", "detail": { ... }}
   data: {"event": "agent-error", "detail": {"message": "The agent timed out."}}
   ```

3. **Text** — anything else is one line of the agent's markdown reply, appended to the current bubble.

There is no end-of-stream sentinel (no `[DONE]`): the reply is finished when the server closes the stream. If the stream closes without any text, the chat shows a warning suggesting the LLM is not configured.

Mateu also forwards the current JWT and session-id as request headers so your endpoint can authenticate and personalise responses.

### Message rendering: markdown, images, and inline SVG

Agent replies render as **markdown** (via `mateu-markdown`: marked + DOMPurify). Sanitization uses the **html + svg** profiles, so replies may safely embed:

- **Images**, including `data:` URIs — e.g. a chart generated server-side and inlined as `![sales](data:image/png;base64,...)`.
- **Inline `<svg>`** — e.g. a diagram of the user's model rendered by a tool and pasted straight into the reply.

The chat bubble sizes both to its width (`max-width: 100%`, height auto), so diagrams and images fit the panel without horizontal scrolling. Custom elements also pass sanitization, so a reply can even instantiate web components available in the host page.

## Supported app variants

The AI chat panel is available in all application shell variants:

| Variant            | IA button location               |
|--------------------|----------------------------------|
| `MENU_ON_TOP`      | Top navigation bar, right side   |
| `HAMBURGUER_MENU`  | Top navbar slot                  |
| `MENU_ON_LEFT`     | Bottom of the left sidebar       |
| `TABS`             | Tab bar, right side              |

## Example: Spring AI SSE endpoint

```java
record ChatRequest(
    String message,
    String sessionId,
    List<MenuContextEntry> menuContext
) {}

record MenuContextEntry(List<String> path, Map<String, Object> navigation) {}

@RestController
@RequestMapping("/api/ai")
public class AiChatController {

    private final ChatClient chatClient;

    public AiChatController(ChatClient chatClient) {
        this.chatClient = chatClient;
    }

    @PostMapping(value = "/chat", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> chat(@RequestBody ChatRequest req) {
        // Build a system prompt that describes the available screens
        String menuDescription = req.menuContext().stream()
            .map(e -> "- " + String.join(" > ", e.path())
                    + " → " + e.navigation())
            .collect(Collectors.joining("\n"));

        String systemPrompt = """
            You are an assistant for this application.
            The following screens are available (path → navigation payload):
            %s

            When the user asks to open a screen, emit a navigation event at the
            END of your response:
            data: {"event": "navigation-requested", "detail": <navigation payload>}
            Only emit one event. Never show the raw JSON to the user.
            """.formatted(menuDescription);

        // The contract is line-oriented: each SSE data event must be ONE line
        // of the reply, so buffer the token stream and emit complete lines.
        return chatClient.prompt()
            .system(systemPrompt)
            .user(req.message())
            .stream()
            .content()
            .bufferUntil(token -> token.contains("\n"))
            .map(tokens -> String.join("", tokens).stripTrailing());
    }
}
```

## Remote server, local CLI: the companion

With the app deployed on a server, the user's authenticated CLI is unreachable — so the
`agent-cli-companion` runnable jar serves the same SSE contract on the user's own
`127.0.0.1:8776`. Start it naming which origin may use it
(`--mateu.agent.companion.allow-origins=https://app.acme.com`); the chat probes `/health`,
prefers the companion when alive, and wears an «agente local» badge so the user knows who
they are talking to. No api key at any point.

## No API key? Use the CLI pseudo-agent (local development)

If you develop with an LLM CLI already authenticated on your machine (`claude`, `gemini`), you don't need to implement — or configure a key for — an SSE endpoint at all. The `io.mateu:agent-cli` module is a **pseudo-agent for local development** that serves the whole contract above by bridging to that CLI.

```xml
<dependency>
  <groupId>io.mateu</groupId>
  <artifactId>agent-cli</artifactId>
</dependency>
```

```java
@UI("")
@AI(sse = "/mateu/agent/stream")
public class MyApp { ... }
```

What it does:

- Auto-detects the CLI on the `PATH` (`claude` preferred, then `gemini`); override with `mateu.agent.cli.command`.
- Streams the answer line by line, exactly as the contract requires.
- With `claude`, keeps conversation continuity (`--resume`, mapping the chat's `sessionId` to the CLI's session) and reports token usage.
- Teaches the model the `{"event": "navigation-requested", ...}` protocol using the `menuContext`, so "take me to bookings" navigates the app.
- Runs the CLI in a throwaway temp directory and reports failures as `agent-error` events.

Configuration: `mateu.agent.cli.command` (`auto` | `claude` | `gemini`), `mateu.agent.cli.path` (default `/mateu/agent/stream`), `mateu.agent.cli.timeout-seconds` (default `180`).

**Security note:** this is meant for localhost — it lends the caller your locally authenticated CLI. An exposed server should run a real agent (an API-backed endpoint like the one above). See the module's README (`backend/shared/agent-cli`) for details.

## LLM-driven UI interactions

The AI assistant is not limited to returning text.

It can also **trigger UI actions** — navigation, form updates, or any custom behaviour — by emitting a special JSON event inside the SSE stream.

### Event format

Any `data:` line whose payload is a JSON object with an `event` field is treated as a UI event instead of chat text:

```
data: {"event": "<event-name>", "detail": { ... }}
```

`mateu-chat` will:

1. Parse the JSON.
2. Dispatch `new CustomEvent(event, { detail, bubbles: true, composed: true })`.
3. **Not** display the JSON in the chat message — it is consumed silently.

Text tokens and UI events can be freely mixed in the same stream.

### Built-in event: `navigation-requested`

Mateu's app shell listens for `navigation-requested` and routes the user to the specified view.

Payload fields:

| Field            | Type   | Description                                      |
|------------------|--------|--------------------------------------------------|
| `route`          | string | Target route (e.g. `/orders/123`)                |
| `consumedRoute`  | string | Route consumed by the app shell (usually `""`)   |
| `actionId`       | string | Action to trigger on arrival (e.g. `"view"`)     |
| `baseUrl`        | string | Base URL of the target micro-frontend            |
| `serverSideType` | string | Fully-qualified Java class of the target UI      |
| `uriPrefix`      | string | URI prefix (usually `""`)                        |

Example — navigate to a specific order:

```
data: {"event": "navigation-requested", "detail": {"route": "/orders/ORD-42", "consumedRoute": "", "actionId": "view", "baseUrl": "/_orders", "serverSideType": "com.example.OrderHome", "uriPrefix": ""}}
```

### Custom events

You can define your own events and handle them anywhere in your component tree.

Backend — emit the event mid-stream:

```java
// Inside your SSE Flux, after the answer tokens:
yield "data: " + objectMapper.writeValueAsString(Map.of(
    "event", "highlight-row",
    "detail", Map.of("id", orderId)
)) + "\n\n";
```

Frontend — listen for it in a custom web component or page:

```js
document.addEventListener('highlight-row', (e) => {
    highlightRow(e.detail.id);
});
```

### System prompt guidance

To make the LLM emit these events reliably, describe the contract in the system prompt:

```
You are an assistant for the Orders application.

When the user asks to open or view a specific record, emit a navigation event
at the END of your response, after any explanatory text:

data: {"event": "navigation-requested", "detail": {"route": "/orders/<id>", "consumedRoute": "", "actionId": "view", "baseUrl": "/_orders", "serverSideType": "com.example.OrderHome", "uriPrefix": ""}}

Only emit one event per response. Never show the raw JSON to the user.
```

## Summary

- Annotate your root UI class with `@AI(sse = "<url>")`.
- Implement an SSE endpoint at that URL — or, for local development, add `io.mateu:agent-cli` and point at `/mateu/agent/stream` (no API key needed).
- Mateu handles the rest: button, panel, streaming UI.
- Stream the reply line by line; replies render as markdown and may embed images (`data:` URIs included) and inline SVG.
- Emit `{"event": "...", "detail": {...}}` in the stream to trigger UI actions from the LLM; emit token-usage JSON to feed the token bar.
