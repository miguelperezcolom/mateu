package io.mateu.core.application.runaction;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.uidl.data.Kanban;
import io.mateu.uidl.data.KanbanColumn;
import io.mateu.uidl.data.RestDataSource;
import io.mateu.uidl.data.RestSourceCatalog;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Listing;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

/**
 * The server half of a live, movable kanban on a YAML page: its cards' source can be proxied (it is
 * declared, by the board's id, next to a listing's rows), and a REST action's call parameters — a
 * move's card, columns and the card's row — reach the state the proxied call interpolates with.
 */
class KanbanRestSourcesTest {

  @Test
  void aLiveKanbansSourceIsDeclaredByItsIdBesideAListingsRows() {
    var listing =
        Listing.builder()
            .id("crud")
            .rowsSource(RestDataSource.builder().url("https://api/listing").build())
            .build();
    var kanban =
        Kanban.builder()
            .id("board")
            .columns(List.<KanbanColumn>of())
            .rowsSource(RestDataSource.builder().url("https://api/tasks").build())
            .build();
    var page =
        new SeededYamlPage(
            VerticalLayout.builder().content(List.of(listing, kanban)).build(), Map.of());

    var catalog = RestSourceCatalog.empty();
    assertThat(RestSourceResolver.resolve(page, "rows", "board", catalog).url())
        .isEqualTo("https://api/tasks");
    assertThat(RestSourceResolver.resolve(page, "rows", "crud", catalog).url())
        .isEqualTo("https://api/listing");
    // an id nobody declares keeps the old rule: the view's (first) rows
    assertThat(RestSourceResolver.resolve(page, "rows", "other", catalog).url())
        .isEqualTo("https://api/listing");
  }

  @Test
  void aCallsParametersJoinTheStateItInterpolatesWithButNotItsRoutingKeys() {
    var state =
        RestProxyCalls.callState(
            Map.of("title", "Varnish", "status", "backlog"),
            Map.of(
                "_sourceKind", "action",
                "_sourceId", "moveTask",
                "_cardId", "9",
                "_toColumnId", "done",
                "status", "review"));
    assertThat(state)
        .containsEntry("title", "Varnish")
        .containsEntry("_cardId", "9")
        .containsEntry("_toColumnId", "done")
        // the parameter (the moved card's row) wins over the page's own state
        .containsEntry("status", "review")
        .doesNotContainKeys("_sourceKind", "_sourceId");
  }
}
