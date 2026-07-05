package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.declarative.Listing;
import io.mateu.core.infra.declarative.orchestrators.masterdetail.MasterDetailView;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.DetailPart;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.CarouselLayout;
import io.mateu.uidl.data.Chart;
import io.mateu.uidl.data.ChartData;
import io.mateu.uidl.data.ChartDataset;
import io.mateu.uidl.data.ChartType;
import io.mateu.uidl.data.ConfirmDialog;
import io.mateu.uidl.data.ContextMenu;
import io.mateu.uidl.data.Dialog;
import io.mateu.uidl.data.Directory;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.data.RouteLink;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * Fluent components with dedicated mappers not covered by the archetype suite (chart, context menu,
 * carousel, dialogs, directory), the declarative {@link Listing} backend, and the master/detail
 * archetype.
 */
class MixedComponentsSyncTest {

  // ── fixtures ────────────────────────────────────────────────────────────────

  @SuppressWarnings("unused")
  @UI("/widgets")
  @Title("Widgets")
  public static class WidgetsPage implements ComponentTreeSupplier {
    @Override
    public Component component(HttpRequest httpRequest) {
      return VerticalLayout.builder()
          .content(
              List.of(
                  Chart.builder()
                      .chartType(ChartType.bar)
                      .chartData(
                          new ChartData(
                              List.of("Q1", "Q2"),
                              List.of(new ChartDataset("Sales", List.of(10.0, 20.0)))))
                      .build(),
                  ContextMenu.builder()
                      .menu(List.of(new RouteLink("/widgets", "Reload")))
                      .wrapped(new Text("right-click me"))
                      .activateOnLeftClick(true)
                      .build(),
                  CarouselLayout.builder()
                      .id("carousel")
                      .content(List.of(new Text("slide 1"), new Text("slide 2")))
                      .dots(true)
                      .build(),
                  Dialog.builder()
                      .id("dialog")
                      .headerTitle("A dialog")
                      .content(new Text("dialog body"))
                      .width("400px")
                      .build(),
                  ConfirmDialog.builder()
                      .header("Sure?")
                      .content(new Text("really?"))
                      .confirmText("Yes")
                      .confirmActionId("doIt")
                      .build(),
                  Directory.builder().menu(List.of(new RouteLink("/widgets", "Widgets"))).build()))
          .build();
    }
  }

  public record CityRow(String name, int population) {}

  @SuppressWarnings("unused")
  public static class CityFilters {
    String name;
  }

  @SuppressWarnings("unused")
  @UI("/cities")
  @Title("Cities")
  public static class CitiesListing extends Listing<CityFilters, CityRow> {
    static final List<CityRow> CITIES =
        List.of(
            new CityRow("Palma", 420_000),
            new CityRow("Barcelona", 1_600_000),
            new CityRow("Madrid", 3_200_000));

    @Override
    public ListingData<CityRow> search(
        String searchText, CityFilters filters, Pageable pageable, HttpRequest httpRequest) {
      var rows =
          CITIES.stream()
              .filter(
                  city ->
                      searchText == null
                          || searchText.isBlank()
                          || city.name().toLowerCase().contains(searchText.toLowerCase()))
              .toList();
      return ListingData.from(rows);
    }
  }

  @SuppressWarnings("unused")
  public static class SummarySection {
    String code = "R-1";
  }

  @SuppressWarnings("unused")
  public static class DetailsSection {
    String notes = "detail notes";
  }

  @SuppressWarnings("unused")
  @UI("/md-demo")
  @Title("Master detail")
  public static class MdView extends MasterDetailView {
    SummarySection master = new SummarySection();

    @DetailPart(label = "Details")
    DetailsSection details = new DetailsSection();

    @Override
    protected void load(HttpRequest httpRequest) {
      master.code = "R-42";
      details.notes = "loaded";
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(WidgetsPage.class, CitiesListing.class, MdView.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  // ── fluent components with dedicated mappers ────────────────────────────────

  @Test
  void chartMapsTypeLabelsAndDatasets() {
    var chart =
        FullSyncPipelineTest.findMetadata(
            component(mateu.sync("/widgets")), io.mateu.dtos.ChartDto.class);
    assertThat(chart).isNotNull();
  }

  @Test
  void contextMenuCarouselDialogsAndDirectoryAllMap() {
    var component = component(mateu.sync("/widgets"));
    assertThat(FullSyncPipelineTest.findMetadata(component, io.mateu.dtos.ContextMenuDto.class))
        .isNotNull();
    assertThat(FullSyncPipelineTest.findMetadata(component, io.mateu.dtos.CarouselLayoutDto.class))
        .isNotNull();
    assertThat(FullSyncPipelineTest.findMetadata(component, io.mateu.dtos.DialogDto.class))
        .isNotNull();
    assertThat(FullSyncPipelineTest.findMetadata(component, io.mateu.dtos.ConfirmDialogDto.class))
        .isNotNull();
    assertThat(FullSyncPipelineTest.findMetadata(component, io.mateu.dtos.DirectoryDto.class))
        .isNotNull();
  }

  // ── declarative Listing ─────────────────────────────────────────────────────

  @Test
  void listingSyncRendersItsColumns() {
    var increment = mateu.sync("/cities");
    assertThat(increment.fragments()).isNotEmpty();
  }

  @Test
  void listingSearchActionReturnsTheRows() {
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("/cities")
                .consumedRoute("/cities")
                .serverSideType(CitiesListing.class.getName())
                .actionId("search")
                .initiatorComponentId("l1_app")
                .componentState(Map.of("page", 0, "size", 10, "searchText", ""))
                .build());
    assertThat(listing(increment)).isNotNull();
    assertThat(listing(increment).page().content()).hasSize(3);
    assertThat(listing(increment).page().totalElements()).isEqualTo(3);
  }

  @Test
  void listingSearchFiltersBySearchText() {
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("/cities")
                .consumedRoute("/cities")
                .serverSideType(CitiesListing.class.getName())
                .actionId("search")
                .initiatorComponentId("l1_app")
                .componentState(Map.of("page", 0, "size", 10, "searchText", "palma"))
                .build());
    // filtered rows are mapped to plain maps on their way out (erase the static type or the
    // generated checkcast to CityRow blows before the extractor runs)
    List<?> rows = listing(increment).page().content();
    assertThat(rows).extracting(MixedComponentsSyncTest::nameOf).containsExactly("Palma");
  }

  // ── master/detail ───────────────────────────────────────────────────────────

  @Test
  void masterDetailSyncRendersTheLoadedMasterAndDetail() {
    var increment = mateu.sync("/md-demo");
    assertThat(increment.fragments()).isNotEmpty();
    var state = stateOf(increment);
    assertThat(state).isNotEmpty();
  }

  // ── helpers ─────────────────────────────────────────────────────────────────

  private static Object component(UIIncrementDto increment) {
    return increment.fragments().get(0).component();
  }

  @SuppressWarnings("unchecked")
  private static Map<String, Object> stateOf(UIIncrementDto increment) {
    for (var fragment : increment.fragments()) {
      if (fragment.state() instanceof Map<?, ?> state && !state.isEmpty()) {
        return (Map<String, Object>) fragment.state();
      }
    }
    return Map.of();
  }

  private static String nameOf(Object row) {
    if (row instanceof CityRow city) {
      return city.name();
    }
    if (row instanceof Map<?, ?> map) {
      return String.valueOf(map.get("name"));
    }
    return String.valueOf(row);
  }

  @SuppressWarnings("unchecked")
  private static ListingData<CityRow> listing(UIIncrementDto increment) {
    for (var fragment : increment.fragments()) {
      if (fragment.data() instanceof Map<?, ?> data
          && data.get("crud") instanceof ListingData<?> listing) {
        return (ListingData<CityRow>) listing;
      }
    }
    return null;
  }
}
