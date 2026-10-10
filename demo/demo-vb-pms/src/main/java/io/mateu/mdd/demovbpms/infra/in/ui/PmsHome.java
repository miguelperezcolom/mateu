package io.mateu.mdd.demovbpms.infra.in.ui;

import io.mateu.mdd.demovbpms.infra.in.ui.bookings.BookingsMenu;
import io.mateu.mdd.demovbpms.infra.in.ui.financials.FinancialsMenu;
import io.mateu.mdd.demovbpms.infra.in.ui.frontdesk.FrontDeskMenu;
import io.mateu.mdd.demovbpms.infra.in.ui.inventory.InventoryMenu;
import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.fluent.AppVariant;

/**
 * The PMS shell, laid out like OPERA Cloud: the hamburger holds the sections (Bookings, Front
 * Desk, Inventory, Financials…) and the band under the header the screens of the section on
 * screen (OPERA Cloud 26.3 user guide, 001 "Application Navigation").
 */
@UI("")
@Title("OPERA PMS · demo")
@App(value = AppVariant.HAMBURGER_SECTIONS, accessKeys = true)
public class PmsHome implements io.mateu.uidl.interfaces.NotificationsSupplier {

  /** The front desk's inbox (in memory, like the rest of the demo): the ids already read. */
  static final java.util.Set<String> READ = java.util.concurrent.ConcurrentHashMap.newKeySet();

  @Override
  public java.util.List<io.mateu.uidl.data.AppNotification> notifications(
      io.mateu.uidl.interfaces.HttpRequest httpRequest) {
    return java.util.List.of(
            new io.mateu.uidl.data.AppNotification(
                "vip", "VIP arriving today", "Pierre Brown · room 106 · amenities requested",
                "/bookings/reservation", !READ.contains("vip"), "08:12"),
            new io.mateu.uidl.data.AppNotification(
                "ooo", "Room 307 out of order", "Leak reported by housekeeping",
                "/inventory/floorPlan", !READ.contains("ooo"), "09:40"),
            new io.mateu.uidl.data.AppNotification(
                "folio", "Folio over credit limit", "Room 205 · balance 1,240 €",
                "/financials/billing", !READ.contains("folio"), "10:05"),
            new io.mateu.uidl.data.AppNotification(
                "eod", "End of day", "Night audit completed for the previous business date",
                "/home/dashboard", false, "Yesterday"))
        .stream()
        .toList();
  }

  @Override
  public void markNotificationsRead(
      java.util.List<String> ids, io.mateu.uidl.interfaces.HttpRequest httpRequest) {
    READ.addAll(ids);
  }


  @Menu io.mateu.mdd.demovbpms.infra.in.ui.home.HomeMenu home;

  @Menu BookingsMenu bookings;

  @Menu FrontDeskMenu frontDesk;

  @Menu InventoryMenu inventory;

  @Menu FinancialsMenu financials;
}
