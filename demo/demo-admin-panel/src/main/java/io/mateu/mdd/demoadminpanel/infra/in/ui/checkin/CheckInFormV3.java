package io.mateu.mdd.demoadminpanel.infra.in.ui.checkin;

import io.mateu.core.infra.declarative.orchestrators.masterdetail.MasterDetailView;
import io.mateu.uidl.StyleConstants;
import io.mateu.uidl.annotations.Compact;
import io.mateu.uidl.annotations.DetailPart;
import io.mateu.uidl.annotations.Inline;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.PlainText;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Style;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Zone;
import io.mateu.uidl.annotations.Zones;
import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;

import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * Master-detail check-in screen (v3), built on the reusable {@link MasterDetailView} core
 * orchestrator. The master pane (left zone) shows reservation/check-in/guests; the button bar
 * switches the detail pane (right zone) between the five secondary parts — without reloading the
 * master. All the wiring lives in {@link MasterDetailView}; here we only declare the fields and
 * populate them.
 */
@Service
@Scope("prototype")
@Route(value = "/:id/v3", uis = {"/checkin"})
@Style(StyleConstants.FULL_WIDTH_WITH_PADDING)
@Compact
@ReadOnly
@PlainText
@Title("Check-in")
@Zones({
    @Zone(name = "master", width = "60%"),
    @Zone(name = "detail", width = "40%")
})
public class CheckInFormV3 extends MasterDetailView {

  final ReservationLineRepository repository;

  public CheckInFormV3(ReservationLineRepository repository) {
    this.repository = repository;
  }

  // ── Master pane (always visible) ────────────────────────────────────────
  @Section(value = "Información general de la reserva", columns = 8, zone = "master")
  @Label("") @Inline
  ReservacionInfoSection resvInfo = new ReservacionInfoSection();

  @Section(value = "Check-in", columns = 6, zone = "master")
  @Label("") @Inline
  CheckInSection checkIn = new CheckInSection();

  @Section(value = "Huéspedes", columns = 1, zone = "master")
  @Label("") @Inline
  GuestsSection guestList = new GuestsSection();

  // ── Detail parts (one shown at a time) ──────────────────────────────────
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

  @Override
  protected List<Component> header(HttpRequest httpRequest) {
    var id = CheckInForm.idFromRoute(httpRequest);
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
                              CheckInForm.item("Localizador", line.getLocalizador()),
                              CheckInForm.item("Hotel", line.getHotel()),
                              CheckInForm.item("Agencia", line.getAgencia()),
                              CheckInForm.item(
                                  "Estado",
                                  line.getStatus() != null ? line.getStatus().name() : "—"),
                              CheckInForm.item(
                                  "Estancia",
                                  line.getArrivalDate()
                                      + " → "
                                      + line.getDepartureDate()
                                      + " · "
                                      + nights
                                      + "N"),
                              CheckInForm.item(
                                  "Ocupación",
                                  line.getAdults()
                                      + " AD · "
                                      + line.getChildren()
                                      + " CH · "
                                      + line.getBabies()
                                      + " BB"),
                              CheckInForm.item(
                                  "Régimen",
                                  line.getMealPlan() != null ? line.getMealPlan().name() : "—"),
                              CheckInForm.item("Tipo cobro", line.getChargeType()),
                              CheckInForm.item("Saldo", saldo + " " + CheckInForm.nz(line.getCurrency()))))
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

  @Override
  protected void load(HttpRequest httpRequest) {
    var id = CheckInForm.idFromRoute(httpRequest);
    if (id == null) {
      return;
    }
    repository
        .findById(id)
        .ifPresent(
            line -> {
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
}
