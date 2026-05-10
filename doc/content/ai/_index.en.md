---
title: "AI"
#icon: "/images/icons/start.svg" # https://fonts.google.com/icons
#icon_bg: ""
description: "Integrate an AI chat assistant into your Mateu application using the @AI annotation."
weight: 60

# don't create a separete form
type: "docs"
_build:
  list: always
  publishResources: true
  render: always
---

# AI chat in Mateu

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

The SSE endpoint receives the user message and streams back tokens as Server-Sent Events.

Expected event format (one event per token or chunk):

```
data: {"token": "Hello"}
data: {"token": " world"}
data: [DONE]
```

Mateu also forwards the current JWT and session-id as request headers so your endpoint can authenticate and personalise responses.

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
@RestController
@RequestMapping("/api/ai")
public class AiChatController {

    private final ChatClient chatClient;

    public AiChatController(ChatClient chatClient) {
        this.chatClient = chatClient;
    }

    @PostMapping(value = "/chat", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> chat(@RequestBody String userMessage) {
        return chatClient.prompt()
            .user(userMessage)
            .stream()
            .content()
            .map(token -> "data: " + token + "\n\n");
    }
}
```

## Summary

- Annotate your root UI class with `@AI(sse = "<url>")`.
- Implement an SSE endpoint at that URL.
- Mateu handles the rest: button, panel, streaming UI.
