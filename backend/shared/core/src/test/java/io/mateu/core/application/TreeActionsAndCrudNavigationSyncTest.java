package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Searchable;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * Fluent-tree button lambdas (ComponentTreeActionRunner), the searchable selector dialog
 * (codesearch-), listing toolbar methods, crud row-methods (action-on-row-), and the crud
 * navigation actions view/edit/new/cancel-view that pre-adjust the route (CrudNavigationAdjuster).
 */
class TreeActionsAndCrudNavigationSyncTest {

  // ── fluent tree with lambda buttons ─────────────────────────────────────────

  static String pressed;

  @SuppressWarnings("unused")
  @UI("/panel")
  public static class PanelPage implements ComponentTreeSupplier {
    @Override
    public Component component(HttpRequest httpRequest) {
      return VerticalLayout.builder()
          .content(
              List.of(
                  new Text("hello"),
                  Button.builder()
                      .label("Ping")
                      .actionId("ping")
                      .runnable(() -> pressed = "pinged")
                      .build(),
                  Button.builder()
                      .label("Compute")
                      .actionId("compute")
                      .callable(() -> new Text("computed!"))
                      .build()))
          .build();
    }
  }

  // ── searchable with a selector listing ──────────────────────────────────────

  public static class CitySelector extends MixedComponentsSyncTest.CitiesListing
      implements io.mateu.uidl.interfaces.Selector<String> {
    private String fieldId;

    @Override
    public io.mateu.uidl.interfaces.SelectedItem<String> selected(HttpRequest httpRequest) {
      return new io.mateu.uidl.interfaces.SelectedItem<>("Palma", "Palma");
    }

    @Override
    public String fieldId() {
      return fieldId;
    }

    @Override
    public io.mateu.uidl.interfaces.Selector withFieldId(String name) {
      this.fieldId = name;
      return this;
    }
  }

  @SuppressWarnings("unused")
  @UI("/trip")
  public static class TripForm {
    @Searchable(selector = CitySelector.class)
    String city;
  }

  // ── listing with toolbar + row methods lives in CrudSyncTest fixtures ───────

  static String toolbarRan;

  @SuppressWarnings("unused")
  @UI("/countries")
  public static class CountriesListing extends MixedComponentsSyncTest.CitiesListing {
    @Toolbar
    void refreshAll(HttpRequest httpRequest) {
      toolbarRan = "refreshed";
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu =
        TestMateu.withUis(
            PanelPage.class, TripForm.class, CountriesListing.class, CrudSyncTest.ItemsCrud.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @BeforeEach
  void resetItems() {
    CrudSyncTest.ITEMS.clear();
    CrudSyncTest.ITEMS.add(new CrudSyncTest.Item("1", "Hammer", 10, true));
    CrudSyncTest.ITEMS.add(new CrudSyncTest.Item("2", "Screwdriver", 25, true));
  }

  private UIIncrementDto run(
      String route,
      Class<?> type,
      String actionId,
      Map<String, Object> state,
      Map<String, Object> parameters) {
    return mateu.run(
        RunActionRqDto.builder()
            .route(route)
            .consumedRoute(route.startsWith("/items") ? "/items" : "_empty")
            .actionId(actionId)
            .serverSideType(type.getName())
            .componentState(state)
            .parameters(parameters)
            .initiatorComponentId("t1_app")
            .build());
  }

  // ── fluent button lambdas ───────────────────────────────────────────────────

  @Test
  void runnableButtonsExecuteTheirLambda() {
    pressed = null;
    run("/panel", PanelPage.class, "ping", Map.of(), Map.of());
    assertThat(pressed).isEqualTo("pinged");
  }

  @Test
  void callableButtonsReturnAComponent() {
    var increment = run("/panel", PanelPage.class, "compute", Map.of(), Map.of());
    assertThat(increment.fragments()).isNotEmpty();
  }

  // ── codesearch dialog ───────────────────────────────────────────────────────

  @Test
  void codesearchOpensTheSelectorDialog() {
    var increment = run("/trip", TripForm.class, "codesearch-city", Map.of(), Map.of());
    var dialog =
        FullSyncPipelineTest.findMetadata(
            increment.fragments().get(0).component(), io.mateu.dtos.DialogDto.class);
    assertThat(dialog).isNotNull();
  }

  // ── listing toolbar methods ─────────────────────────────────────────────────

  @Test
  void listingToolbarMethodsRun() {
    toolbarRan = null;
    run("/countries", CountriesListing.class, "refreshAll", Map.of(), Map.of());
    assertThat(toolbarRan).isEqualTo("refreshed");
  }

  // ── crud navigation actions (CrudNavigationAdjuster) ────────────────────────

  @Test
  void viewActionRoutesToTheRowDetail() {
    var increment =
        run(
            "/items",
            CrudSyncTest.ItemsCrud.class,
            "view",
            Map.of("idFieldForRow", "id"),
            Map.of("id", "1"));
    assertThat(increment.fragments()).isNotEmpty();
    // the mediator re-points itself; the entity view loads on the follow-up request
    var state = stateOf(increment);
    assertThat(state).containsEntry("_route", "/1");
  }

  @Test
  void editActionRoutesToTheRowEditor() {
    var increment =
        run(
            "/items",
            CrudSyncTest.ItemsCrud.class,
            "edit",
            Map.of("idFieldForRow", "id", "id", "2"),
            Map.of());
    assertThat(increment.fragments()).isNotEmpty();
    var state = stateOf(increment);
    assertThat(String.valueOf(state.get("_route"))).isEqualTo("/2/edit");
  }

  @Test
  void newActionRoutesToTheCreationForm() {
    var increment =
        run("/items", CrudSyncTest.ItemsCrud.class, "new", Map.of("idFieldForRow", "id"), Map.of());
    assertThat(increment.fragments()).isNotEmpty();
  }

  // ── helpers ─────────────────────────────────────────────────────────────────

  @SuppressWarnings("unchecked")
  private static Map<String, Object> stateOf(UIIncrementDto increment) {
    for (var fragment : increment.fragments()) {
      if (fragment.state() instanceof Map<?, ?> state && !state.isEmpty()) {
        return (Map<String, Object>) state;
      }
    }
    return Map.of();
  }
}
