package io.mateu.core.application.mcp;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.mateu.core.testutil.FakeHttpRequest;
import io.mateu.core.testutil.TestMateu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.SearchRequest;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Listing;
import io.mateu.uidl.interfaces.Searchable;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * The MCP projection of a LISTING, against the real wire (not a hand-written fixture): the
 * listing's metadata travels as {@code "Crud"}, the search text is read from the component state,
 * and the rows of a search answer must reach the agent.
 */
class McpListingSyncTest {

  public record Book(String id, String title) {}

  @UI("/mcp-books")
  @Title("Books")
  public static class McpBooks implements Listing<Book>, Searchable {
    @Override
    public ListingData<Book> search(SearchRequest request, HttpRequest httpRequest) {
      String text = request.searchText() == null ? "" : request.searchText();
      return ListingData.from(
          List.of(new Book("b1", "El Quijote"), new Book("b2", "Rayuela")).stream()
              .filter(book -> book.title().contains(text))
              .toList());
    }
  }

  static TestMateu mateu;
  static McpService mcp;
  static final ObjectMapper OM = new ObjectMapper();
  static final McpService.HttpRequestFactory REQUESTS =
      rq -> new FakeHttpRequest(rq).withAttribute("baseUrl", "");

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(McpBooks.class);
    mcp = new McpService(mateu.service(), OM);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static List<String> ids(JsonNode array, String key) {
    var out = new ArrayList<String>();
    array.forEach(node -> out.add(node.path(key).asText()));
    return out;
  }

  @Test
  void aListingIsProjectedWithItsColumnsAndSearchBox() {
    ObjectNode s = mcp.describeScreen("mcp-books", "", REQUESTS);
    assertThat(s.has("listing")).as("the Crud metadata is projected as a listing").isTrue();
    assertThat(s.get("listing").get("searchable").asBoolean()).isTrue();
    assertThat(ids(s.get("listing").get("columns"), "id")).contains("id", "title");
  }

  @Test
  void aSearchFiltersByTheTextAndAnswersItsRows() {
    ObjectNode s = mcp.search("mcp-books", "Ray", null, "", REQUESTS);
    JsonNode rows = s.path("listing").path("rows");
    assertThat(rows.isArray()).as("the rows of the search reach the agent").isTrue();
    assertThat(ids(rows, "title")).containsExactly("Rayuela");
    assertThat(rows.get(0).has("_rowNumber")).isFalse();
    assertThat(s.get("listing").get("totalElements").asInt()).isEqualTo(1);
  }

  @Test
  void aSearchWithoutTextAnswersEveryRow() {
    ObjectNode s = mcp.search("mcp-books", "", null, "", REQUESTS);
    assertThat(ids(s.path("listing").path("rows"), "id")).containsExactly("b1", "b2");
  }
}
