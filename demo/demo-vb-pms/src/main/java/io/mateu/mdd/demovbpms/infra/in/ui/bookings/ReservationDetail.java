package io.mateu.mdd.demovbpms.infra.in.ui.bookings;

import io.mateu.mdd.demovbpms.domain.Hotel;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.AccordionLayout;
import io.mateu.uidl.data.ActionPanel;
import io.mateu.uidl.data.ActionPanelCategory;
import io.mateu.uidl.data.ActionPanelItem;
import io.mateu.uidl.data.AccordionPanel;
import io.mateu.uidl.data.Chip;
import io.mateu.uidl.data.Details;
import io.mateu.uidl.data.EntityHeader;
import io.mateu.uidl.data.Fact;
import io.mateu.uidl.data.FoldoutLayout;
import io.mateu.uidl.data.FoldoutPanel;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.Tab;
import io.mateu.uidl.data.TabLayout;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

/**
 * Reservation presentation page (OPERA Cloud 26.3 user guide, 001 "Presentation Pages": an
 * Overview panel that collapses into a business card on scroll, tabs of panels, panels that
 * expand; 003 "Managing Reservation Alerts") with its I Want To overlay (001 "I Want to Menu":
 * Modify / Create / View / Go To columns, populated links first and bold, Show More past 10, Hide
 * Unpopulated, CTRL+I). The actions depend on the reservation's status: the server builds them.
 */
@UI("/reservation-detail")
@Title("Reservation")
public class ReservationDetail implements ComponentTreeSupplier {

  @Override
  public Component component(HttpRequest httpRequest) {
    Hotel.Reservation r =
        Hotel.RESERVATIONS.stream()
            .filter(x -> x.status == Hotel.ReservationStatus.IN_HOUSE)
            .findFirst()
            .orElseThrow();
    BigDecimal balance =
        Hotel.chargesOf(r.id).stream()
            .map(c -> c.amount().add(c.tax()))
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    var header =
        EntityHeader.builder()
            .id("card")
            .title(r.guest)
            .subtitle("Confirmation " + r.confirmation + " · Room " + r.room + " · " + r.roomType)
            .badges(List.of(new Chip("In house", "success"), new Chip(r.rateCode, "normal")))
            .facts(
                List.of(
                    new Fact("Arrival", r.arrival.toString()),
                    new Fact("Departure", r.departure.toString()),
                    new Fact("Nights", String.valueOf(r.nights())),
                    new Fact("Guests", r.adults + " adults, " + r.children + " children")))
            .metricLabel("Balance")
            .metricValue(balance + " €")
            .build();
    var overview =
        AccordionLayout.builder()
            .id("overviewPanels")
            .panels(
                List.of(
                    new AccordionPanel(
                        "Stay details",
                        VerticalLayout.builder()
                            .content(
                                List.of(
                                    text(
                                        "Room type "
                                            + r.roomType
                                            + " · rate "
                                            + r.rateCode
                                            + " "
                                            + r.rate
                                            + " € per night · "
                                            + r.nights()
                                            + " nights"),
                                    // OPERA's rate information popup: hover (or focus) the link
                                    io.mateu.uidl.data.Popover.builder()
                                        .id("rateInfo")
                                        .trigger(io.mateu.uidl.data.PopoverTrigger.hover)
                                        .wrapped(new Text("rateInfoLink", "Rate information"))
                                        .content(
                                            VerticalLayout.builder()
                                                .content(
                                                    java.util.Arrays.stream(
                                                            ReservationSearch.rateBreakdownOf(r)
                                                                .split("\n"))
                                                        .map(ReservationDetail::text)
                                                        .map(t -> (Component) t)
                                                        .toList())
                                                .build())
                                        .build()))
                            .build(),
                        true,
                        false,
                        "",
                        ""),
                    new AccordionPanel(
                        "Guest profile",
                        text(
                            r.guest
                                + (r.vip ? " · VIP" : "")
                                + (r.company.isBlank() ? "" : " · " + r.company))),
                    new AccordionPanel(
                        "Payment instructions",
                        text("Window 1: guest, credit card · Window 2: guest, cash")),
                    // rich text: OPERA's traces and notes carry formatting (bold, lists, quotes)
                    new AccordionPanel(
                        "Traces and notes",
                        new io.mateu.uidl.data.Markdown(
                            "**Late arrival** expected, after 23:00.\n\n"
                                + "- Feather-free pillows\n"
                                + "- Extra towels for the *pool*\n\n"
                                + "> Asked for a quiet room, away from the lift.",
                            "",
                            ""))))
            .build();
    var alerts =
        new Details(
            text("Alerts (1)"),
            text("Check-in alert: pre-authorize the card on arrival."),
            "",
            "",
            false);
    var tabs =
        TabLayout.builder()
            .id("detailTabs")
            .tabs(
                List.of(
                    new Tab("Overview", VerticalLayout.builder().content(List.of(overview, alerts)).build(), "", "", "alt+1", false, null, null),
                    // a FOLDOUT inside a tab: the windows of the folio as panels (8 in OPERA)
                    new Tab(
                        "Billing",
                        FoldoutLayout.builder()
                            .id("windows")
                            .overview(text("Folio balance " + balance + " € · 2 windows"))
                            .panels(
                                List.of(
                                    FoldoutPanel.builder()
                                        .id("w1")
                                        .title("Window 1 · Guest")
                                        .open(true)
                                        .content(text("Accommodation, restaurant and spa charges"))
                                        .build(),
                                    FoldoutPanel.builder()
                                        .id("w2")
                                        .title("Window 2 · Guest (cash)")
                                        .open(false)
                                        .content(text("Minibar charges"))
                                        .build()))
                            .build(),
                        "",
                        "",
                        "alt+2",
                        false,
                        null,
                        null),
                    // NESTED tabs: the changes log split by what changed (OPERA's tabs of panels)
                    new Tab(
                        "Changes log",
                        TabLayout.builder()
                            .id("logTabs")
                            .tabs(
                                List.of(
                                    new Tab("Reservation", text("Created by WEB · 2026-10-01 10:12 · Rate BAR")),
                                    new Tab("Room", text("Room 106 assigned by FRONTDESK · 2026-10-08 14:03")),
                                    new Tab("Billing", text("Window 2 opened by NIGHTAUDIT · 2026-10-09 03:00"))))
                            .build(),
                        "",
                        "",
                        "alt+3",
                        false,
                        null,
                        null)))
            .build();
    return VerticalLayout.builder().content(List.of(actionPanelOf(r), header, tabs)).build();
  }

  /** The I Want To overlay of a reservation: what applies depends on its status. */
  static ActionPanel actionPanelOf(Hotel.Reservation r) {
    boolean inHouse = r.status == Hotel.ReservationStatus.IN_HOUSE;
    boolean arriving = r.status == Hotel.ReservationStatus.DUE_IN;
    var modify =
        new java.util.ArrayList<>(
            List.of(
                item("Alerts", 1),
                item("Traces", 2),
                item("Notes", 1),
                item("Routing", 0),
                item("Deposit / cancellation", 0),
                item("Fixed charges", 0),
                item("Packages", 0),
                item("Preferences", 3),
                item("Privileges", 0),
                item("Shares", 0),
                item("Upsell", 0),
                item("Waitlist", 0),
                item("Attachments", 0)));
    if (inHouse) modify.add(0, item("Check out", null));
    if (arriving) modify.add(0, item("Check in", null));
    return ActionPanel.builder()
        .id("iWantTo")
        .shortcut("ctrl+i")
        .hideUnpopulatedToggle(true)
        .categories(
            List.of(
                new ActionPanelCategory("Modify / Update", modify),
                new ActionPanelCategory(
                    "Create",
                    List.of(
                        item("New reservation", null),
                        item("Copy reservation", null),
                        item("Add to group", null))),
                new ActionPanelCategory(
                    "View",
                    List.of(
                        item("Changes log", 4),
                        item("Rate info", null),
                        item("Registration card", null),
                        ActionPanelItem.builder()
                            .label("Folio history")
                            .actionId("iWantTo")
                            .parameters(Map.of("what", "Folio history"))
                            .disabled(!inHouse)
                            .build())),
                new ActionPanelCategory(
                    "Go To",
                    List.of(item("Billing", null), item("Profile", null), item("Room diary", null)))))
        .build();
  }

  private static ActionPanelItem item(String label, Integer count) {
    return ActionPanelItem.builder()
        .label(label)
        .actionId("iWantTo")
        .parameters(Map.of("what", label))
        .count(count)
        .build();
  }

  @Action
  public Object iWantTo(HttpRequest rq) {
    return new Message("I want to: " + rq.runActionRq().parameters().get("what"));
  }

  private static Text text(String value) {
    return new Text("t" + Math.abs(value.hashCode()), value);
  }
}
