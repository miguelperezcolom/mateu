package io.mateu.core.application.mcp;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.mateu.core.testutil.FakeHttpRequest;
import io.mateu.core.testutil.TestMateu;
import io.mateu.uidl.annotations.EyesOnly;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.annotations.UI;
import java.util.HashMap;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * In-JVM verification of the NATIVE MCP host: drives {@link McpService} / {@link McpJsonRpc}
 * against the real core bean graph (via {@link TestMateu}), proving the native projection
 * reproduces the sidecar's and that RBAC is inherited from the server (an {@code @EyesOnly} field a
 * caller may not see never reaches the projection). Part of the agent-operability plane (P3).
 */
class McpServiceSyncTest {

  @SuppressWarnings("unused")
  @UI("/mcp-demo")
  @Title("MCP Demo")
  public static class McpDemoForm {
    public String name = "Ada";

    @EyesOnly(roles = "admin")
    public String secret = "classified";

    @Toolbar
    public void greet() {}
  }

  static TestMateu mateu;
  static McpService mcp;
  static final ObjectMapper OM = new ObjectMapper();
  // The adapter's job in real life; here a fake request carrying the rq + baseUrl (no JWT => the
  // caller is unauthorized, which is exactly what the RBAC assertion needs).
  static final McpService.HttpRequestFactory REQUESTS =
      rq -> new FakeHttpRequest(rq).withAttribute("baseUrl", "");

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(McpDemoForm.class);
    mcp = new McpService(mateu.service(), OM);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @Test
  void describeScreenProjectsFieldsAndActions() {
    ObjectNode s = mcp.describeScreen("mcp-demo", "", REQUESTS);
    assertThat(s.get("serverSideType").asText()).isEqualTo(McpDemoForm.class.getName());
    Map<String, JsonNode> fields = new HashMap<>();
    s.get("fields").forEach(f -> fields.put(f.get("id").asText(), f));
    assertThat(fields).containsKey("name");
    assertThat(fields.get("name").get("value").asText()).isEqualTo("Ada");
    // the greet toolbar action is advertised
    boolean hasGreet = false;
    for (JsonNode a : s.get("actions")) if ("greet".equals(a.get("id").asText())) hasGreet = true;
    assertThat(hasGreet).as("greet action present").isTrue();
  }

  @Test
  void rbacHidesAnEyesOnlyFieldFromAnUnauthorizedCaller() {
    ObjectNode s = mcp.describeScreen("mcp-demo", "", REQUESTS);
    for (JsonNode f : s.get("fields")) {
      assertThat(f.get("id").asText())
          .as("secret must not leak to an unauthorized agent")
          .isNotEqualTo("secret");
    }
  }

  @Test
  void jsonRpcInitializeAndToolsList() {
    JsonNode init =
        McpJsonRpc.handle(
            OM.createObjectNode().put("id", 1).put("method", "initialize"), mcp, "", REQUESTS, OM);
    assertThat(init.get("result").get("serverInfo").get("name").asText()).isEqualTo("mateu-mcp");
    assertThat(init.get("result").get("protocolVersion").asText()).isNotEmpty();

    JsonNode list =
        McpJsonRpc.handle(
            OM.createObjectNode().put("id", 2).put("method", "tools/list"), mcp, "", REQUESTS, OM);
    var names = new java.util.TreeSet<String>();
    list.get("result").get("tools").forEach(t -> names.add(t.get("name").asText()));
    assertThat(names)
        .containsExactly(
            "mateu_describe_screen", "mateu_list_routes", "mateu_run_action", "mateu_search");
  }

  @Test
  void jsonRpcToolsCallDescribeScreenReturnsTheProjectionAsText() throws Exception {
    ObjectNode msg = OM.createObjectNode();
    msg.put("id", 3).put("method", "tools/call");
    ObjectNode params = msg.putObject("params");
    params.put("name", "mateu_describe_screen");
    params.putObject("arguments").put("route", "mcp-demo");
    JsonNode resp = McpJsonRpc.handle(msg, mcp, "", REQUESTS, OM);
    JsonNode content = resp.get("result").get("content").get(0);
    assertThat(content.get("type").asText()).isEqualTo("text");
    JsonNode projected = OM.readTree(content.get("text").asText());
    assertThat(projected.get("serverSideType").asText()).isEqualTo(McpDemoForm.class.getName());
  }

  @Test
  void jsonRpcNotificationYieldsNoResponse() {
    JsonNode r =
        McpJsonRpc.handle(
            OM.createObjectNode().put("method", "notifications/initialized"),
            mcp,
            "",
            REQUESTS,
            OM);
    assertThat(r).isNull();
  }

  @Test
  void jsonRpcUnknownMethodYields32601() {
    JsonNode r =
        McpJsonRpc.handle(
            OM.createObjectNode().put("id", 9).put("method", "nope/nope"), mcp, "", REQUESTS, OM);
    assertThat(r.get("error").get("code").asInt()).isEqualTo(-32601);
  }
}
