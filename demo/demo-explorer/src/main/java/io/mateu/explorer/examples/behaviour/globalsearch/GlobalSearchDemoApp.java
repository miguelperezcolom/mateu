package io.mateu.explorer.examples.behaviour.globalsearch;

import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.GlobalSearchResult;
import io.mateu.uidl.interfaces.GlobalSearchSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import java.util.Locale;

/**
 * ⌘K / Ctrl+K opens the palette: it searches the menu AND, because the app implements {@link
 * GlobalSearchSupplier}, your records — grouped by category, a click jumps to the hit's route.
 */
@UI("/apps/global-search")
@Title("Global search demo")
@App
public class GlobalSearchDemoApp implements GlobalSearchSupplier {

  @Menu Customers customers;
  @Menu Orders orders;

  static final List<GlobalSearchResult> RECORDS =
      List.of(
          new GlobalSearchResult("Acme Corp", "Customer since 2019", "/customers", "Customers"),
          new GlobalSearchResult("Globex", "Customer since 2022", "/customers", "Customers"),
          new GlobalSearchResult("Order 1042", "Acme Corp — 3 items", "/orders", "Orders"),
          new GlobalSearchResult("Order 1043", "Globex — 1 item", "/orders", "Orders"));

  @Override
  public List<GlobalSearchResult> globalSearch(String searchText, HttpRequest httpRequest) {
    var text = searchText == null ? "" : searchText.toLowerCase(Locale.ROOT);
    return RECORDS.stream()
        .filter(
            r -> (r.label() + " " + r.description()).toLowerCase(Locale.ROOT).contains(text))
        .toList();
  }

  @Title("Customers")
  @ReadOnly
  public static class Customers {
    String hint = "Press Ctrl+K (⌘K on a Mac) and type 'acme' or 'order'.";
  }

  @Title("Orders")
  @ReadOnly
  public static class Orders {
    String hint = "You arrived here from the palette (or the menu).";
  }
}
