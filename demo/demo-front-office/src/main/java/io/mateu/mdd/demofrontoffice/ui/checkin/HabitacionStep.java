package io.mateu.mdd.demofrontoffice.ui.checkin;

import io.mateu.core.infra.declarative.orchestrators.wizard.WizardStep;
import io.mateu.mdd.demofrontoffice.domain.room.HousekeepingStatus;
import io.mateu.mdd.demofrontoffice.domain.room.Room;
import io.mateu.mdd.demofrontoffice.ui.common.FrontOffice;
import io.mateu.mdd.demofrontoffice.ui.common.GuestHeaders;
import io.mateu.uidl.annotations.FormLayout;
import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.data.Badge;
import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.data.OfferCard;
import io.mateu.uidl.data.ResourceGrid;
import io.mateu.uidl.data.ResourceItem;
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

  @Hidden String stayId;

  @Hidden String habitacionSeleccionada;

  @Label("")
  Callable<Component> header = () -> GuestHeaders.arrivalHeader(stayId);

  @Label("")
  Callable<Component> preferenciasCliente =
      () ->
          HorizontalLayout.builder()
              .spacing(true)
              .wrap(true)
              .style("margin-bottom: 0.75rem;")
              .content(
                  FrontOffice.stayView(stayId).guest().preferences().stream()
                      .map(
                          pref -> (Component) Badge.builder().text(pref.text()).pill(true).build())
                      .toList())
              .build();

  @Label("")
  Callable<Component> habitaciones =
      () -> {
        var stay = FrontOffice.stayView(stayId).stay();
        var floor = FrontOffice.rooms().findByFloor(12);
        return ResourceGrid.builder()
            .style("width: 100%;")
            .actionId("pickRoom")
            .columns(4)
            .recommendedLabel("RECOMENDADA")
            .items(
                floor.stream()
                    .map(room -> item(room, stay.roomNumber(), habitacionSeleccionada))
                    .toList())
            .build();
      };

  static ResourceItem item(Room room, String reservedRoom, String selectedRoom) {
    var occupied = !room.assignable();
    return ResourceItem.builder()
        .id(room.number())
        .title(room.number())
        .subtitle(room.type() != null ? room.type() : occupied ? "Ocupada" : "Libre")
        .statusLabel(housekeepingLabel(room.housekeeping()))
        .statusColor(room.housekeeping() == HousekeepingStatus.DIRTY ? "contrast" : "success")
        .note(room.maintenanceNote())
        .noteColor(room.maintenanceNote() != null ? "error" : null)
        .disabled(occupied)
        .recommended(room.number().equals(reservedRoom))
        .selected(room.number().equals(selectedRoom))
        .build();
  }

  static String housekeepingLabel(HousekeepingStatus status) {
    return switch (status) {
      case DIRTY -> "Sucia";
      case CLEAN -> "Limpia";
      case INSPECTED -> "Inspeccionada";
    };
  }

  @Label("")
  Callable<Component> ofertaUpgrade =
      () -> {
        var stay = FrontOffice.stayView(stayId).stay();
        var selected =
            habitacionSeleccionada != null ? habitacionSeleccionada : stay.roomNumber();
        var floor =
            FrontOffice.rooms().findByNumber(selected).map(Room::floor).map(String::valueOf)
                .orElse(selected.length() >= 2 ? selected.substring(0, 2) : selected);
        return HorizontalLayout.builder()
            .spacing(true)
            .wrap(true)
            .content(
                List.of(
                    OfferCard.builder()
                        .id("asignada")
                        .style("flex: 1 1 340px; min-width: 320px;")
                        .tag("HABITACIÓN ASIGNADA")
                        .title(stay.roomType())
                        .subtitle("Hab. " + selected + " · Planta " + floor)
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
      };
}
