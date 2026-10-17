package io.mateu.core.application.mcp;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.core.testutil.FakeHttpRequest;
import io.mateu.core.testutil.TestMateu;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.SearchRequest;
import io.mateu.uidl.interfaces.CrudStore;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Identifiable;
import io.mateu.uidl.interfaces.Listing;
import io.mateu.uidl.interfaces.Searchable;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * MCP under an app shell: a root {@code @UI("")} app whose {@code @Menu} entries lead to the
 * screens. A route's first answer is the SHELL aimed at it; the agent must be given — and act on —
 * the screen the shell then loads, as the browser is. And the routes listed are the menu's own
 * routes with their labels.
 */
class McpAppShellSyncTest {

  public record Book(String id, String title) {}

  public record Item(String id, String name) implements Identifiable {}

  @Title("Hello")
  public static class Hello {
    public String name = "Ada";
    public String greeting;

    @Toolbar
    public void greet() {
      greeting = "Hello " + name;
    }
  }

  @Title("Books")
  public static class Books implements Listing<Book>, Searchable {
    @Override
    public ListingData<Book> search(SearchRequest request, HttpRequest httpRequest) {
      String text = request.searchText() == null ? "" : request.searchText();
      return ListingData.from(
          List.of(new Book("b1", "El Quijote"), new Book("b2", "Rayuela")).stream()
              .filter(book -> book.title().contains(text))
              .toList());
    }
  }

  @Title("Items")
  public static class Items extends AutoCrud<Item> {
    @Override
    public CrudStore<Item> store() {
      return new CrudStore<>() {
        @Override
        public Optional<Item> findById(String id) {
          return Optional.empty();
        }

        @Override
        public String save(Item entity) {
          return entity.id();
        }

        @Override
        public List<Item> findAll() {
          return List.of(new Item("i1", "Hammer"), new Item("i2", "Saw"));
        }

        @Override
        public void deleteAllById(List<String> ids) {}
      };
    }
  }

  @UI("/mcp-elsewhere")
  @Title("Elsewhere")
  public static class Elsewhere {
    public String where = "far";
  }

  @UI("")
  @Title("Shell")
  public static class Shell {
    @Menu Hello hello;
    @Menu Books books;
    @Menu Items items;
    @Menu String other = "/mcp-elsewhere";
  }

  static TestMateu mateu;
  static McpService mcp;
  static final ObjectMapper OM = new ObjectMapper();
  static final McpService.HttpRequestFactory REQUESTS =
      rq -> new FakeHttpRequest(rq).withAttribute("baseUrl", "");

  @BeforeAll
  static void boot() {
    // own harness: a root app changes route resolution for every other fixture
    mateu = TestMateu.withUis(Shell.class, Elsewhere.class);
    mcp = new McpService(mateu.service(), OM);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static List<String> values(JsonNode array, String key) {
    var out = new ArrayList<String>();
    array.forEach(node -> out.add(node.path(key).asText()));
    return out;
  }

  @Test
  void describingAMenuRouteAnswersTheScreenNotTheShell() {
    ObjectNode s = mcp.describeScreen("hello", "", REQUESTS);
    assertThat(s.get("serverSideType").asText()).isEqualTo(Hello.class.getName());
    assertThat(values(s.get("fields"), "id")).contains("name");
    assertThat(values(s.get("actions"), "id")).contains("greet");
  }

  @Test
  void anActionRunsOnTheScreenNotOnTheShell() {
    ObjectNode s = mcp.runAction("hello", "greet", Map.of("name", "Grace"), "", REQUESTS);
    assertThat(s.get("state").get("greeting").asText()).isEqualTo("Hello Grace");
  }

  @Test
  void aListingUnderTheShellIsProjectedAndSearched() {
    assertThat(mcp.describeScreen("books", "", REQUESTS).has("listing")).isTrue();
    ObjectNode s = mcp.search("books", "Ray", null, "", REQUESTS);
    assertThat(values(s.path("listing").path("rows"), "title")).containsExactly("Rayuela");
  }

  @Test
  void aCrudUnderTheShellIsFollowedThroughItsMediatorToTheListing() {
    ObjectNode s = mcp.describeScreen("items", "", REQUESTS);
    assertThat(s.has("listing")).as("the crud's listing, not the shell").isTrue();
    var filters = new LinkedHashMap<String, Object>();
    ObjectNode found = mcp.search("items", "Saw", filters, "", REQUESTS);
    assertThat(values(found.path("listing").path("rows"), "name")).containsExactly("Saw");
  }

  @Test
  void aRouteMenuEntryAnswersTheScreenItPointsTo() {
    assertThat(mcp.describeScreen("other", "", REQUESTS).get("serverSideType").asText())
        .isEqualTo(Elsewhere.class.getName());
  }

  @Test
  void theRoutesAreTheMenuRoutesWithTheirLabels() {
    var routes = new LinkedHashMap<String, String>();
    mcp.listRoutes("", REQUESTS)
        .forEach(r -> routes.put(r.get("route").asText(), r.get("caption").asText()));
    assertThat(routes)
        .containsEntry("hello", "Hello")
        .containsEntry("books", "Books")
        .containsEntry("items", "Items")
        .containsEntry("other", "Other");
  }
}
