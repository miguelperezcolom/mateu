package io.mateu.agent.cli;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Optional;
import org.junit.jupiter.api.Test;

class CliAgentBridgeTest {

  @Test
  void init_hands_over_the_session_id() {
    var c =
        CliAgentBridge.parseClaudeLine(
            "{\"type\":\"system\",\"subtype\":\"init\",\"session_id\":\"abc-123\"}", 0);
    assertEquals("abc-123", c.sessionId());
    assertNull(c.text());
  }

  @Test
  void partial_deltas_carry_their_text() {
    var c =
        CliAgentBridge.parseClaudeLine(
            "{\"type\":\"stream_event\",\"event\":{\"type\":\"content_block_delta\","
                + "\"delta\":{\"type\":\"text_delta\",\"text\":\"hola \"}}}",
            0);
    assertEquals("hola ", c.text());
  }

  @Test
  void whole_assistant_messages_send_only_the_tail_after_deltas() {
    var line =
        "{\"type\":\"assistant\",\"message\":{\"content\":[{\"type\":\"text\",\"text\":\"hola mundo\"}]}}";
    assertEquals(" mundo", CliAgentBridge.parseClaudeLine(line, 4).text());
    assertNull(CliAgentBridge.parseClaudeLine(line, 10).text());
  }

  @Test
  void result_becomes_the_chat_usage_line() {
    var c =
        CliAgentBridge.parseClaudeLine(
            "{\"type\":\"result\",\"usage\":{\"input_tokens\":11,\"output_tokens\":7}}", 0);
    assertEquals("{\"inputTokens\":11,\"outputTokens\":7,\"totalTokens\":18}", c.usageJson());
  }

  @Test
  void garbage_lines_contribute_nothing() {
    assertNull(CliAgentBridge.parseClaudeLine("not json at all", 0).text());
    assertNull(CliAgentBridge.parseClaudeLine("{\"type\":\"rate_limit_event\"}", 0).text());
  }

  @Test
  void the_preamble_teaches_the_event_protocol_and_carries_the_menu() {
    var p = CliAgentBridge.systemPreamble(Optional.of("[{\"path\":[\"Inicio\"]}]"));
    assertTrue(p.contains("navigation-requested"));
    assertTrue(p.contains("Inicio"));
    assertTrue(CliAgentBridge.systemPreamble(Optional.empty()).contains("navigation-requested"));
  }
}
