package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.AppDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.GlobalSearchResult;
import io.mateu.uidl.interfaces.GlobalSearchSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * Global entity search on the command palette: an app class implementing {@link
 * GlobalSearchSupplier} advertises it ({@code AppDto.globalSearchEnabled}) and answers the
 * app-level {@code _globalsearch} action with matching entities (label, description, route,
 * category) under {@code Data{_globalsearch}}.
 */
class GlobalSearchSyncTest {

  @SuppressWarnings("unused")
  @UI("/searchable-app")
  @Title("Searchable")
  public static class SearchableApp implements GlobalSearchSupplier {

    @Menu String home = "/";

    @Override
    public List<GlobalSearchResult> globalSearch(String searchText, HttpRequest httpRequest) {
      return List.of(
              new GlobalSearchResult("Acme S.L.", "CIF B123", "/customers/1", "Clientes"),
              new GlobalSearchResult("Reserva R-42 (Acme)", null, "/reservations/42", "Reservas"),
              new GlobalSearchResult("Globex", "CIF B999", "/customers/2", "Clientes"))
          .stream()
          .filter(hit -> hit.label().toLowerCase().contains(searchText.toLowerCase()))
          .toList();
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(SearchableApp.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @SuppressWarnings("unchecked")
  private List<GlobalSearchResult> search(String text) {
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("/searchable-app")
                .consumedRoute("/searchable-app")
                .serverSideType(SearchableApp.class.getName())
                .actionId("_globalsearch")
                .initiatorComponentId("_ux")
                .componentState(Map.of())
                .parameters(Map.of("searchText", text))
                .build());
    var data = (Map<String, Object>) increment.fragments().get(0).data();
    return (List<GlobalSearchResult>) data.get("_globalsearch");
  }

  @Test
  void theAppAdvertisesGlobalSearchWhenTheSupplierIsImplemented() {
    var app =
        FullSyncPipelineTest.findMetadata(
            mateu.sync("/searchable-app").fragments().get(0).component(), AppDto.class);
    assertThat(app.globalSearchEnabled()).isTrue();
  }

  @Test
  void theSearchActionAnswersMatchingEntitiesWithRouteAndCategory() {
    var hits = search("acme");
    assertThat(hits).hasSize(2);
    assertThat(hits.get(0).label()).isEqualTo("Acme S.L.");
    assertThat(hits.get(0).route()).isEqualTo("/customers/1");
    assertThat(hits.get(0).category()).isEqualTo("Clientes");
  }

  @Test
  void anEmptySearchTextIsForwardedAsIs() {
    assertThat(search("")).hasSize(3);
  }
}
