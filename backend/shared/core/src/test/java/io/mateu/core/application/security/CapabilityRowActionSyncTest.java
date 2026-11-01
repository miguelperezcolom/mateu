package io.mateu.core.application.security;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.ColumnAction;
import io.mateu.uidl.data.ColumnActionGroup;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.Page;
import io.mateu.uidl.data.SearchRequest;
import io.mateu.uidl.interfaces.Deletable;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Listing;
import io.mateu.uidl.interfaces.Navigable;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * Strict action mode (M-S1) on a capability listing: a button column's {@code ColumnAction} names
 * the listing's method, so the row action runs (e2e row-click-opens-record).
 */
class CapabilityRowActionSyncTest {

  @UI("/cap-row-open")
  public static class People
      implements Listing<People.Row>, Navigable<People.Row, String>, Deletable<String> {
    public record Row(String id, String name, ColumnActionGroup actions) {}

    static final List<Row> ROWS =
        List.of(
            new Row(
                "R-001",
                "Ada",
                new ColumnActionGroup(
                    new ColumnAction[] {new ColumnAction("approve", "Approve")})));

    @Override
    public ListingData<Row> search(SearchRequest request, HttpRequest httpRequest) {
      return new ListingData<>(new Page<>("", ROWS.size(), 0, ROWS.size(), ROWS));
    }

    @Override
    public Row view(String id, HttpRequest httpRequest) {
      return ROWS.get(0);
    }

    @Override
    public void deleteAllById(List<String> ids, HttpRequest httpRequest) {}

    public Message approve(Row row) {
      return new Message("Approved " + row.name());
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(People.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static io.mateu.dtos.UIIncrementDto run(String actionId, Map<String, Object> params) {
    return mateu.run(
        RunActionRqDto.builder()
            .route("/")
            .consumedRoute("")
            .serverSideType(People.class.getName())
            .actionId(actionId)
            .componentState(Map.of())
            .parameters(params)
            .initiatorComponentId("c1")
            .build());
  }

  /**
   * The row action is advertised by the rows the listing SERVED (their ColumnAction), not by a
   * string literal of the class: before a search has handed it out, a crafted call is refused.
   */
  @Test
  void aRowActionNoServedRowOfferedIsRefused() {
    io.mateu.core.domain.out.fragmentmapper.mappers.IssuedActionsTestHook.forget();
    org.assertj.core.api.Assertions.assertThatThrownBy(
            () ->
                run(
                    "action-on-row-approve",
                    Map.of("_clickedRow", Map.of("id", "R-001", "name", "Ada"))))
        .satisfies(
            e ->
                assertThat(io.mateu.core.application.security.MateuForbiddenException.find(e))
                    .isNotNull());
  }

  @Test
  void theColumnsActionRunsOnTheClickedRow() {
    // the listing serves its rows first — that is what hands the row action to the client
    run("search", Map.of());
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("/")
                .consumedRoute("")
                .serverSideType(People.class.getName())
                .actionId("action-on-row-approve")
                .componentState(Map.of())
                .parameters(Map.of("_clickedRow", Map.of("id", "R-001", "name", "Ada")))
                .initiatorComponentId("c1")
                .build());
    assertThat(increment.messages()).extracting(m -> m.text()).contains("Approved Ada");
  }
}
