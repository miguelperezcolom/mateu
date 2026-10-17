package io.mateu.core.application.runaction;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.declarative.orchestrators.crud.Crud;
import io.mateu.core.testutil.FakeHttpRequest;
import io.mateu.dtos.RunActionRqDto;
import java.util.Map;
import org.junit.jupiter.api.Test;

/**
 * The route a CRUD navigation action lands on: a row's view ({@code /orders/5}), its editor ({@code
 * /orders/5/edit}), the creation form ({@code /orders/new}) and back to the listing — each computed
 * from where the user is, so a "new" pressed while editing record 5 does not end up under it
 * ({@code /orders/5/edit/new}).
 */
class CrudNavigationAdjusterTest {

  private final CrudNavigationAdjuster adjuster = new CrudNavigationAdjuster();

  private static RunActionCommand command(
      String serverSideType,
      String route,
      String actionId,
      Map<String, Object> state,
      Map<String, Object> parameters) {
    var rq =
        RunActionRqDto.builder()
            .route(route)
            .actionId(actionId)
            .componentState(state)
            .parameters(parameters)
            .build();
    return new RunActionCommand(
        "",
        null,
        route,
        "",
        actionId,
        state,
        Map.of(),
        null,
        new FakeHttpRequest(rq),
        serverSideType,
        null);
  }

  private static final String CRUD = Crud.class.getName();

  @Test
  void aCommandForSomethingThatIsNotACrudIsLeftAlone() {
    var plain = command(String.class.getName(), "/orders", "new", Map.of(), Map.of());
    assertThat(adjuster.adjust(plain).command()).isSameAs(plain);
    assertThat(adjuster.adjust(plain).routeFirst()).isFalse();
    var untyped = command(null, "/orders", "new", Map.of(), Map.of());
    assertThat(adjuster.adjust(untyped).command().route()).isEqualTo("/orders");
  }

  @Test
  void viewingARowOpensTheRecordRouteAndUpdatesTheUrl() {
    var cmd = command(CRUD, "/orders", "view", Map.of("idFieldForRow", "id"), Map.of("id", "5"));
    var adjusted = adjuster.adjust(cmd);
    assertThat(adjusted.routeFirst()).isTrue();
    assertThat(adjusted.command().route()).isEqualTo("/orders/5");
    assertThat(cmd.httpRequest().getAttribute("oldRoute")).isEqualTo("/orders");
    assertThat(cmd.httpRequest().getAttribute("updateUrl")).isEqualTo("/orders/5");
  }

  @Test
  void viewingWithoutTheRowsIdIsNotANavigation() {
    var cmd = command(CRUD, "/orders", "view", Map.of("idFieldForRow", "id"), Map.of());
    var adjusted = adjuster.adjust(cmd);
    assertThat(adjusted.routeFirst()).isFalse();
    assertThat(adjusted.command().route()).isEqualTo("/orders");
  }

  @Test
  void editingFromTheRecordViewDoesNotRepeatTheId() {
    var state = Map.<String, Object>of("idFieldForRow", "id", "id", "5");
    var adjusted = adjuster.adjust(command(CRUD, "/orders/5", "edit", state, Map.of()));
    assertThat(adjusted.routeFirst()).isTrue();
    assertThat(adjusted.command().route()).isEqualTo("/orders/5/edit");
    var fromListing = adjuster.adjust(command(CRUD, "/orders", "edit", state, Map.of()));
    assertThat(fromListing.command().route()).isEqualTo("/orders/5/edit");
  }

  @Test
  void newFromAnEditorGoesBackUpToTheListingsCreationForm() {
    var state = Map.<String, Object>of("idFieldForRow", "id", "id", "5");
    var cmd = command(CRUD, "/orders/5/edit", "new", state, Map.of());
    var adjusted = adjuster.adjust(cmd);
    assertThat(adjusted.routeFirst()).isTrue();
    assertThat(adjusted.command().route()).isEqualTo("/orders/new");
    assertThat(cmd.httpRequest().getAttribute("resolvedPath")).isEqualTo("/orders/new");
    assertThat(cmd.httpRequest().getAttribute("oldRoute")).isEqualTo("/orders");
    var fromListing = adjuster.adjust(command(CRUD, "/orders", "new", Map.of(), Map.of()));
    assertThat(fromListing.command().route()).isEqualTo("/orders/new");
  }

  @Test
  void cancellingAViewOrAnEditorReturnsToTheListing() {
    var state = Map.<String, Object>of("idFieldForRow", "id", "id", "5");
    assertThat(adjuster.adjust(command(CRUD, "/orders/5/edit", "cancel-view", state, Map.of())))
        .satisfies(
            adjusted -> {
              assertThat(adjusted.command().route()).isEqualTo("/orders");
              assertThat(adjusted.routeFirst()).isFalse();
            });
    assertThat(
            adjuster
                .adjust(command(CRUD, "/orders/5", "cancel-view", state, Map.of()))
                .command()
                .route())
        .isEqualTo("/orders");
    assertThat(
            adjuster
                .adjust(command(CRUD, "/orders", "cancel-view", Map.of(), Map.of()))
                .command()
                .route())
        .isEqualTo("/orders");
  }
}
