package io.mateu.core.application.mcp;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.mateu.core.application.agentpush.AgentSessions;
import io.mateu.core.testutil.FakeHttpRequest;
import io.mateu.core.testutil.TestIdentities;
import io.mateu.core.testutil.TestMateu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import java.nio.file.Files;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * The Java reference of {@code conformance/mcp/push.json}: the push tools byte for byte, and the
 * scripted scenario (three UI sessions, three callers) run through {@link McpJsonRpc} exactly as
 * the native endpoint runs it. The .NET and Python backends run the same file.
 */
class McpPushCorpusTest {

  private static final ObjectMapper OM = new ObjectMapper();

  @UI("/mcp-push-home")
  @Title("Push home")
  public static class Home {}

  static TestMateu mateu;
  static McpService mcp;

  @BeforeAll
  static void boot() {
    System.setProperty("mateu.mcp.enabled", "true");
    System.setProperty("mateu.mcp.push.enabled", "true");
    AgentSessions.shared().reset();
    mateu = TestMateu.withUis(Home.class);
    mcp = new McpService(mateu.service(), OM);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
    AgentSessions.shared().reset();
    System.clearProperty("mateu.mcp.enabled");
    System.clearProperty("mateu.mcp.push.enabled");
  }

  static JsonNode corpus() throws Exception {
    var file = McpAuthoringCorpusTest.corpusFile().resolveSibling("push.json");
    return OM.readTree(Files.readString(file));
  }

  @Test
  void thePushToolsAreTheCorpusOnesAndOnlyWhenPushIsOn() throws Exception {
    var all = McpJsonRpc.tools(OM, true, true);
    var base = McpJsonRpc.tools(OM, false, false);
    var push = OM.createArrayNode();
    for (int i = base.size(); i < all.size() - 1; i++) push.add(all.get(i));
    assertThat(push).isEqualTo(corpus().get("pushTools"));
    assertThat(all.get(all.size() - 1).path("name").asText()).isEqualTo("mateu_save_spec");
    assertThat(McpJsonRpc.tools(OM, false, false).toString()).doesNotContain("mateu_push_ui");
    // and tools/list follows the switch
    var listed = call("alice", OM.createObjectNode().put("id", 1).put("method", "tools/list"));
    assertThat(listed.path("result").path("tools").toString()).contains("mateu_push_ui");
  }

  /**
   * N16: the server refuses the framework's own event names too — the same list the renderers drop
   * ({@code conformance/client/agent-events.json}), so one renderer's filter defect is no bypass.
   */
  @Test
  void theFrameworksOwnEventNamesAreTheRenderersOnes() throws Exception {
    var events =
        OM.readTree(
            Files.readString(
                McpAuthoringCorpusTest.corpusFile()
                    .getParent()
                    .resolveSibling("client")
                    .resolve("agent-events.json")));
    var reserved = new java.util.TreeSet<String>();
    events.get("reserved").forEach(n -> reserved.add(n.asText()));
    assertThat(
            new java.util.TreeSet<>(io.mateu.core.application.agentpush.AgentPush.FRAMEWORK_EVENTS))
        .isEqualTo(reserved);
    var prefixes = new java.util.ArrayList<String>();
    events.get("reservedPrefixes").forEach(n -> prefixes.add(n.asText()));
    assertThat(io.mateu.core.application.agentpush.AgentPush.FRAMEWORK_EVENT_PREFIXES)
        .isEqualTo(prefixes);
    assertThat(
            io.mateu.core.application.agentpush.AgentPush.FRAMEWORK_EVENT.replace("%s", "{event}"))
        .isEqualTo(corpus().get("errors").get("frameworkEvent").asText());
    assertThat(io.mateu.core.application.agentpush.AgentPush.isFrameworkEvent("vaadin-x")).isTrue();
    assertThat(io.mateu.core.application.agentpush.AgentPush.isFrameworkEvent("highlight-row"))
        .isFalse();
  }

  @Test
  void theScenarioRunsAsWritten() throws Exception {
    AgentSessions.shared().reset();
    var scenario = corpus().get("scenario");
    Map<String, List<AgentSessions.Message>> received = new HashMap<>();
    Map<String, Integer> seen = new HashMap<>();
    Map<String, AgentSessions.Channel> channels = new HashMap<>();
    Map<String, String[]> secrets = new HashMap<>();
    Map<String, String> codes = new HashMap<>();
    for (var s : scenario.get("sessions")) {
      var id = s.get("sessionId").asText();
      var principal = s.get("principal").isNull() ? null : s.get("principal").asText();
      secrets.put(id, new String[] {s.get("secret").asText(), principal});
      var messages = new ArrayList<AgentSessions.Message>();
      received.put(id, messages);
      channels.put(
          id,
          AgentSessions.shared()
              .open(
                  id,
                  s.get("secret").asText(),
                  principal,
                  s.get("route").asText(),
                  s.get("renderer").asText(),
                  messages::add,
                  () -> {}));
    }
    // handle -> sessionId, learnt from the answers (they are opaque and random)
    Map<String, String> handles = new HashMap<>();
    int n = 0;
    for (var step : scenario.get("steps")) {
      n++;
      var label = "step " + n + ": " + step;
      if (step.has("received")) {
        var id = step.get("received").asText();
        var all = received.get(id);
        var from = seen.getOrDefault(id, 0);
        var got = OM.valueToTree(all.subList(from, all.size()));
        seen.put(id, all.size());
        assertThat((JsonNode) got).as(label).isEqualTo(step.get("expect"));
        continue;
      }
      if (step.has("ui")) {
        var id = step.get("sessionId").asText();
        var s = secrets.get(id);
        switch (step.get("ui").asText()) {
          case "pair" ->
              codes.put(
                  id, (String) AgentSessions.shared().pairingCode(id, s[0], s[1]).get("code"));
          case "unpair" -> AgentSessions.shared().unpair(id, s[0], s[1]);
          case "disconnect" -> channels.get(id).close();
          default -> throw new IllegalStateException(step.toString());
        }
        continue;
      }
      var args = (ObjectNode) substitute(step.get("args"), handles, codes);
      var message = OM.createObjectNode().put("jsonrpc", "2.0").put("id", n);
      message.put("method", "tools/call");
      message.putObject("params").put("name", step.get("tool").asText()).set("arguments", args);
      var response = call(step.get("as").asText(), message).path("result");
      var text = response.path("content").path(0).path("text").asText();
      JsonNode actual;
      if (response.path("isError").asBoolean()) {
        actual = OM.createObjectNode().put("error", text.replaceFirst("^Error: ", ""));
      } else {
        actual = OM.readTree(text);
      }
      learnHandles(actual, handles, AgentSessions.shared(), secrets);
      assertThat(normalize(actual, handles)).as(label).isEqualTo(step.get("expect"));
    }
  }

  /** Runs a JSON-RPC message as one of the scenario's callers. */
  static JsonNode call(String as, ObjectNode message) {
    McpService.HttpRequestFactory requests =
        rq -> {
          var request = new FakeHttpRequest(rq);
          if (!"anon".equals(as)) {
            request.withPrincipal(TestIdentities.principal(Map.of("sub", as)));
          }
          return request;
        };
    return McpJsonRpc.handle(message, mcp, "", requests, OM);
  }

  /** Placeholders of the args: {@code <session:ID>} and {@code <code:ID>}. */
  static JsonNode substitute(
      JsonNode node, Map<String, String> handles, Map<String, String> codes) {
    var text = node.toString();
    for (var e : handlesBySession(handles).entrySet()) {
      text = text.replace("<session:" + e.getKey() + ">", e.getValue());
    }
    for (var e : codes.entrySet()) {
      text = text.replace("<code:" + e.getKey() + ">", e.getValue());
    }
    try {
      return OM.readTree(text);
    } catch (Exception e) {
      throw new IllegalStateException(e);
    }
  }

  private static Map<String, String> handlesBySession(Map<String, String> handles) {
    var out = new HashMap<String, String>();
    handles.forEach((handle, id) -> out.put(id, handle));
    return out;
  }

  /**
   * A session handle in an answer is mapped to its UI session through the registry: whoever lists
   * it is the owner the scenario names (ui-1 alice, ui-2 bob…), so the route + renderer of the
   * entry identify it.
   */
  static void learnHandles(
      JsonNode node, Map<String, String> handles, AgentSessions sessions, Map<String, String[]> s) {
    if (node.isObject()) {
      if (node.has("session") && node.has("renderer")) {
        var renderer = node.get("renderer").asText();
        var id =
            switch (renderer) {
              case "vaadin" -> "ui-1";
              case "redwood" -> "ui-2";
              default -> "ui-3";
            };
        handles.put(node.get("session").asText(), id);
      }
      for (Iterator<JsonNode> it = node.elements(); it.hasNext(); ) {
        learnHandles(it.next(), handles, sessions, s);
      }
    } else if (node.isArray()) {
      node.forEach(child -> learnHandles(child, handles, sessions, s));
    }
  }

  /** Volatile values: handles → {@code <session:ID>}, connectedAt → {@code <time>}. */
  static JsonNode normalize(JsonNode node, Map<String, String> handles) {
    var text = node.toString();
    for (var e : handles.entrySet()) {
      text = text.replace(e.getKey(), "<session:" + e.getValue() + ">");
    }
    try {
      var out = OM.readTree(text);
      replaceTimes(out);
      return out;
    } catch (Exception e) {
      throw new IllegalStateException(e);
    }
  }

  private static void replaceTimes(JsonNode node) {
    if (node instanceof ObjectNode object) {
      if (object.has("connectedAt") && !object.get("connectedAt").isNull()) {
        object.put("connectedAt", "<time>");
      }
      object.elements().forEachRemaining(McpPushCorpusTest::replaceTimes);
    } else if (node instanceof ArrayNode array) {
      array.forEach(McpPushCorpusTest::replaceTimes);
    }
  }
}
