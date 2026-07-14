package io.mateu.mdd.demofrontoffice.ui.checkin;

import io.mateu.core.infra.declarative.orchestrators.wizard.WizardStep;
import io.mateu.mdd.demofrontoffice.data.HotelData;
import io.mateu.mdd.demofrontoffice.ui.common.GuestHeaders;
import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.FormLayout;
import io.mateu.uidl.data.AddOnPicker;
import io.mateu.uidl.fluent.Component;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.concurrent.Callable;
import lombok.Getter;
import lombok.Setter;

/** Step 3 — Extras: priced stay add-ons with a live running total. */
@Getter
@Setter
@FormLayout(columns = 1)
public class ExtrasStep implements WizardStep {

  @Hidden String guestId;

  @Hidden String extrasSeleccionados = "";

  @Hidden double extrasTotal;

  @Label("")
  Callable<Component> header = () -> GuestHeaders.arrivalHeader(guestId);

  @Label("")
  Callable<Component> extrasEstancia =
      () ->
          AddOnPicker.builder()
              .style("width: 100%;")
              .totalLabel("Añadidos")
              .currency("€")
              .actionId("extrasChanged")
              .items(HotelData.addOns(addedIds()))
              .build();

  Set<String> addedIds() {
    var ids = new LinkedHashSet<String>();
    if (extrasSeleccionados != null && !extrasSeleccionados.isBlank()) {
      for (var id : extrasSeleccionados.split(",")) {
        if (!id.isBlank()) {
          ids.add(id.trim());
        }
      }
    }
    return ids;
  }
}
