package io.mateu.core.application.mcp;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.FakeHttpRequest;
import io.mateu.core.testutil.TestMateu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

class McpEndpointTest {

  @SuppressWarnings("unused")
  @UI("/mcp-endpoint-demo")
  @Title("MCP Endpoint Demo")
  public static class Demo {
    public String name = "Ada";
  }

  static TestMateu mateu;
  static McpEndpoint endpoint;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(Demo.class);
    endpoint = new McpEndpoint(mateu.service());
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @Test
  void answersInitialize() throws Exception {
    var response =
        endpoint.handle(
            "{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"initialize\"}", FakeHttpRequest::new);
    assertThat(response).contains("\"protocolVersion\"").contains("\"id\":1");
  }

  @Test
  void aNotificationHasNoResponse() throws Exception {
    assertThat(
            endpoint.handle(
                "{\"jsonrpc\":\"2.0\",\"method\":\"notifications/initialized\"}",
                FakeHttpRequest::new))
        .isNull();
  }

  @Test
  void toolsCallReachesTheScreens() throws Exception {
    var response =
        endpoint.handle(
            "{\"jsonrpc\":\"2.0\",\"id\":2,\"method\":\"tools/call\",\"params\":{\"name\":"
                + "\"mateu_describe_screen\",\"arguments\":{\"route\":\"mcp-endpoint-demo\"}}}",
            FakeHttpRequest::new);
    assertThat(response).contains("\"id\":2").contains("Ada");
    assertThat(McpEndpoint.ENABLED_PROPERTY).isEqualTo("mateu.mcp.enabled");
  }
}
