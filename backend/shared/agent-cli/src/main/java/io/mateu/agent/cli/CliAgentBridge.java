package io.mateu.agent.cli;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Optional;

/**
 * Pure translation between one LLM CLI's output and the chat's SSE contract (line-oriented: every
 * data event is ONE line of the reply; a line that is a JSON object with an "event" field operates
 * the UI; a JSON object with token fields reports usage). Kept free of process/IO so it is
 * unit-testable.
 */
public final class CliAgentBridge {

  private static final ObjectMapper json = new ObjectMapper();

  private CliAgentBridge() {}

  /** What one parsed CLI line contributes to the SSE stream. */
  public record Contribution(String text, String usageJson, String sessionId) {
    public static Contribution empty() {
      return new Contribution(null, null, null);
    }
  }

  /**
   * Parses one line of `claude --output-format stream-json` output. Recognises the init event
   * (session id, for --resume continuity), text deltas (partial messages), whole assistant messages
   * (fallback when partials are off) and the final result (usage).
   */
  public static Contribution parseClaudeLine(String line, int alreadySent) {
    JsonNode node;
    try {
      node = json.readTree(line);
    } catch (Exception e) {
      return Contribution.empty();
    }
    if (node == null || !node.isObject()) return Contribution.empty();
    var type = node.path("type").asText();
    switch (type) {
      case "system" -> {
        if ("init".equals(node.path("subtype").asText())) {
          return new Contribution(null, null, node.path("session_id").asText(null));
        }
      }
      case "stream_event" -> {
        var delta = node.path("event").path("delta");
        if ("text_delta".equals(delta.path("type").asText())) {
          return new Contribution(delta.path("text").asText(""), null, null);
        }
      }
      case "assistant" -> {
        var text = new StringBuilder();
        node.path("message")
            .path("content")
            .forEach(
                part -> {
                  if ("text".equals(part.path("type").asText()))
                    text.append(part.path("text").asText(""));
                });
        // partial deltas may have covered a prefix already: send only the tail
        if (text.length() > alreadySent) {
          return new Contribution(text.substring(alreadySent), null, null);
        }
      }
      case "result" -> {
        var usage = node.path("usage");
        if (usage.isObject()) {
          var input = usage.path("input_tokens").asLong(0);
          var output = usage.path("output_tokens").asLong(0);
          return new Contribution(
              null,
              "{\"inputTokens\":"
                  + input
                  + ",\"outputTokens\":"
                  + output
                  + ",\"totalTokens\":"
                  + (input + output)
                  + "}",
              null);
        }
      }
      default -> {
        return Contribution.empty();
      }
    }
    return Contribution.empty();
  }

  /**
   * The system preamble that teaches the CLI the chat's UI protocol: plain markdown for prose, and
   * — exactly when the user asks to GO somewhere — one line holding a JSON object the chat turns
   * into a DOM event.
   */
  public static String systemPreamble(Optional<String> menuContextJson) {
    var sb = new StringBuilder();
    sb.append(
        "You are the in-app assistant of a business application. Answer in the user's language, ");
    sb.append(
        "in concise markdown (it renders in a chat bubble; inline images and SVG are supported). ");
    sb.append("To OPERATE the UI, emit a line containing ONLY a JSON object: ");
    sb.append(
        "{\"event\":\"navigation-requested\",\"detail\":<navigation>} — the chat dispatches it as a DOM event. ");
    sb.append("Use it exactly when the user asks to open/go to a screen, never speculatively.");
    menuContextJson.ifPresent(
        menu ->
            sb.append(" The app's screens (breadcrumb path + the navigation ")
                .append("payload to emit as <navigation>): ")
                .append(menu));
    return sb.toString();
  }
}
