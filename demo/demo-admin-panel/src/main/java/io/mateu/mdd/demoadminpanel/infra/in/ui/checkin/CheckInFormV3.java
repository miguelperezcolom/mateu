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
import io.mateu.uidl.interfaces.HttpRequest;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;

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
