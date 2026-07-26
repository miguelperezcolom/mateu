package io.mateu.mdd.demofrontoffice.ui.checkin;

import io.mateu.core.infra.declarative.orchestrators.wizard.WizardStep;
import io.mateu.mdd.demofrontoffice.domain.catalog.AddOnCatalogItem;
import io.mateu.mdd.demofrontoffice.ui.common.FrontOffice;
import io.mateu.mdd.demofrontoffice.ui.common.GuestHeaders;
import io.mateu.uidl.annotations.FormLayout;
import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.data.AddOn;
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

  @Hidden String stayId;

  @Hidden String extrasSeleccionados = "";

  @Hidden double extrasTotal;

  @Label("")
  Callable<Component> header = () -> GuestHeaders.arrivalHeader(stayId);

  @Label("")
  Callable<Component> extrasEstancia =
      () ->
          AddOnPicker.builder()
              .style("width: 100%;")
              .totalLabel("Añadidos")
              .currency("€")
              .actionId("extrasChanged")
              .items(
                  FrontOffice.addOnCatalog().findAll().stream()
                      .map(item -> addOn(item, addedIds()))
                      .toList())
              .build();

  static AddOn addOn(AddOnCatalogItem item, Set<String> addedIds) {
    return AddOn.builder()
        .id(item.id())
        .icon(item.icon())
        .title(item.title())
        .description(item.description())
        .price(item.price() == null ? null : item.price().doubleValue())
        .unit(item.unit())
        .includedLabel(item.includedLabel())
        .added(addedIds.contains(item.id()))
        .build();
  }

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
