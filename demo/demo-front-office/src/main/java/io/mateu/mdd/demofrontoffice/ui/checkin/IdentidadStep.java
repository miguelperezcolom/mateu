package io.mateu.mdd.demofrontoffice.ui.checkin;

import io.mateu.core.infra.declarative.orchestrators.wizard.WizardStep;
import io.mateu.mdd.demofrontoffice.ui.common.FrontOffice;
import io.mateu.mdd.demofrontoffice.ui.common.GuestHeaders;
import io.mateu.uidl.annotations.Colspan;
import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.PlainText;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.data.StatusItem;
import io.mateu.uidl.data.StatusList;
import io.mateu.uidl.data.TaskProgress;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.VisibilitySupplier;
import java.util.ArrayList;
import java.util.concurrent.Callable;
import lombok.Getter;
import lombok.Setter;

/** Step 1 — Identidad: document verification, contact data, preferences and pax registration. */
@Getter
@Setter
public class IdentidadStep implements WizardStep, VisibilitySupplier {

  @Hidden String stayId;

  @Colspan(2)
  @Label("")
  Callable<Component> header = () -> GuestHeaders.arrivalHeader(stayId);

  @PlainText
  @Label("Documento")
  String documento;

  @Label("Nombre")
  String nombre;

  @Label("Email")
  String email;

  @Label("Teléfono")
  String telefono;

  @Colspan(2)
  @Label("")
  Callable<Component> preferencias =
      () -> {
        var view = FrontOffice.stayView(stayId);
        var guest = view.guest();
        var items = new ArrayList<StatusItem>();
        for (var pref : guest.preferences()) {
          items.add(
              StatusItem.builder()
                  .id(pref.text())
                  .icon("●")
                  .title(pref.text())
                  .status("Preferencia")
                  .statusColor("normal")
                  .build());
        }
        items.add(
            StatusItem.builder()
                .id("ultima")
                .icon("🏨")
                .title("Última estancia")
                .description(guest.lastStaySummary())
                .build());
        if (guest.complaints() > 0) {
          items.add(
              StatusItem.builder()
                  .id("quejas")
                  .icon("⚠")
                  .title(guest.complaints() + " quejas pendientes")
                  .description(
                      guest.stays()
                          + " estancias · Cliente desde hace "
                          + guest.yearsAsClient()
                          + " años")
                  .status("Revisar")
                  .statusColor("error")
                  .build());
        }
        return StatusList.builder().items(items).style("width: 100%;").build();
      };

  @Colspan(2)
  @Label("")
  Callable<Component> registroPax =
      () -> {
        var stay = FrontOffice.stayView(stayId).stay();
        var registered = 1 + stay.companions().size();
        return TaskProgress.builder()
            .label(
                "Reserva con "
                    + stay.pax()
                    + " pax. "
                    + (registered < stay.pax()
                        ? "Registrar los huéspedes adicionales."
                        : "Huéspedes registrados."))
            .total(stay.pax())
            .done(Math.min(registered, stay.pax()))
            .actionLabel("Añadir siguiente pax")
            .actionId("addPax")
            .build();
      };

  /** Fills the identity fields for guests whose document is not verified yet (demo). */
  @Toolbar
  @Label("Simular escaneo")
  void simularEscaneo() {
    // handled by the wizard (CheckInWizard.handleAction)
  }

  @Override
  public boolean isHidden(String memberName, HttpRequest httpRequest) {
    return "simularEscaneo".equals(memberName)
        && stayId != null
        && FrontOffice.stayView(stayId).guest().identityComplete();
  }
}
