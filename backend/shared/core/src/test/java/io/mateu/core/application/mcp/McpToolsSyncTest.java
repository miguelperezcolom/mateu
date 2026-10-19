package io.mateu.core.application.mcp;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.mateu.core.testutil.FakeHttpRequest;
import io.mateu.core.testutil.TestIdentities;
import io.mateu.core.testutil.TestMateu;
import io.mateu.uidl.UserFacingException;
import io.mateu.uidl.annotations.EyesOnly;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.SearchRequest;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Listing;
import io.mateu.uidl.interfaces.Searchable;
import io.mateu.uidl.interfaces.Submenu;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * The four MCP tools an agent drives an app with, end to end over the real core: list the routes
 * (from the app menu), describe a screen, RUN an action seeding field values, and SEARCH a listing.
 * RBAC comes from the server — an {@code @EyesOnly} action is advertised only to a caller holding
 * the role — and a failing tool is an MCP tool error ({@code isError}), never a protocol error.
 */
class McpToolsSyncTest {

  public static class ReportsMenu implements Submenu {
    @Menu String sales = "/mcp-counter";
  }

  @UI("")
  @Title("Agent app")
  public static class AgentApp {
    @Menu String books = "/mcp-books";

    @Menu ReportsMenu reports;
  }

  @UI("/mcp-counter")
  @Title("Counter")
  public static class Counter {
    public int count = 0;

    @Toolbar
    public void increment() {
      count++;
    }

    @Toolbar
    public void explode() {
      throw new UserFacingException("Out of stock", "Only 2 units left.");
    }

    @Toolbar
    @EyesOnly(roles = "admin")
    public void purge() {
      count = 0;
    }
  }

  public record Book(String id, String title) {}

  @UI("/mcp-books")
  @Title("Books")
  public static class Books implements Listing<Book>, Searchable {
    @Override
    public ListingData<Book> search(SearchRequest request, HttpRequest httpRequest) {
      var all = List.of(new Book("b1", "Rayuela"), new Book("b2", "Ficciones"));
      return ListingData.from(
          all.stream()
              .filter(
                  b ->
                      request.searchText() == null
                          || b.title().toLowerCase().contains(request.searchText().toLowerCase()))
              .toList());
    }
  }

  static TestMateu mateu;
  static McpService mcp;
  // the app shell lives in its own harness: a root app changes how every other route resolves
  static TestMateu shell;
  static McpService shellMcp;
  static final ObjectMapper OM = new ObjectMapper();
  static final McpService.HttpRequestFactory ANONYMOUS =
      rq -> new FakeHttpRequest(rq).withAttribute("baseUrl", "");
  static final McpService.HttpRequestFactory ADMIN =
      rq ->
          new FakeHttpRequest(rq)
              .withAttribute("baseUrl", "")
              .withPrincipal(TestIdentities.principalWithRoles("admin"));

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(Counter.class, Books.class);
    mcp = new McpService(mateu.service(), OM);
    shell = TestMateu.withUis(AgentApp.class);
    shellMcp = new McpService(shell.service(), OM);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
    shell.close();
  }

  private static JsonNode call(String tool, ObjectNode args, McpService.HttpRequestFactory who)
      throws Exception {
    ObjectNode msg = OM.createObjectNode();
    msg.put("jsonrpc", "2.0").put("id", 7).put("method", "tools/call");
    ObjectNode params = msg.putObject("params");
    params.put("name", tool);
    params.set("arguments", args);
    JsonNode resp = McpJsonRpc.handle(msg, mcp, "", who, OM);
    assertThat(resp.get("id").asInt()).isEqualTo(7);
    return resp.get("result");
  }

  private static JsonNode text(JsonNode result) throws Exception {
    return OM.readTree(result.get("content").get(0).get("text").asText());
  }

  private static List<String> actionIds(JsonNode projection) {
    var ids = new ArrayList<String>();
    projection.get("actions").forEach(a -> ids.add(a.get("id").asText()));
    return ids;
  }

  @Test
  void listRoutesWalksTheAppMenuIncludingSubmenus() throws Exception {
    var routes = new ArrayList<String>();
    shellMcp.listRoutes("", ANONYMOUS).forEach(r -> routes.add(r.get("route").asText()));
    assertThat(routes).containsExactly("books", "reports", "reports/sales", "");
  }

  @Test
  void runActionSeedsTheStateAndReturnsTheResultingScreen() throws Exception {
    ObjectNode args = OM.createObjectNode();
    args.put("route", "mcp-counter").put("actionId", "increment");
    args.putObject("componentState").put("count", 41);
    JsonNode screen = text(call("mateu_run_action", args, ANONYMOUS));
    assertThat(screen.get("state").get("count").asInt()).isEqualTo(42);
  }

  @Test
  void aUserFacingFailureReachesTheAgentAsAnErrorMessageWithItsText() throws Exception {
    ObjectNode args = OM.createObjectNode();
    args.put("route", "/mcp-counter").put("actionId", "explode");
    JsonNode screen = text(call("mateu_run_action", args, ANONYMOUS));
    assertThat(screen.get("messages"))
        .anySatisfy(
            m -> {
              assertThat(m.get("type").asText()).isEqualTo("error");
              assertThat(m.get("text").asText()).isEqualTo("Only 2 units left.");
              assertThat(m.get("title").asText()).isEqualTo("Out of stock");
            });
  }

  @Test
  void anEyesOnlyActionRunsOnlyForACallerHoldingTheRole() throws Exception {
    ObjectNode args = OM.createObjectNode();
    args.put("route", "mcp-counter").put("actionId", "purge");
    args.putObject("componentState").put("count", 5);

    // Refused as a tool error "Forbidden" in all four MCP implementations — never the guard's
    // internal wording (which names the role and the annotation).
    JsonNode refused = call("mateu_run_action", args, ANONYMOUS);
    assertThat(refused.get("isError").asBoolean()).isTrue();
    assertThat(refused.get("content").get(0).get("text").asText()).isEqualTo("Error: Forbidden");

    JsonNode screen = text(call("mateu_run_action", args, ADMIN));
    assertThat(screen.get("state").get("count").asInt()).isZero();
  }

  @Test
  void aListingScreenIsACollectionWhoseSearchActionTheAgentCanCall() {
    JsonNode screen = mcp.describeScreen("mcp-books", "", ANONYMOUS);
    assertThat(screen.get("title").asText()).isEqualTo("Books");
    assertThat(screen.get("pageType").asText()).isEqualTo("collection");
    assertThat(actionIds(screen)).contains("search");
  }

  @Test
  void anUnknownToolIsAToolErrorNotAProtocolError() throws Exception {
    JsonNode result = call("mateu_drop_tables", OM.createObjectNode(), ANONYMOUS);
    assertThat(result.get("isError").asBoolean()).isTrue();
    assertThat(result.get("content").get(0).get("text").asText())
        .isEqualTo("Error: Unknown tool: mateu_drop_tables");
  }

  @Test
  void pingAnswersAnEmptyResultAndANotificationNeverGetsAResponse() {
    JsonNode pong =
        McpJsonRpc.handle(
            OM.createObjectNode().put("id", "p1").put("method", "ping"), mcp, "", ANONYMOUS, OM);
    assertThat(pong.get("id").asText()).isEqualTo("p1");
    assertThat(pong.get("result").isEmpty()).isTrue();

    ObjectNode failingNotification = OM.createObjectNode().put("method", "tools/call");
    failingNotification.putObject("params").put("name", "mateu_drop_tables");
    assertThat(McpJsonRpc.handle(failingNotification, mcp, "", ANONYMOUS, OM)).isNull();
    assertThat(
            McpJsonRpc.handle(OM.createObjectNode().put("method", "nope"), mcp, "", ANONYMOUS, OM))
        .isNull();
  }

  @Test
  void toolsAdvertiseTheirRequiredArguments() {
    JsonNode list =
        McpJsonRpc.handle(
            OM.createObjectNode().put("id", 1).put("method", "tools/list"), mcp, "", ANONYMOUS, OM);
    var required = new java.util.HashMap<String, List<String>>();
    list.get("result")
        .get("tools")
        .forEach(
            t -> {
              var names = new ArrayList<String>();
              t.path("inputSchema").path("required").forEach(n -> names.add(n.asText()));
              required.put(t.get("name").asText(), names);
            });
    assertThat(required)
        .containsEntry("mateu_run_action", List.of("route", "actionId"))
        .containsEntry("mateu_search", List.of("route"))
        .containsEntry("mateu_describe_screen", List.of("route"))
        .containsEntry("mateu_list_routes", List.of());
  }
}
