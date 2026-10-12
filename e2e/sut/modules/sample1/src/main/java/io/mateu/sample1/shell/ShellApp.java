package io.mateu.sample1.shell;

import io.mateu.sample1.Section1;
import io.mateu.sample1.Section2;
import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.AppContext;
import io.mateu.uidl.annotations.EyesOnly;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.AppHeaderAction;
import io.mateu.uidl.data.AppNotification;
import io.mateu.uidl.data.GlobalSearchResult;
import io.mateu.uidl.data.MenuDisplay;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.RouteLink;
import io.mateu.uidl.data.Rule;
import io.mateu.uidl.data.RuleAction;
import io.mateu.uidl.fluent.AppVariant;
import io.mateu.uidl.interfaces.AppActionsSupplier;
import io.mateu.uidl.interfaces.GlobalSearchSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.NotificationsSupplier;
import java.util.List;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * The app-shell walkthrough fixture (backs shell-header.spec.ts / shell-menu.spec.ts): every
 * header feature a {@code @UI} app class can declare — two {@code @AppContext} pickers (a small
 * enum and a searchable supplier with more than 7 options), header actions (a button and a
 * dropdown), a notification inbox, the ⌘K global search, the theme toggle and access keys — and
 * every kind of menu entry: a page, a nested group, a card group, an {@code @EyesOnly} entry an
 * anonymous visitor must not see and a rule leaf that runs an action instead of navigating.
 */
@UI("/shell")
@Title("Shell walk")
@App(value = AppVariant.MENU_ON_TOP, themeToggle = true, accessKeys = true)
public class ShellApp implements AppActionsSupplier, NotificationsSupplier, GlobalSearchSupplier {

  public enum Region {
    North,
    South
  }

  /** Which notifications were marked as read (shared across requests). */
  static final Set<String> READ = ConcurrentHashMap.newKeySet();

  @AppContext(label = "Region")
  Region region;

  @AppContext(label = "Hotel")
  ShellHotelPicker hotel;

  @Menu ShellProbe probe;

  @Menu Section1 page;

  @Menu ShellReports reports;

  @Menu RouteLink pending = new RouteLink("/shell/orders/pending", "Pending orders");

  @Menu(display = MenuDisplay.cards)
  ShellQuickAccess quick;

  @EyesOnly(roles = "admin")
  @Menu
  Section2 secret;

  @Menu Rule ping = Rule.builder().action(RuleAction.RunAction).actionId("ping").build();

  public Message ping() {
    return new Message("pong");
  }

  @Override
  public List<AppHeaderAction> appActions(HttpRequest httpRequest) {
    return List.of(
        new AppHeaderAction("syncNow", "Sync", "vaadin:refresh"),
        AppHeaderAction.menu(
            "Export",
            "vaadin:download",
            List.of(
                new AppHeaderAction("exportPdf", "As PDF"),
                new AppHeaderAction("exportExcel", "As Excel"))));
  }

  public Message syncNow(HttpRequest httpRequest) {
    return new Message("synced " + httpRequest.appContext("region"));
  }

  public Message exportPdf() {
    return new Message("exported pdf");
  }

  public Message exportExcel() {
    return new Message("exported excel");
  }

  @Override
  public List<AppNotification> notifications(HttpRequest httpRequest) {
    return List.of(
        new AppNotification(
            "n1",
            "Booking confirmed",
            "Booking 42 is confirmed",
            "/shell/probe",
            !READ.contains("n1"),
            null),
        new AppNotification(
            "n2", "Payment failed", "Card declined", "/shell/page", !READ.contains("n2"), null));
  }

  @Override
  public void markNotificationsRead(List<String> ids, HttpRequest httpRequest) {
    if (ids.contains("all")) {
      READ.addAll(List.of("n1", "n2"));
    } else {
      READ.addAll(ids);
    }
  }

  @Override
  public List<GlobalSearchResult> globalSearch(String searchText, HttpRequest httpRequest) {
    var text = searchText == null ? "" : searchText.toLowerCase();
    return List.of(
            new GlobalSearchResult("Ada Lovelace", "Customer 1", "/shell/probe", "Customers"),
            new GlobalSearchResult("Grace Hopper", "Customer 2", "/shell/page", "Customers"))
        .stream()
        .filter(r -> (r.label() + " " + r.description()).toLowerCase().contains(text))
        .toList();
  }
}
