package io.mateu.mdd.demoadminpanel.infra.in.ui.checkin;

import io.mateu.core.infra.declarative.orchestrators.masterdetail.MasterDetailView;
import io.mateu.uidl.annotations.BadgeInHeader;
import io.mateu.uidl.annotations.DetailPart;
import io.mateu.uidl.annotations.Inline;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.TextContainer;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;

import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * Shared base for the three check-in screens (v1/v2/v3). It declares the master sections and the
 * five {@link DetailPart} fields, the page-header badges, and how to populate everything from the
 * reservation line plus the context strip — all on the reusable {@link MasterDetailView}.
 *
 * <p>The concrete subclasses differ only in their {@code @Route} and the master-detail
 * configuration: layout (with or without {@code @Zones}) and {@link #noSelection()}.
 */
public abstract class CheckInScreen extends MasterDetailView {

  final ReservationLineRepository repository;

  protected CheckInScreen(ReservationLineRepository repository) {
    this.repository = repository;
  }

  // ── Page-header badges ────────────────────────────────────────────────────
  @BadgeInHeader(label = "Garantizada", color = "success")
  boolean garantizada = true;

  @BadgeInHeader(label = "Terceros")
  boolean terceros;

  @BadgeInHeader(label = "Pdte. Int.")
  boolean pdteInt;

  @BadgeInHeader(label = "Exp.")
  boolean exp = true;

  @BadgeInHeader(label = "Múltiple")
  boolean multiple;

  @BadgeInHeader(label = "VIP", color = "contrast")
  boolean vip = true;

  // ── Master pane (always visible) ──────────────────────────────────────────
  @Section(value = "Información general de la reserva", columns = 8, zone = "master")
  @Label("") @Inline
  ReservacionInfoSection resvInfo = new ReservacionInfoSection();

  @Section(value = "Check-in", columns = 6, zone = "master")
  @Label("") @Inline
  CheckInSection checkIn = new CheckInSection();

  @Section(value = "Huéspedes", columns = 1, zone = "master")
  @Label("") @Inline
  GuestsSection guestList = new GuestsSection();

  // ── Detail parts (one shown at a time) ────────────────────────────────────
  @DetailPart(label = "Cliente", order = 1)
  @Section(value = "Información cliente", columns = 8, zone = "detail")
  @Label("") @Inline
  ClientInfoSection clientInfo = new ClientInfoSection();

  @DetailPart(label = "Importes", order = 2)
  @Section(value = "Importes", columns = 1, zone = "detail")
  @Label("") @Inline
  ImportesSection importesList = new ImportesSection();

  @DetailPart(label = "Habitación", order = 3)
  @Section(value = "Información habitación", columns = 4, zone = "detail")
  @Label("") @Inline
  RoomInfoSection roomInfo = new RoomInfoSection();

  @DetailPart(label = "Historial", order = 4)
  @Section(value = "Historial cliente", columns = 4, zone = "detail")
  @Label("") @Inline
  HistorialClienteSection historial = new HistorialClienteSection();

  @DetailPart(label = "Folios", order = 5)
  @Section(value = "Folios / Anticipos", columns = 4, zone = "detail")
  @Label("") @Inline
  FoliosSection folios = new FoliosSection();

  // ── Data ──────────────────────────────────────────────────────────────────

  /** The reservation id is the first route segment under the listing mount (e.g. /checkin/&lt;id&gt;). */
  static String idFromRoute(HttpRequest httpRequest) {
    var rq = httpRequest.runActionRq();
    if (rq == null || rq.route() == null) {
      return null;
    }
    var route = rq.route();
    var consumed = rq.consumedRoute() != null ? rq.consumedRoute() : "";
    var rel = route.startsWith(consumed) ? route.substring(consumed.length()) : route;
    var segs = rel.replaceFirst("^/", "").split("/");
    // The id is the segment right after "checkin" (route is /checkin/<id>/... under the root app),
    // falling back to the first segment when the "checkin" prefix has already been consumed.
    for (int i = 0; i < segs.length; i++) {
      if ("checkin".equals(segs[i])) {
        return i + 1 < segs.length && !segs[i + 1].isBlank() ? segs[i + 1] : null;
      }
    }
    return segs.length > 0 && !segs[0].isBlank() ? segs[0] : null;
  }

  static Component item(String label, String value) {
    return VerticalLayout.builder()
        .spacing(false)
        .padding(false)
        .style("min-width: 0; line-height: 1.15;")
        .content(
            List.of(
                Text.builder()
                    .text(label)
                    .container(TextContainer.div)
                    .style(
                        "font-size: 10px; text-transform: uppercase; letter-spacing: .3px;"
                            + " color: var(--lumo-secondary-text-color);")
                    .build(),
                Text.builder()
                    .text(nz(value))
                    .container(TextContainer.div)
                    .style("font-size: 13px; font-weight: 600;")
                    .build()))
        .build();
  }

  static String nz(String s) {
    return s == null || s.isBlank() ? "—" : s;
  }

  @Override
  protected void load(HttpRequest httpRequest) {
    var id = idFromRoute(httpRequest);
    if (id == null) {
      return;
    }
    repository
        .findById(id)
        .ifPresent(
            line -> {
              garantizada = line.isGarantizada();
              terceros = line.isTerceros();
              pdteInt = line.isPdteInt();
              exp = line.isExp();
              multiple = line.isMultiple();
              vip = line.isVip();

              resvInfo.populate(line);
              checkIn.populate(line);
              guestList.populate(line);
              clientInfo.populate(line);
              importesList.populate(line);
              roomInfo.populate(line);
              historial.populate(line);
              folios.populate(line);

              if (!line.getGuests().isEmpty()) {
                CardexView.prime(line.getGuests().get(0).getCardex());
              }
            });
  }

  @Override
  protected List<Component> header(HttpRequest httpRequest) {
    var id = idFromRoute(httpRequest);
    if (id == null) {
      return List.of();
    }
    return repository
        .findById(id)
        .map(
            line -> {
              var nights =
                  (int) ChronoUnit.DAYS.between(line.getArrivalDate(), line.getDepartureDate());
              var saldo =
                  folios.saldoPendiente != null ? folios.saldoPendiente.toPlainString() : "0";
              var info =
                  HorizontalLayout.builder()
                      .spacing(true)
                      .style(
                          "flex-wrap: wrap; align-items: baseline; gap: 2px 1.75rem; width: 100%;")
                      .content(
                          List.of(
                              item("Localizador", line.getLocalizador()),
                              item("Hotel", line.getHotel()),
                              item("Agencia", line.getAgencia()),
                              item(
                                  "Estado", line.getStatus() != null ? line.getStatus().name() : "—"),
                              item(
                                  "Estancia",
                                  line.getArrivalDate()
                                      + " → "
                                      + line.getDepartureDate()
                                      + " · "
                                      + nights
                                      + "N"),
                              item(
                                  "Ocupación",
                                  line.getAdults()
                                      + " AD · "
                                      + line.getChildren()
                                      + " CH · "
                                      + line.getBabies()
                                      + " BB"),
                              item(
                                  "Régimen",
                                  line.getMealPlan() != null ? line.getMealPlan().name() : "—"),
                              item("Tipo cobro", line.getChargeType()),
                              item(
                                  "Saldo", saldo + " " + nz(line.getCurrency()))))
                      .build();
              return List.<Component>of(
                  VerticalLayout.builder()
                      .spacing(true)
                      .style("width: 100%;")
                      .content(List.of(info))
                      .build());
            })
        .orElse(List.of());
  }
}
