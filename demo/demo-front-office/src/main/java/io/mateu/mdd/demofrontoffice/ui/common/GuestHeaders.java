package io.mateu.mdd.demofrontoffice.ui.common;

import io.mateu.mdd.demofrontoffice.data.HotelData;
import io.mateu.uidl.data.Chip;
import io.mateu.uidl.data.EntityHeader;
import io.mateu.uidl.data.Fact;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.ArrayList;
import java.util.List;

/** Shared {@link EntityHeader} builders — the persistent guest context banner of every flow. */
public final class GuestHeaders {

  private GuestHeaders() {}

  /** The arriving guest's banner, shown as the first component of every check-in wizard step. */
  public static Component arrivalHeader(String guestId) {
    var g = HotelData.arrival(guestId);
    return EntityHeader.builder()
        .title(g.name())
        .badges(List.of(Chip.builder().label(g.tier()).color("contrast").build()))
        .subtitle(g.subtitle())
        .facts(
            List.of(
                Fact.builder().label("TOTAL RESERVA").value(euros(g.total())).build(),
                Fact.builder().label("AGENCIA").value(g.agency()).build()))
        .metricLabel("FIDELIDAD")
        .metricValue(g.loyalty())
        .metricCaption(g.staysCaption())
        .style("width: 100%;")
        .build();
  }

  /** The departing guest's banner at check-out. */
  public static Component departureHeader(String guestId) {
    var g = HotelData.departure(guestId);
    return EntityHeader.builder()
        .title(g.name())
        .badges(List.of(Chip.builder().label(g.tier()).color("contrast").build()))
        .subtitle(g.subtitle())
        .facts(
            List.of(
                Fact.builder().label("TOTAL FOLIO").value(euros(g.total())).build(),
                Fact.builder().label("PREAUTORIZADO").value(euros(g.preauthorized())).build()))
        .style("width: 100%;")
        .build();
  }

  /** The in-house guest's 360 banner. */
  public static Component inHouseHeader(String guestId) {
    var g = HotelData.inHouse(guestId);
    var badges = new ArrayList<Chip>();
    badges.add(Chip.builder().label(g.tier()).color("contrast").build());
    badges.add(Chip.builder().label(g.deseos()).color("success").build());
    if (g.vip() != null) {
      badges.add(Chip.builder().label(g.vip()).color("warning").build());
    }
    return EntityHeader.builder()
        .title(g.name())
        .badges(badges)
        .subtitle(g.subtitle())
        .facts(
            List.of(
                Fact.builder().label("BALANCE").value(euros(g.balance())).build(),
                Fact.builder().label("PREAUTORIZADO").value(euros(g.preauthorized())).build()))
        .metricLabel("FIDELIDAD")
        .metricValue(g.loyalty())
        .metricCaption(g.staysCaption())
        .style("width: 100%;")
        .build();
  }

  public static String euros(Double amount) {
    if (amount == null) {
      return "—";
    }
    return "€ "
        + String.format(java.util.Locale.US, "%,.2f", amount)
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
    var segs = rq.route().replaceFirst("^/", "").split("/");
    for (int i = 0; i < segs.length; i++) {
      if (mount.equals(segs[i])) {
        return i + 1 < segs.length && !segs[i + 1].isBlank() ? segs[i + 1] : null;
      }
    }
    return segs.length > 0 && !segs[0].isBlank() ? segs[0] : null;
  }
}
