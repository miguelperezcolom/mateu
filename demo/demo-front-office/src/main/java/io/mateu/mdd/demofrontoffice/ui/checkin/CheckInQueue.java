package io.mateu.mdd.demofrontoffice.ui.checkin;

import io.mateu.mdd.demofrontoffice.domain.stay.Stay;
import io.mateu.mdd.demofrontoffice.ui.common.DetailIsland;
import io.mateu.mdd.demofrontoffice.ui.common.FrontOffice;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.AutoSave;
import io.mateu.uidl.annotations.Colspan;
import io.mateu.uidl.annotations.FormLayout;
import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Style;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.StyleConstants;
import io.mateu.uidl.data.Chip;
import io.mateu.uidl.data.EmptyState;
import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.data.QueueGroup;
import io.mateu.uidl.data.QueueItem;
import io.mateu.uidl.data.TaskQueue;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import java.util.concurrent.Callable;
import lombok.Getter;
import lombok.Setter;

/**
 * Check-In landing, master-detail: the filters band across the top, today's arrivals queue on the
 * left, and the selected guest's check-in wizard as an embedded island on the right — the queue
 * never leaves the screen.
 */
@Getter
@Setter
@Route(value = "/checkin", parentRoute = "")
@Title("Check-In")
@Style(StyleConstants.FULL_WIDTH_WITH_PADDING)
@FormLayout(columns = 3)
@AutoSave(action = "filtrar", debounceMillis = 400)
public class CheckInQueue {

  @Hidden String seleccionado;

  // filters band — full width across the top
  @Section(value = "", frameless = true)
  @Label("Buscar llegada (huésped, habitación, tipo…)")
  String buscar;

  // list on the left, the selected stay's wizard island on the right
  @Colspan(3)
  @Section(value = " ", frameless = true)
  @Label("")
  Callable<Component> contenido =
      () -> {
        var stays = FrontOffice.stays().findArrivals().stream().filter(this::matches).toList();
        var queue =
            TaskQueue.builder()
                .actionId("openGuest")
                .style("flex: 0 0 26%; min-width: 300px;")
                .groups(
                    List.of(
                        QueueGroup.builder()
                            .label("Llegadas hoy — " + stays.size())
                            .items(
                                stays.stream()
                                    .map(s -> item(s, s.id().equals(seleccionado)))
                                    .toList())
                            .build()))
                .build();
        var detail =
            seleccionado == null
                ? (Component)
                    EmptyState.builder()
                        .icon("🛎")
                        .title("Selecciona un huésped")
                        .description("Elige una llegada de la lista para iniciar su check-in.")
                        .style("flex: 1; margin-top: 3rem;")
                        .build()
                : DetailIsland.of("/checkin/" + seleccionado, CheckInWizard.class);
        return HorizontalLayout.builder()
            .spacing(true)
            .fullWidth(true)
            .style("align-items: flex-start; gap: 1.5rem; width: 100%;")
            .content(List.of(queue, detail))
            .build();
      };

  boolean matches(Stay stay) {
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
    return QueueItem.builder()
        .id(stay.id())
        .title(guest.name())
        .caption("Hab " + stay.roomNumber() + " · " + stay.nights() + "N")
        .badges(List.of(Chip.builder().label(guest.tier().name()).color("contrast").build()))
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
