package io.mateu.mdd.demofrontoffice.ui.checkin;

import io.mateu.core.infra.declarative.orchestrators.wizard.WizardStep;
import io.mateu.mdd.demofrontoffice.domain.guest.Preference;
import io.mateu.mdd.demofrontoffice.ui.common.FrontOffice;
import io.mateu.mdd.demofrontoffice.ui.common.GuestHeaders;
import io.mateu.uidl.annotations.*;
import io.mateu.uidl.annotations.Text;
import io.mateu.uidl.data.*;
import io.mateu.uidl.data.BulletedList;
import io.mateu.uidl.data.Notice;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Hydratable;
import io.mateu.uidl.interfaces.VisibilitySupplier;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.concurrent.Callable;
import lombok.Getter;
import lombok.Setter;

/** Step 1 — Identidad: document verification, contact data, preferences and pax registration. */
@Getter
@Setter
@Zones({@Zone(name = "main", width = "62%"), @Zone(name = "side", width = "38%")})
public class IdentidadStep implements WizardStep {

  @Hidden String stayId;

  // No zone → full-width band across the top. Frameless: the header card brings its own chrome.
  @Section(value = "", columns = 2, frameless = true)
  @Colspan(2)
  @Label("")
  Callable<Component> header = () -> GuestHeaders.arrivalHeader(stayId);

  // Left column: the Documento block is an ORCHESTRATED island (DocumentoView) whose state the
  // backend decides — sin datos (aviso + escanear), hay datos (property list + Edit) or editor.
  @Section(value = "Documento", zone = "main")
  @Inline
  @Label("")
  DocumentoView documento;

  @Colspan(2)
  @Section(value = "", zone = "main", frameless = true)
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
                .style("width: 100%;")
            .build();
      };

  @Section(value = "", zone = "side")
          @Text(container = TextContainer.h4)
  String prefHeader = "Preferencias";

    @Label("")
    Callable<Component> prefs = () -> {
        var view = FrontOffice.stayView(stayId);
        var guest = view.guest();

        return BulletedList.builder()
                .items(guest.preferences().stream().map(Preference::text).toList())
                .build();
    };

  @SeparatorBefore
  @Text(container = TextContainer.h4)
  String lastStayHeader = "ÚLTIMA ESTANCIA";

  @Text(noMargins = true)
  String lastStayMainInfo = "xxx";

  @Text(size = TextSize.xs, noMargins = true)
  String lastStaySecondaryInfo = "yyy";


    @Label("")
  Callable<Component> quejas =
      () -> {
        var view = FrontOffice.stayView(stayId);
        var guest = view.guest();
        if (guest.complaints() > 0) {
          return Notice.builder()
              .text(guest.complaints() + " quejas pendientes")
              .theme("danger")
                  .slim(true)
                  .fullWidth(true)
              .build();
        }
        return new VerticalLayout();
      };

    @Text(size = TextSize.xs, noMargins = true)
    String historyInfo = "yyy";

    public IdentidadStep load(HttpRequest httpRequest) {
        // this instance is created fresh on every request — derive the stay from the route
        stayId = GuestHeaders.idFromRoute(httpRequest, "checkin");
        var view = FrontOffice.stayView(stayId);
        var guest = view.guest();
        lastStayMainInfo = guest.lastStaySummary();
        lastStaySecondaryInfo = guest.lastStayComplementaryInfo();
        historyInfo = guest.stays() + " estancias · Cliente desde " + (LocalDate.now().getYear() - guest.yearsAsClient() - 1);
        // the Documento island receives its context (stayId) through the embedded field's
        // seeded initialData — the scan/edit lifecycle is fully owned by DocumentoView
        documento = new DocumentoView();
        documento.setStayId(stayId);
        return this;
    }
}
