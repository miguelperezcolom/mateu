package io.mateu.mdd.demovbpms.infra.in.ui.bookings;

import io.mateu.mdd.demovbpms.domain.Hotel;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.AccordionLayout;
import io.mateu.uidl.data.AccordionPanel;
import io.mateu.uidl.data.Chip;
import io.mateu.uidl.data.Details;
import io.mateu.uidl.data.EntityHeader;
import io.mateu.uidl.data.Fact;
import io.mateu.uidl.data.FoldoutLayout;
import io.mateu.uidl.data.FoldoutPanel;
import io.mateu.uidl.data.Tab;
import io.mateu.uidl.data.TabLayout;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.math.BigDecimal;
import java.util.List;

/**
 * Reservation presentation page (OPERA Cloud 26.3 user guide, 001 "Presentation Pages": an
 * Overview panel that collapses into a business card on scroll, tabs of panels, panels that
 * expand; 003 "Managing Reservation Alerts"). The I Want To overlay and the rate popup join it as
 * those components land.
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
                    new AccordionPanel(
                        "Traces and notes",
                        text("Late arrival expected · Feather-free pillows"))))
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
                    new Tab("Overview", VerticalLayout.builder().content(List.of(overview, alerts)).build()),
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
                            .build()),
                    new Tab("Changes log", text("Created by WEB · Room assigned by FRONTDESK"))))
            .build();
    return VerticalLayout.builder().content(List.of(header, tabs)).build();
  }

  private static Text text(String value) {
    return new Text("t" + Math.abs(value.hashCode()), value);
  }
}
