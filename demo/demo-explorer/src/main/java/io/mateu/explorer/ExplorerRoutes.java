package io.mateu.explorer;

import io.mateu.explorer.catalog.ExplorerCatalog;
import io.mateu.uidl.data.RouteEntry;
import io.mateu.uidl.interfaces.RouteEntrySupplier;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Component;

/**
 * Every Explorer route, authored in CODE from the catalogue — so an entry file is all an entry
 * needs; nobody edits a shared {@code routes.yaml}:
 *
 * <ul>
 *   <li>{@code /<area>/overview} — the area's index ({@link AreaPage}, the area pinned as a fixed param);
 *   <li>{@code /<area>/<group>/<entry>} — the entry page ({@link EntryPage}, the entry id pinned);
 *   <li>the entry's own {@code pages:} — full-page examples, bound exactly as declared.
 * </ul>
 */
@Component
public class ExplorerRoutes implements RouteEntrySupplier {

  @Override
  public List<RouteEntry> routes() {
    var catalog = ExplorerCatalog.get();
    var routes = new ArrayList<RouteEntry>();
    routes.add(RouteEntry.builder().route("home").viewModel(HomePage.class.getName()).build());
    for (var area : catalog.areas()) {
      routes.add(
          RouteEntry.builder()
              .route(AreaPage.routeOf(area.id()))
              .viewModel(AreaPage.class.getName())
              .fixedParams(Map.of("area", area.id()))
              .build());
    }
    for (var entry : catalog.entries()) {
      routes.add(
          RouteEntry.builder()
              .route(entry.route())
              .viewModel(EntryPage.class.getName())
              .fixedParams(Map.of("entry", entry.id()))
              .build());
      for (var page : entry.pages()) {
        routes.add(
            RouteEntry.builder()
                .route(page.route())
                .definition(page.layout())
                .viewModel(page.viewModel())
                .build());
      }
    }
    return routes;
  }
}
