package io.mateu.mdd.demoadminpanel.infra.in.ui.checkin;

import io.mateu.uidl.StyleConstants;
import io.mateu.uidl.annotations.BadgeInHeader;
import io.mateu.uidl.annotations.Compact;
import io.mateu.uidl.annotations.Inline;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.PlainText;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Style;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Toc;
import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.State;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.TextContainer;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.OnLoadTrigger;
import io.mateu.uidl.fluent.Trigger;
import io.mateu.uidl.fluent.TriggersSupplier;
import io.mateu.uidl.interfaces.HeaderSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Hydratable;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;

import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * Check-in v2 — a "docs-style" single-column screen: <b>all</b> sections stacked vertically (including
 * the client-info tabs), with a sticky right-hand index ({@link Toc}) that lists the section titles
 * and scrolls to them. The <b>Huéspedes</b> section is {@link Section#sticky() sticky} so the guest
 * list stays pinned in view while the rest of the form scrolls.
 *
 * <p>Unlike v1/v3 this is not a master-detail view: there are no {@code @Zones} and no detail pane —
 * every section is always visible in reading order. It reuses the same section component classes as
 * {@link CompactCheckInScreen}.
 */
@Service
@Scope("prototype")
@Route(value = "/checkin/:id/v2", parentRoute = "")
@Style(StyleConstants.FULL_WIDTH_WITH_PADDING)
@Compact
@ReadOnly
@PlainText
@Title("Check-in")
@Toc
public class CheckInFormV2 implements HeaderSupplier, TriggersSupplier, Hydratable {

  final ReservationLineRepository repository;

  public CheckInFormV2(ReservationLineRepository repository) {
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

  // ── Sections (single vertical column, in reading order) ───────────────────
  // Pinned (like Huéspedes) so the reservation's general info stays in view while scrolling.
  @Section(value = "Información general de la reserva", columns = 8, sticky = true)
  @Label("") @Inline
  ReservacionInfoSection resvInfo = new ReservacionInfoSection();

  @Section(value = "Check-in", columns = 6)
  @Label("") @Inline
  CheckInSection checkIn = new CheckInSection();

  // Pinned so the guest list never leaves the viewport while the rest of the form scrolls.
  @Section(value = "Huéspedes", columns = 1, sticky = true)
  @Label("") @Inline
  GuestsSection guestList = new GuestsSection();

  @Section(value = "Información cliente", columns = 8)
  @Label("") @Inline
  ClientInfoSection clientInfo = new ClientInfoSection();

  @Section(value = "Importes", columns = 1)
  @Label("") @Inline
  ImportesSection importesList = new ImportesSection();

  @Section(value = "Información habitación", columns = 4)
  @Label("") @Inline
  RoomInfoSection roomInfo = new RoomInfoSection();

  @Section(value = "Historial cliente", columns = 4)
  @Label("") @Inline
  HistorialClienteSection historial = new HistorialClienteSection();

  @Section(value = "Folios / Anticipos", columns = 4)
  @Label("") @Inline
  FoliosSection folios = new FoliosSection();

  // ── Load on render ────────────────────────────────────────────────────────
  @Override
  public List<Trigger> triggers(HttpRequest httpRequest) {
    return List.of(OnLoadTrigger.builder().actionId("load").build());
  }

  @Override
  public void hydrate(HttpRequest httpRequest) {
    load(httpRequest);
  }

  public Object load(HttpRequest httpRequest) {
    var id = idFromRoute(httpRequest);
    if (id == null) {
      return Message.error("Reservation " + id + " not found.");
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
    return new State(this);
  }

  @Override
  public List<Component> header(HttpRequest httpRequest) {
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
                              item("Saldo", saldo + " " + nz(line.getCurrency()))))
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

  // ── Helpers ───────────────────────────────────────────────────────────────

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
}
