package io.mateu.core.application.mcp;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.core.testutil.FakeHttpRequest;
import io.mateu.core.testutil.TestIdentities;
import io.mateu.core.testutil.TestMateu;
import io.mateu.uidl.annotations.EyesOnly;
import io.mateu.uidl.annotations.Fab;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.ListToolbarButton;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.SearchRequest;
import io.mateu.uidl.interfaces.CrudStore;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Identifiable;
import io.mateu.uidl.interfaces.Listing;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * An action restricted by {@code @EyesOnly} is refused on invocation; it must not be ADVERTISED to
 * a caller who may not run it either — not its button, not its id, not its label. Seen through MCP
 * (which lists the advertised actions and the buttons' labels) and in the raw wire.
 */
class McpRestrictedActionsSyncTest {

  public record Thing(String id, String name) implements Identifiable {}

  @UI("/restricted-form")
  @Title("Restricted form")
  public static class RestrictedForm {
    public String name = "Ada";

    @Toolbar
    public void greet() {}

    @Toolbar
    @Label("Purge everything")
    @EyesOnly(roles = "admin")
    public void purge() {}

    @Fab(icon = "vaadin:bomb")
    @EyesOnly(roles = "admin")
    public void detonate() {}
  }

  @UI("/restricted-listing")
  public static class RestrictedListing implements Listing<Thing> {
    @Override
    public ListingData<Thing> search(SearchRequest request, HttpRequest httpRequest) {
      return ListingData.from(List.of(new Thing("t1", "One")));
    }

    @Toolbar
    @EyesOnly(roles = "admin")
    public void wipe() {}

    @ListToolbarButton
    @Label("Archive selected")
    @EyesOnly(roles = "admin")
    public void archive() {}
  }

  @UI("/restricted-crud")
  public static class RestrictedCrud extends AutoCrud<Thing> {
    @Override
    public CrudStore<Thing> store() {
      return new CrudStore<>() {
        @Override
        public Optional<Thing> findById(String id) {
          return Optional.empty();
        }

        @Override
        public String save(Thing entity) {
          return entity.id();
        }

        @Override
        public List<Thing> findAll() {
          return List.of(new Thing("t1", "One"));
        }

        @Override
        public void deleteAllById(List<String> ids) {}
      };
    }

    @ListToolbarButton
    @Label("Mass delete")
    @EyesOnly(roles = "admin")
    public void massDelete() {}
  }

  static TestMateu mateu;
  static McpService mcp;
  static final ObjectMapper OM = new ObjectMapper();
  static final McpService.HttpRequestFactory ANONYMOUS =
      rq -> new FakeHttpRequest(rq).withAttribute("baseUrl", "");
  static final McpService.HttpRequestFactory ADMIN =
      rq -> {
        var request = new FakeHttpRequest(rq).withAttribute("baseUrl", "");
        TestIdentities.headersWithRoles("admin").forEach(request::withHeader);
        return request;
      };

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(RestrictedForm.class, RestrictedListing.class, RestrictedCrud.class);
    mcp = new McpService(mateu.service(), OM);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static String described(String route, McpService.HttpRequestFactory who) {
    return mcp.describeScreen(route, "", who).toString();
  }

  private static List<String> actionIds(String route, McpService.HttpRequestFactory who) {
    var ids = new java.util.ArrayList<String>();
    for (JsonNode a : mcp.describeScreen(route, "", who).get("actions"))
      ids.add(a.get("id").asText());
    return ids;
  }

  @Test
  void aRestrictedToolbarActionAndFabAreNotAdvertisedToAnUnauthorizedCaller() {
    assertThat(actionIds("restricted-form", ANONYMOUS)).contains("greet").doesNotContain("purge");
    assertThat(described("restricted-form", ANONYMOUS))
        .doesNotContain("purge")
        .doesNotContain("Purge everything")
        .doesNotContain("detonate");
  }

  @Test
  void theyAreAdvertisedToACallerWhoMayRunThem() {
    assertThat(actionIds("restricted-form", ADMIN)).contains("greet", "purge");
    assertThat(described("restricted-form", ADMIN)).contains("Purge everything");
  }

  @Test
  void aRestrictedListingToolbarActionIsNotAdvertised() {
    assertThat(described("restricted-listing", ANONYMOUS))
        .doesNotContain("wipe")
        .doesNotContain("Archive selected");
    assertThat(described("restricted-listing", ADMIN))
        .contains("wipe")
        .contains("Archive selected");
  }

  @Test
  void aRestrictedCrudBulkActionIsNotAdvertised() {
    assertThat(described("restricted-crud", ANONYMOUS))
        .doesNotContain("massDelete")
        .doesNotContain("Mass delete");
    assertThat(described("restricted-crud", ADMIN)).contains("Mass delete");
  }
}
