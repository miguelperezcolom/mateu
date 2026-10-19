package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.core.application.agentpush.AgentSessions;
import io.mateu.core.application.mcp.McpJsonRpc;
import io.mateu.core.application.mcp.McpService;
import io.mateu.core.testutil.FakeHttpRequest;
import io.mateu.core.testutil.TestIdentities;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.AgentPushDto;
import io.mateu.dtos.AppDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UICommandTypeDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * Live UI push end to end in-JVM: the app shell advertises it, the {@code _agent-channel} stream
 * carries what an MCP caller sends, pairing and unpairing go through the app-level actions, and
 * nothing works with push off.
 */
class AgentPushSyncTest {

  private static final ObjectMapper OM = new ObjectMapper();

  @SuppressWarnings("unused")
  @UI("/push-app")
  @Title("Push app")
  @App
  public static class PushApp {
    @Menu String orders = "/orders";
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(PushApp.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @BeforeEach
  void on() {
    System.setProperty("mateu.mcp.enabled", "true");
    System.setProperty("mateu.mcp.push.enabled", "true");
    AgentSessions.shared().reset();
  }

  @AfterEach
  void off() {
    System.clearProperty("mateu.mcp.enabled");
    System.clearProperty("mateu.mcp.push.enabled");
    AgentSessions.shared().reset();
  }

  private AppDto app() {
    return FullSyncPipelineTest.findMetadata(
        mateu.sync("/push-app").fragments().get(0).component(), AppDto.class);
  }

  static RunActionRqDto rq(String actionId, Map<String, Object> parameters) {
    return RunActionRqDto.builder()
        .route("/push-app")
        .serverSideType(PushApp.class.getName())
        .actionId(actionId)
        .initiatorComponentId("agent")
        .componentState(Map.of())
        .parameters(parameters)
        .build();
  }

  static Map<String, Object> ids() {
    return Map.of(
        "sessionId", "tab-1", "secret", "tab-secret", "route", "/orders", "renderer", "vaadin");
  }

  static List<AgentPushDto> pushes(List<UIIncrementDto> increments) {
    return increments.stream()
        .flatMap(i -> i.commands().stream())
        .filter(c -> c.type() == UICommandTypeDto.AgentPush)
        .map(c -> (AgentPushDto) c.data())
        .toList();
  }

  static void await(java.util.function.BooleanSupplier condition) {
    var deadline = System.nanoTime() + Duration.ofSeconds(5).toNanos();
    while (!condition.getAsBoolean()) {
      if (System.nanoTime() > deadline) throw new AssertionError("timed out");
      try {
        Thread.sleep(10);
      } catch (InterruptedException e) {
        throw new AssertionError(e);
      }
    }
  }

  @Test
  void theShellSaysWhetherPushIsOn() {
    assertThat(app().agentPush()).isTrue();
    System.clearProperty("mateu.mcp.push.enabled");
    assertThat(app().agentPush()).isFalse();
    System.setProperty("mateu.mcp.push.enabled", "true");
    System.clearProperty("mateu.mcp.enabled");
    assertThat(app().agentPush()).as("push needs the MCP endpoint too").isFalse();
  }

  @Test
  void withPushOffTheChannelIsRefused() {
    System.clearProperty("mateu.mcp.push.enabled");
    // the stream answers the error boundary's message and ends
    var answers = mateu.stream(rq("_agent-channel", ids())).collectList().block();
    assertThat(OM.valueToTree(answers).toString()).contains("Live UI push is not enabled.");
    assertThat(OM.valueToTree(mateu.run(rq("_agent-pair", ids()))).path("messages").toString())
        .contains("Live UI push is not enabled.");
  }

  @Test
  void theChannelCarriesWhatAnMcpCallerSends() throws Exception {
    var received = new CopyOnWriteArrayList<UIIncrementDto>();
    var subscription = mateu.stream(rq("_agent-channel", ids())).subscribe(received::add);
    try {
      await(() -> !pushes(received).isEmpty());
      assertThat(pushes(received).get(0))
          .isEqualTo(
              new AgentPushDto(
                  "status", "mateu-agent-status", Map.of("paired", false, "agents", List.of())));

      // the user pairs: the app-level action answers a code
      var pairing = mateu.run(rq("_agent-pair", ids()));
      var json = OM.valueToTree(pairing).toString();
      var code = json.replaceAll(".*\"code\":\"([A-Z0-9-]+)\".*", "$1");
      assertThat(code).matches("[A-Z0-9]{4}-[A-Z0-9]{4}");
      assertThat(json).contains("\"expiresInSeconds\":300");

      // an anonymous MCP caller pairs with it and pushes a screen
      var mcp = new McpService(mateu.service(), OM);
      var paired = call(mcp, null, "mateu_pair_session", Map.of("code", code));
      var handle = paired.path("session").asText();
      assertThat(paired.path("route").asText()).isEqualTo("/orders");
      var pushed =
          call(
              mcp,
              null,
              "mateu_push_ui",
              Map.of("session", handle, "yaml", "type: Text\ntext: Hi\n", "target", "dialog"));
      assertThat(pushed.path("delivered").asBoolean()).isTrue();

      await(() -> pushes(received).size() >= 3);
      assertThat(pushes(received).get(1).detail())
          .isEqualTo(Map.of("paired", true, "agents", List.of("an agent")));
      assertThat(pushes(received).get(2))
          .isEqualTo(
              new AgentPushDto(
                  "render",
                  "render-screen",
                  Map.of("yaml", "type: Text\ntext: Hi\n", "target", "dialog")));

      // the user disconnects the agent
      mateu.run(rq("_agent-unpair", ids()));
      await(() -> pushes(received).size() >= 4);
      assertThat(pushes(received).get(3).detail().get("paired")).isEqualTo(false);
      var refused =
          McpJsonRpc.handle(
              message("mateu_navigate", Map.of("session", handle, "route", "/")),
              mcp,
              "",
              FakeHttpRequest::new,
              OM);
      assertThat(refused.path("result").path("isError").asBoolean()).isTrue();
    } finally {
      subscription.dispose();
    }
  }

  @Test
  void anotherUserCannotTakeOverTheChannelOrAskForItsCode() {
    var received = new CopyOnWriteArrayList<UIIncrementDto>();
    var subscription = mateu.stream(rq("_agent-channel", ids())).subscribe(received::add);
    try {
      await(() -> !pushes(received).isEmpty());
      assertThat(
              OM.valueToTree(
                      mateu.run(rq("_agent-pair", ids()), TestIdentities.headersWithRoles("user")))
                  .path("messages")
                  .toString())
          .contains("This UI session belongs to another channel.");
      var stolen = new java.util.HashMap<>(ids());
      stolen.put("secret", "guessed");
      assertThat(OM.valueToTree(mateu.run(rq("_agent-pair", stolen))).path("messages").toString())
          .contains("This UI session belongs to another channel.");
    } finally {
      subscription.dispose();
    }
  }

  static com.fasterxml.jackson.databind.node.ObjectNode message(
      String tool, Map<String, Object> args) {
    var message = OM.createObjectNode().put("jsonrpc", "2.0").put("id", 1);
    message.put("method", "tools/call");
    message.putObject("params").put("name", tool).set("arguments", OM.valueToTree(args));
    return message;
  }

  static com.fasterxml.jackson.databind.JsonNode call(
      McpService mcp, String user, String tool, Map<String, Object> args) throws Exception {
    McpService.HttpRequestFactory requests =
        rq -> {
          var request = new FakeHttpRequest(rq);
          if (user != null) request.withPrincipal(TestIdentities.principal(Map.of("sub", user)));
          return request;
        };
    var response = McpJsonRpc.handle(message(tool, args), mcp, "", requests, OM).path("result");
    assertThat(response.path("isError").asBoolean()).as(response.toString()).isFalse();
    return OM.readTree(response.path("content").path(0).path("text").asText());
  }
}
