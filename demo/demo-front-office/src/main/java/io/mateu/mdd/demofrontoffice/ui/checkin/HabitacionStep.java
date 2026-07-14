package io.mateu.mdd.demofrontoffice.ui.checkin;

import io.mateu.core.infra.declarative.orchestrators.wizard.WizardStep;
import io.mateu.mdd.demofrontoffice.data.HotelData;
import io.mateu.mdd.demofrontoffice.ui.common.GuestHeaders;
import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.FormLayout;
import io.mateu.uidl.data.Badge;
import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.data.OfferCard;
import io.mateu.uidl.data.ResourceGrid;
import io.mateu.uidl.fluent.Component;
import java.util.List;
import java.util.concurrent.Callable;
import lombok.Getter;
import lombok.Setter;

/** Step 2 — Habitación: room assignment grid plus the current-room vs upgrade offer cards. */
@Getter
@Setter
@FormLayout(columns = 1)
public class HabitacionStep implements WizardStep {

  @Hidden String guestId;

  @Hidden String habitacionSeleccionada = "1204";

  @Label("")
  Callable<Component> header = () -> GuestHeaders.arrivalHeader(guestId);

  @Label("")
  Callable<Component> preferenciasCliente =
      () ->
          HorizontalLayout.builder()
              .spacing(true)
              .wrap(true)
              .style("margin-bottom: 0.75rem;")
              .content(
                  HotelData.arrival(guestId).prefs().stream()
                      .map(pref -> (Component) Badge.builder().text(pref).pill(true).build())
                      .toList())
              .build();

  @Label("")
  Callable<Component> habitaciones =
      () ->
          ResourceGrid.builder()
              .style("width: 100%;")
              .actionId("pickRoom")
              .columns(4)
              .recommendedLabel("RECOMENDADA")
              .items(HotelData.rooms(habitacionSeleccionada))
              .build();

  @Label("")
  Callable<Component> ofertaUpgrade =
      () ->
          HorizontalLayout.builder()
              .spacing(true)
              .wrap(true)
              .content(
                  List.of(
                      OfferCard.builder()
                          .id("asignada")
                          .style("flex: 1 1 340px; min-width: 320px;")
                          .tag("HABITACIÓN ASIGNADA")
                          .title("Ocean Suite")
                          .subtitle("Hab. " + habitacionSeleccionada + " · Planta 12")
                          .features(List.of("42 m²", "Vista mar lateral", "Cama King", "Balcón"))
                          .current(true)
                          .currentLabel("✓ Incluida en tu reserva")
                          .build(),
                      OfferCard.builder()
                          .id("upgrade")
                          .style("flex: 1 1 340px; min-width: 320px;")
                          .tag("UPGRADE DISPONIBLE")
                          .title("Master Oceanfront Suite")
                          .subtitle("Planta 14 · Primera línea")
                          .features(
                              List.of(
                                  "68 m²", "Vista mar frontal", "Terraza + jacuzzi", "Sofá lounge"))
                          .priceLabel("+ € 65 / noche")
                          .actionLabel("Mejorar a esta habitación")
                          .actionId("upgrade")
                          .build()))
              .build();
}
