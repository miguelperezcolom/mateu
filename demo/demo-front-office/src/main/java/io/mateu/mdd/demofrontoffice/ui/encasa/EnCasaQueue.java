package io.mateu.mdd.demofrontoffice.ui.encasa;

import io.mateu.mdd.demofrontoffice.domain.stay.Stay;
import io.mateu.mdd.demofrontoffice.ui.common.DetailIsland;
import io.mateu.mdd.demofrontoffice.ui.common.FrontOffice;
import io.mateu.mdd.demofrontoffice.ui.common.GuestHeaders;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.AutoSave;
import io.mateu.uidl.annotations.Colspan;
import io.mateu.uidl.annotations.FormLayout;
import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.Chip;
import io.mateu.uidl.data.EmptyState;
import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.data.QueueGroup;
import io.mateu.uidl.data.QueueItem;
import io.mateu.uidl.data.TaskQueue;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Callable;
import lombok.Getter;
import lombok.Setter;

/**
 * En Casa landing, master-detail: the filters band across the top, the in-house guests queue on
 * the left, and the selected guest's 360 as an embedded island on the right.
 */
@Getter
@Setter
@Route(value = "/encasa", parentRoute = "")
@Title("En Casa")
@FormLayout(columns = 3)
@AutoSave(action = "filtrar", debounceMillis = 400)
public class EnCasaQueue {

  @Hidden String seleccionado;

  // filters band — full width across the top
  @Section(value = "", frameless = true)
  @Label("Buscar huésped (nombre, habitación…)")
  String buscar;

  @Label("Con incidencias abiertas")
  boolean conIncidencias;

  // list on the left, the selected guest's 360 island on the right
  @Colspan(3)
  @Section(value = " ", frameless = true)
  @Label("")
  Callable<Component> contenido =
      () -> {
        var inHouse = FrontOffice.stays().findInHouse().stream().filter(this::matches).toList();
        var queue =
            TaskQueue.builder()
                .actionId("openGuest")
                .style("flex: 0 0 26%; min-width: 300px;")
                .groups(
                    List.of(
                        QueueGroup.builder()
                            .label("En casa — " + inHouse.size() + " huéspedes")
                            .items(
                                inHouse.stream()
                                    .map(s -> item(s, s.id().equals(seleccionado)))
                                    .toList())
                            .build()))
                .build();
        var detail =
            seleccionado == null
                ? (Component)
                    EmptyState.builder()
                        .icon("🏡")
                        .title("Selecciona un huésped")
                        .description(
                            "Elige un huésped en casa para ver su 360: cuenta, incidencias e"
                                + " histórico.")
                        .style("flex: 1; margin-top: 3rem;")
                        .build()
                : DetailIsland.of("/encasa/" + seleccionado, EnCasaDetail.class);
        return HorizontalLayout.builder()
            .spacing(true)
            .fullWidth(true)
            .style("align-items: flex-start; gap: 1.5rem; width: 100%;")
            .content(List.of(queue, detail))
            .build();
      };

  boolean matches(Stay stay) {
    if (conIncidencias && stay.openIncidents() == 0) {
      return false;
    }
    if (buscar == null || buscar.isBlank()) {
      return true;
    }
    var guest = FrontOffice.guests().findById(stay.guestId()).orElse(null);
    var hay =
        ((guest != null ? guest.name() : "")
                + " "
                + stay.roomNumber()
                + " "
                + stay.roomType())
            .toLowerCase();
    for (var word : buscar.trim().toLowerCase().split("\\s+")) {
      if (!hay.contains(word)) {
        return false;
      }
    }
    return true;
  }

  static QueueItem item(Stay stay, boolean selected) {
    var guest = FrontOffice.guests().findById(stay.guestId()).orElseThrow();
    var badges = new ArrayList<Chip>();
    badges.add(Chip.builder().label(guest.tier().name()).color("contrast").build());
    if (stay.wishesTotal() > 0) {
      badges.add(Chip.builder().label(GuestHeaders.wishes(stay)).color("success").build());
    }
    if (stay.vipNote() != null) {
      badges.add(Chip.builder().label("VIP").color("warning").build());
    }
    if (stay.openIncidents() > 0) {
      badges.add(Chip.builder().label("Incidencia").color("error").build());
    }
    return QueueItem.builder()
        .id(stay.id())
        .title(guest.name())
        .caption("Hab " + stay.roomNumber() + " · " + stay.roomType())
        .badges(badges)
        .selected(selected)
        .build();
  }

  @Action
  Object openGuest(HttpRequest httpRequest) {
    seleccionado = String.valueOf(httpRequest.runActionRq().parameters().get("_item"));
    return this;
  }

  @Action
  Object filtrar() {
    return this;
  }
}
