package io.mateu.mdd.demofrontoffice.ui.checkin;

import io.mateu.core.infra.declarative.orchestrators.wizard.WizardStep;
import io.mateu.mdd.demofrontoffice.data.HotelData;
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

  @Hidden String guestId;

  @Colspan(2)
  @Label("")
  Callable<Component> header = () -> GuestHeaders.arrivalHeader(guestId);

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
        var g = HotelData.arrival(guestId);
        var items = new ArrayList<StatusItem>();
        for (var pref : g.prefs()) {
          items.add(
              StatusItem.builder()
                  .id(pref)
                  .icon("●")
                  .title(pref)
                  .status("Preferencia")
                  .statusColor("normal")
                  .build());
        }
        items.add(
            StatusItem.builder()
                .id("ultima")
                .icon("🏨")
                .title("Última estancia")
                .description(g.lastStay())
                .build());
        if (g.pendingComplaints() > 0) {
          items.add(
              StatusItem.builder()
                  .id("quejas")
                  .icon("⚠")
                  .title(g.pendingComplaints() + " quejas pendientes")
                  .description(g.staysCaption() + " · Cliente desde 2019")
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
        var g = HotelData.arrival(guestId);
        return TaskProgress.builder()
            .label(
                "Reserva con "
                    + g.pax()
                    + " pax. "
                    + (g.pax() > 1 ? "Registrar los huéspedes adicionales." : "Huésped registrado."))
            .total(g.pax())
            .done(1)
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
        && guestId != null
        && HotelData.arrival(guestId).verified();
  }
}
