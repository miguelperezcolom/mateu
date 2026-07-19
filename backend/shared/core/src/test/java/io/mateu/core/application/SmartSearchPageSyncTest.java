package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.infra.declarative.orchestrators.smartsearch.SmartSearchPage;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.CrudlDto;
import io.mateu.dtos.FormFieldDto;
import io.mateu.dtos.OnLoadTriggerDto;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.dtos.TextDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.dtos.VerticalLayoutDto;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.DateRange;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.interfaces.HttpRequest;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * In-JVM sync of the {@link SmartSearchPage} archetype (the Oracle Redwood "Smart Search" page
 * template): the page composes the optional subtitle line over the smart-search listing, the typed
 * filter facets ride on the search bar, the page starts EMPTY (no OnLoad→search preload trigger,
 * unlike an entity crud) and the search action returns the filtered rows.
 */
class SmartSearchPageSyncTest {

  // ---------------------------------------------------------------- fixtures

  public enum Channel {
    WEB,
    PHONE,
    AGENCY
  }

  public record AssetRow(String id, String name, String zone, LocalDate acquired) {}

  @SuppressWarnings("unused")
  public static class AssetFilters {
    String name;
    Set<Channel> channels;
    DateRange acquired;
  }

  private static final List<AssetRow> ASSETS =
      List.of(
          new AssetRow("a1", "Forklift", "Warehouse", LocalDate.of(2026, 1, 10)),
          new AssetRow("a2", "Printer", "Office", LocalDate.of(2026, 2, 10)),
          new AssetRow("a3", "Van", "Fleet", LocalDate.of(2026, 3, 10)));

  @SuppressWarnings("unused")
  @UI("/asset-search")
  @Title("Asset search")
  public static class AssetSearch extends SmartSearchPage<AssetFilters, AssetRow> {

    static volatile AssetFilters lastFilters;

    @Override
    protected String pageSubtitle() {
      return "Find assets by name, channel or acquisition date";
    }

    @Override
    public ListingData<AssetRow> search(
        String searchText, AssetFilters filters, Pageable pageable, HttpRequest httpRequest) {
      lastFilters = filters;
      var rows =
          ASSETS.stream()
              .filter(row -> filters.acquired == null || filters.acquired.contains(row.acquired()))
              .filter(
                  row ->
                      filters.channels == null
                          || filters.channels.isEmpty()
                          || filters.channels.contains(Channel.WEB) && "a1".equals(row.id()))
              .toList();
      return ListingData.from(rows);
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(AssetSearch.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  // ---------------------------------------------------------------- initial page load

  private static UIIncrementDto pageLoad() {
    return mateu.run(
        RunActionRqDto.builder()
            .route("/asset-search")
            .consumedRoute("/asset-search")
            .serverSideType(AssetSearch.class.getName())
            .actionId("")
            .initiatorComponentId("as_app")
            .build());
  }

  private static CrudlDto listing() {
    var crudls = new ArrayList<CrudlDto>();
    FieldKindsSyncTest.walk(pageLoad().fragments().get(0).component(), CrudlDto.class, crudls);
    assertThat(crudls).isNotEmpty();
    return crudls.get(0);
  }

  private static FormFieldDto filterOf(String fieldId) {
    return listing().filters().stream()
        .filter(field -> fieldId.equals(field.fieldId()))
        .findFirst()
        .orElseThrow();
  }

  @Test
  void pageComposesTheSubtitleAboveTheSmartSearchListing() {
    var increment = pageLoad();
    var texts = new ArrayList<TextDto>();
    FieldKindsSyncTest.walk(increment.fragments().get(0).component(), TextDto.class, texts);
    assertThat(texts.stream().map(TextDto::text))
        .contains("Find assets by name, channel or acquisition date");
    // both the subtitle and the listing ride inside the same stretched vertical layout
    var layouts = new ArrayList<VerticalLayoutDto>();
    FieldKindsSyncTest.walk(
        increment.fragments().get(0).component(), VerticalLayoutDto.class, layouts);
    assertThat(layouts).isNotEmpty();
    assertThat(listing()).isNotNull();
  }

  @Test
  void typedFilterFacetsRideOnTheSearchBar() {
    var channels = filterOf("channels");
    assertThat(channels.stereotype()).isEqualTo("multiSelect");
    assertThat(channels.options())
        .extracting(io.mateu.dtos.OptionDto::value)
        .containsExactly("WEB", "PHONE", "AGENCY");
    assertThat(filterOf("acquired").stereotype()).isEqualTo("dateRange");
    assertThat(filterOf("name").stereotype()).isNotIn("dateRange", "numberRange", "multiSelect");
  }

  @Test
  void startsEmptyWithoutTheCrudPreloadTrigger() {
    var increment = pageLoad();
    ServerSideComponentDto server = null;
    for (var fragment : increment.fragments()) {
      if (fragment.component() instanceof ServerSideComponentDto candidate) {
        server = candidate;
        break;
      }
    }
    assertThat(server).isNotNull();
    assertThat(server.triggers())
        .noneMatch(
            trigger ->
                trigger instanceof OnLoadTriggerDto onLoad && "search".equals(onLoad.actionId()));
  }

  // ---------------------------------------------------------------- the search action

  private List<?> search(Map<String, Object> state) {
    var fullState = new HashMap<String, Object>();
    fullState.put("page", 0);
    fullState.put("size", 10);
    fullState.put("searchText", "");
    fullState.putAll(state);
    var increment =
        mateu.run(
            RunActionRqDto.builder()
                .route("/asset-search")
                .consumedRoute("/asset-search")
                .serverSideType(AssetSearch.class.getName())
                .actionId("search")
                .initiatorComponentId("as_app")
                .componentState(fullState)
                .build());
    for (var fragment : increment.fragments()) {
      if (fragment.data() instanceof Map<?, ?> data
          && data.get("crud") instanceof ListingData<?> listing) {
        return listing.page().content();
      }
    }
    throw new AssertionError("no listing data in the search response");
  }

  @Test
  void searchAssemblesTheTypedFiltersAndReturnsTheFilteredRows() {
    var rows = search(Map.of("acquired_from", "2026-01-15", "acquired_to", "2026-02-20"));
    assertThat(AssetSearch.lastFilters.acquired)
        .isEqualTo(new DateRange(LocalDate.of(2026, 1, 15), LocalDate.of(2026, 2, 20)));
    assertThat(rows).hasSize(1);

    search(Map.of("channels", List.of("PHONE", "AGENCY")));
    assertThat(AssetSearch.lastFilters.channels)
        .containsExactlyInAnyOrder(Channel.PHONE, Channel.AGENCY);
  }
}
