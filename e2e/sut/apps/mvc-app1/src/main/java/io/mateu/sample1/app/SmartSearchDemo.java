package io.mateu.sample1.app;

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
 * Doc-example fixture for the Smart Search page template (ux-patterns/smart-search): a
 * search-first, read-only search page with typed facets. The OnLoad trigger preloads the results
 * so the documentation screenshot shows the full anatomy (search bar + facets + results).
 */
@UI("/smart-search-demo")
@Title("Smart Search")
@Trigger(type = TriggerType.OnLoad, actionId = "search")
public class SmartSearchDemo extends SmartSearchPage<SmartSearchDemo.AssetFilters, SmartSearchDemo.AssetRow> {

  public enum Zone {
    Warehouse,
    Office,
    Fleet
  }

  public record AssetRow(String id, String name, Zone zone, LocalDate acquired, int units) {}

  public static class AssetFilters {
    String name;
    Set<Zone> zones;
    DateRange acquired;
  }

  private static final List<AssetRow> ASSETS =
      List.of(
          new AssetRow("a1", "Forklift", Zone.Warehouse, LocalDate.of(2026, 1, 10), 3),
          new AssetRow("a2", "Pallet jack", Zone.Warehouse, LocalDate.of(2026, 1, 22), 12),
          new AssetRow("a3", "Printer", Zone.Office, LocalDate.of(2026, 2, 10), 5),
          new AssetRow("a4", "Projector", Zone.Office, LocalDate.of(2026, 2, 18), 2),
          new AssetRow("a5", "Van", Zone.Fleet, LocalDate.of(2026, 3, 10), 4),
          new AssetRow("a6", "Truck", Zone.Fleet, LocalDate.of(2026, 3, 21), 2));

  @Override
  protected String pageSubtitle() {
    return "Find assets by name, zone or acquisition date";
  }

  @Override
  public ListingData<AssetRow> search(
      String searchText, AssetFilters filters, Pageable pageable, HttpRequest httpRequest) {
    var text = searchText == null ? "" : searchText.toLowerCase();
    var rows =
        ASSETS.stream()
            .filter(
                row ->
                    text.isEmpty()
                        || row.name().toLowerCase().contains(text)
                        || row.id().toLowerCase().contains(text))
            .filter(row -> filters.name == null || row.name().toLowerCase().contains(filters.name.toLowerCase()))
            .filter(
                row ->
                    filters.zones == null
                        || filters.zones.isEmpty()
                        || filters.zones.contains(row.zone()))
            .filter(
                row -> filters.acquired == null || filters.acquired.contains(row.acquired()))
            .toList();
    return ListingData.from(rows);
  }
}
