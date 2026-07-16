package io.mateu.mdd.demofrontoffice.ui.common;

import io.mateu.mdd.demofrontoffice.domain.folio.Folio;
import io.mateu.mdd.demofrontoffice.domain.guest.Guest;
import io.mateu.mdd.demofrontoffice.domain.stay.Stay;
import io.mateu.uidl.data.Chip;
import io.mateu.uidl.data.EntityHeader;
import io.mateu.uidl.data.Fact;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/** Shared {@link EntityHeader} builders — the persistent guest context banner of every flow. */
public final class GuestHeaders {

  private static final DateTimeFormatter DAY = DateTimeFormatter.ofPattern("dd MMM");

  private GuestHeaders() {}

  /** The arriving guest's banner, shown as the first component of every check-in wizard step. */
  public static Component arrivalHeader(String stayId) {
    var view = FrontOffice.stayView(stayId);
    var stay = view.stay();
    var guest = view.guest();
    return EntityHeader.builder()
        .title(guest.name())
        .badges(List.of(Chip.builder().label(guest.tier().name()).color("contrast").build()))
        .subtitle(staySubtitle(stay))
        .facts(
            List.of(
                Fact.builder().label("TOTAL RESERVA").value(euros(stay.total())).build(),
                Fact.builder().label("AGENCIA").value(stay.agency()).build()))
        .metricLabel("FIDELIDAD")
        .metricValue(points(guest))
        .metricCaption(guest.stays() + " estancias")
        .style("width: 100%;")
        .build();
  }

  /** The departing guest's banner at check-out. */
  public static Component departureHeader(String stayId) {
    var view = FrontOffice.stayView(stayId);
    var stay = view.stay();
    var guest = view.guest();
    var folio = view.folio();
    return EntityHeader.builder()
        .title(guest.name())
        .badges(List.of(Chip.builder().label(guest.tier().name()).color("contrast").build()))
        .subtitle(
            "Hab " + stay.roomNumber() + " · " + stay.roomType() + " · " + stay.board() + " · "
                + stay.nights() + "N")
        .facts(
            List.of(
                Fact.builder().label("TOTAL FOLIO").value(euros(balance(folio))).build(),
                Fact.builder()
                    .label("PREAUTORIZADO")
                    .value(euros(folio == null ? null : folio.preauthorized()))
                    .build()))
        .style("width: 100%;")
        .build();
  }

  /** The in-house guest's 360 banner. */
  public static Component inHouseHeader(String stayId) {
    var view = FrontOffice.stayView(stayId);
    var stay = view.stay();
    var guest = view.guest();
    var folio = view.folio();
    var badges = new ArrayList<Chip>();
    badges.add(Chip.builder().label(guest.tier().name()).color("contrast").build());
    if (stay.wishesTotal() > 0) {
      badges.add(Chip.builder().label(wishes(stay)).color("success").build());
    }
    if (stay.vipNote() != null) {
      badges.add(Chip.builder().label(stay.vipNote()).color("warning").build());
    }
    return EntityHeader.builder()
        .title(guest.name())
        .badges(badges)
        .subtitle(
            stay.roomType() + " · Hab " + stay.roomNumber() + " · Sal. "
                + stay.checkOut().format(DAY) + " · " + stay.board())
        .facts(
            List.of(
                Fact.builder().label("BALANCE").value(euros(balance(folio))).build(),
                Fact.builder()
                    .label("PREAUTORIZADO")
                    .value(euros(folio == null ? null : folio.preauthorized()))
                    .build()))
        .metricLabel("FIDELIDAD")
        .metricValue(points(guest))
        .metricCaption(guest.stays() + " estancias")
        .style("width: 100%;")
        .build();
  }

  /** "Ocean Suite · 15 Jul → 22 Jul · 7N · 2pax · All Inclusive" */
  public static String staySubtitle(Stay stay) {
    return stay.roomType() + " · " + stayDates(stay) + " · " + stay.nights() + "N · " + stay.pax()
        + "pax · " + stay.board();
  }

  public static String stayDates(Stay stay) {
    return stay.checkIn().format(DAY) + " → " + stay.checkOut().format(DAY);
  }

  public static String wishes(Stay stay) {
    return "Deseos " + stay.wishesGranted() + "/" + stay.wishesTotal();
  }

  /** Loyalty points with thousands separator: 48500 → "48.500". */
  public static String points(Guest guest) {
    return String.format(Locale.US, "%,d", guest.loyaltyPoints()).replace(',', '.');
  }

  public static BigDecimal balance(Folio folio) {
    return folio == null ? null : folio.balance();
  }

  public static String euros(BigDecimal amount) {
    return euros(amount == null ? null : amount.doubleValue());
  }

  public static String euros(Double amount) {
    if (amount == null) {
      return "—";
    }
    return "€ "
        + String.format(Locale.US, "%,.2f", amount)
            .replace(',', '_')
            .replace('.', ',')
            .replace('_', '.');
  }

  /** The id is the first route segment under the given mount (e.g. /checkin/&lt;id&gt;). */
  public static String idFromRoute(HttpRequest httpRequest, String mount) {
    var rq = httpRequest.runActionRq();
    if (rq == null || rq.route() == null) {
      return null;
    }
    // embedded islands carry markers as a query string (e.g. ?_embeddedMediator=1) — strip it
    var route = rq.route();
    var q = route.indexOf('?');
    if (q >= 0) {
      route = route.substring(0, q);
    }
    var segs = route.replaceFirst("^/", "").split("/");
    for (int i = 0; i < segs.length; i++) {
      if (mount.equals(segs[i])) {
        return i + 1 < segs.length && !segs[i + 1].isBlank() ? segs[i + 1] : null;
      }
    }
    return segs.length > 0 && !segs[0].isBlank() ? segs[0] : null;
  }

  /** Today, for grouping the departure queue. */
  public static LocalDate today() {
    return LocalDate.now();
  }
}
