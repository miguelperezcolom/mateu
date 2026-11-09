package io.mateu.explorer.examples.components.chat;

import java.util.Map;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

/**
 * The "agent" behind the Chat example: Mateu draws the chat, YOU provide the endpoint. The panel
 * POSTs {@code {message, sessionId, currentRoute, screen…}} and reads the answer as a
 * server-sent-events stream. Each {@code agent-delta} event appends a piece of text; a plain text
 * event is a line of the answer. A real one would call an LLM — this one knows three paintings.
 */
@RestController
public class DocentAgent {

  static final Map<String, String> KNOWN =
      Map.of(
          "starry", "**The Starry Night** (1889) — Van Gogh painted it from his window at Saint-Rémy.",
          "kiss", "**The Kiss** (1908) — Klimt's golden period; it hangs in the Belvedere, Vienna.",
          "meninas", "**Las Meninas** (1656) — Velázquez paints himself painting the king and queen.");

  @PostMapping(value = "/explorer-api/docent", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
  public String answer(@RequestBody Map<String, Object> request) {
    var question = String.valueOf(request.get("message")).toLowerCase();
    var answer =
        KNOWN.entrySet().stream()
            .filter(e -> question.contains(e.getKey()))
            .map(Map.Entry::getValue)
            .findFirst()
            .orElse("I only know *The Starry Night*, *The Kiss* and *Las Meninas* — ask me about one of them.");
    var sse = new StringBuilder();
    sse.append(event("{\"event\":\"agent-status\",\"detail\":{\"phase\":\"thinking\",\"text\":\"Looking it up…\"}}"));
    for (var word : answer.split("(?<= )")) {
      sse.append(event("{\"event\":\"agent-delta\",\"detail\":{\"text\":" + json(word) + "}}"));
    }
    return sse.toString();
  }

  static String event(String data) {
    return "data: " + data + "\n\n";
  }

  static String json(String text) {
    return "\"" + text.replace("\\", "\\\\").replace("\"", "\\\"") + "\"";
  }
}
