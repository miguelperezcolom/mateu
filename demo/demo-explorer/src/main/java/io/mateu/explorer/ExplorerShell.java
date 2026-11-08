package io.mateu.explorer;

import io.mateu.explorer.catalog.Entry;
import io.mateu.explorer.catalog.ExplorerCatalog;
import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.GlobalSearchResult;
import io.mateu.uidl.data.Menu;
import io.mateu.uidl.data.RouteLink;
import io.mateu.uidl.fluent.AppVariant;
import io.mateu.uidl.interfaces.Actionable;
import io.mateu.uidl.interfaces.GlobalSearchSupplier;
import io.mateu.uidl.interfaces.HomeRouteSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.MenuSupplier;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * The Explorer's app shell, mounted at the root. Its menu is DERIVED from the catalogue: one
 * section per area of {@code explorer/checklist.yaml}, one group per group, one leaf per entry file
 * — so adding an entry adds its menu leaf without touching this class. The ⌘K palette searches the
 * entries ({@link GlobalSearchSupplier}).
 */
@UI("")
@Title("Mateu Explorer")
@App(value = AppVariant.HAMBURGER_SECTIONS, themeToggle = true)
public class ExplorerShell implements MenuSupplier, GlobalSearchSupplier, HomeRouteSupplier {

  @Override
  public String homeRoute() {
    return "home";
  }

  @Override
  public List<Actionable> menu(HttpRequest httpRequest) {
    var catalog = ExplorerCatalog.get();
    var menu = new ArrayList<Actionable>();
    menu.add(new RouteLink("home", "Home"));
    for (var area : catalog.areas()) {
      var groups = new ArrayList<Actionable>();
      groups.add(new RouteLink("/" + AreaPage.routeOf(area.id()), "Overview"));
      for (var group : area.groups()) {
        var leaves = new ArrayList<Actionable>();
        for (var entry : catalog.entriesOf(area.id(), group.id())) {
          leaves.add(new RouteLink("/" + entry.route(), entry.title()));
        }
        if (!leaves.isEmpty()) {
          groups.add(new Menu("/" + group.key(), group.title(), leaves));
        }
      }
      menu.add(new Menu("/" + area.id(), area.title(), groups));
    }
    return menu;
  }

  @Override
  public List<GlobalSearchResult> globalSearch(String searchText, HttpRequest httpRequest) {
    var words = searchText == null ? new String[0] : searchText.toLowerCase(Locale.ROOT).split("\\s+");
    var catalog = ExplorerCatalog.get();
    var hits = new ArrayList<GlobalSearchResult>();
    for (Entry entry : catalog.entries()) {
      var haystack =
          (entry.title() + " " + String.join(" ", entry.covers()) + " " + nz(entry.description()))
              .toLowerCase(Locale.ROOT);
      boolean all = true;
      for (var w : words) {
        if (!w.isBlank() && !haystack.contains(w)) {
          all = false;
          break;
        }
      }
      if (all) {
        var area = catalog.area(entry.area()).map(ExplorerCatalog.Area::title).orElse(entry.area());
        hits.add(new GlobalSearchResult(entry.title(), String.join(", ", entry.covers()), entry.route(), area));
      }
      if (hits.size() >= 30) {
        break;
      }
    }
    return hits;
  }

  private static String nz(String s) {
    return s == null ? "" : s;
  }
}
