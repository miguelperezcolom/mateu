package io.mateu.mdd.redwoodshowcase.ui.smartsearch;

import io.mateu.core.infra.declarative.orchestrators.smartsearch.SmartSearchPage;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Trigger;
import io.mateu.uidl.annotations.TriggerType;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.DateRange;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.interfaces.HttpRequest;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;

/**
 * Demo of the {@link SmartSearchPage} archetype: the Oracle Redwood "Smart Search" template — a
 * search-first page with an intro line under the title, typed filter facets (text, multi-select,
 * date range) on the search bar and the results collection below. The archetype starts empty
 * until you search; this demo preloads the results (OnLoad trigger) so the template's anatomy is
 * visible on first load.
 */
@UI("/smart-search-demo")
@Title("Smart Search")
@Trigger(type = TriggerType.OnLoad, actionId = "search")
public class AssetSearch extends SmartSearchPage<AssetSearch.AssetFilters, AssetSearch.AssetRow> {

  public enum Zone {
    WAREHOUSE,
    OFFICE,
    FLEET,
    DATACENTER
  }

  @SuppressWarnings("unused")
  public static class AssetFilters {
    String name;
    Set<Zone> zones;
    DateRange acquired;
  }

  public record AssetRow(String id, String name, Zone zone, LocalDate acquired, int units) {}

  private static final List<AssetRow> ASSETS =
      List.of(
          new AssetRow("A-001", "Forklift", Zone.WAREHOUSE, LocalDate.of(2026, 1, 10), 3),
          new AssetRow("A-002", "Printer", Zone.OFFICE, LocalDate.of(2026, 2, 14), 12),
          new AssetRow("A-003", "Delivery van", Zone.FLEET, LocalDate.of(2026, 3, 2), 5),
          new AssetRow("A-004", "Server rack", Zone.DATACENTER, LocalDate.of(2025, 11, 20), 8),
          new AssetRow("A-005", "Pallet jack", Zone.WAREHOUSE, LocalDate.of(2025, 9, 5), 20),
          new AssetRow("A-006", "Laptop", Zone.OFFICE, LocalDate.of(2026, 4, 1), 45),
          new AssetRow("A-007", "Generator", Zone.DATACENTER, LocalDate.of(2025, 6, 30), 2),
          new AssetRow("A-008", "Conveyor belt", Zone.WAREHOUSE, LocalDate.of(2026, 5, 18), 1),
          new AssetRow("A-009", "Company car", Zone.FLEET, LocalDate.of(2025, 12, 12), 14),
          new AssetRow("A-010", "UPS unit", Zone.DATACENTER, LocalDate.of(2026, 6, 25), 6));

  @Override
  protected String pageSubtitle() {
    return "Find assets by name, zone or acquisition date";
  }

  @Override
  public ListingData<AssetRow> search(
      String searchText, AssetFilters filters, Pageable pageable, HttpRequest httpRequest) {
    var found =
        ASSETS.stream()
            .filter(
                asset ->
                    searchText == null
                        || searchText.isBlank()
                        || (asset.name() + " " + asset.id() + " " + asset.zone())
                            .toLowerCase()
                            .contains(searchText.toLowerCase()))
            .filter(
                asset ->
                    filters == null
                        || filters.name == null
                        || filters.name.isBlank()
                        || asset.name().toLowerCase().contains(filters.name.toLowerCase()))
            .filter(
                asset ->
                    filters == null
                        || filters.zones == null
                        || filters.zones.isEmpty()
                        || filters.zones.contains(asset.zone()))
            .filter(
                asset ->
                    filters == null
                        || filters.acquired == null
                        || filters.acquired.isEmpty()
                        || filters.acquired.contains(asset.acquired()))
            .toList();
    return ListingData.from(found);
  }
}
