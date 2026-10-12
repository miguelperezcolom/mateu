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
// E2 patterns: OPERA's function keys and quick-launch codes on every screen (F2 Reservations, F3
// Room Diary, F4 Merge profiles, F8 End of day; type RES/RD/MRG/EOD in the Ask palette), the
// business date as a LIVE header value (End of day publishes the new one to every session), and an
// idle warning after 30 minutes.
@App(
    value = AppVariant.HAMBURGER_SECTIONS,
    accessKeys = true,
    liveUpdates = true,
    idleTimeoutMinutes = 30,
    idleWarningSeconds = 60)
@io.mateu.uidl.annotations.AppShortcut(
    key = "f2", route = "/bookings/reservations", label = "Reservations", code = "RES")
@io.mateu.uidl.annotations.AppShortcut(
    key = "f3", route = "/bookings/roomDiary", label = "Room diary", code = "RD")
@io.mateu.uidl.annotations.AppShortcut(
    key = "f4", route = "/frontDesk/mergeProfiles", label = "Merge profiles", code = "MRG")
@io.mateu.uidl.annotations.AppShortcut(
    key = "f8", route = "/financials/endOfDay", label = "End of day", code = "EOD")
public class PmsHome
    implements io.mateu.uidl.interfaces.NotificationsSupplier,
        io.mateu.uidl.interfaces.HeaderValuesSupplier {

  /** The business date on the header; End of day publishes the next one to every session. */
  @Override
  public java.util.List<io.mateu.uidl.data.HeaderValue> headerValues(
      io.mateu.uidl.interfaces.HttpRequest httpRequest) {
    return java.util.List.of(
        new io.mateu.uidl.data.HeaderValue(
            "businessDate",
            "Business date",
            io.mateu.mdd.demovbpms.domain.Hotel.businessDate().toString()));
  }

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
