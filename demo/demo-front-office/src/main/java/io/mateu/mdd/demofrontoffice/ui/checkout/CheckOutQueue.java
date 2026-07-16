package io.mateu.mdd.demofrontoffice.ui.checkout;

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
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Callable;
import lombok.Getter;
import lombok.Setter;

/**
 * Check-Out landing, master-detail: the filters band across the top, the departures queue on the
 * left (today's departures first), and the selected stay's folio/payment as an embedded island on
 * the right.
 */
@Getter
@Setter
@Route(value = "/checkout", parentRoute = "")
@Title("Check-Out")
@Style(StyleConstants.FULL_WIDTH_WITH_PADDING)
@FormLayout(columns = 3)
@AutoSave(action = "filtrar", debounceMillis = 400)
public class CheckOutQueue {

  @Hidden String seleccionado;

  // filters band — full width across the top
  @Section(value = "", frameless = true)
  @Label("Buscar salida (huésped, habitación…)")
  String buscar;

  @Label("Solo salidas de hoy")
  boolean soloHoy;

  // list on the left, the selected stay's folio island on the right
  @Colspan(3)
  @Section(value = " ", frameless = true)
  @Label("")
  Callable<Component> contenido =
      () -> {
        var today = LocalDate.now();
        var inHouse = FrontOffice.stays().findInHouse().stream().filter(this::matches).toList();
        var hoy = inHouse.stream().filter(s -> !s.checkOut().isAfter(today)).toList();
        var proximas =
            soloHoy ? List.<Stay>of() : inHouse.stream().filter(s -> s.checkOut().isAfter(today)).toList();
        var groups = new ArrayList<QueueGroup>();
        if (!hoy.isEmpty()) {
          groups.add(
              QueueGroup.builder()
                  .label("Salida hoy")
                  .items(hoy.stream().map(s -> item(s, true, s.id().equals(seleccionado))).toList())
                  .build());
        }
        if (!proximas.isEmpty()) {
          groups.add(
              QueueGroup.builder()
                  .label("Próximas salidas")
                  .items(
                      proximas.stream()
                          .map(s -> item(s, false, s.id().equals(seleccionado)))
                          .toList())
                  .build());
        }
        var queue =
            TaskQueue.builder()
                .actionId("openGuest")
                .style("flex: 0 0 26%; min-width: 300px;")
                .groups(groups)
                .build();
        var detail =
            seleccionado == null
                ? (Component)
                    EmptyState.builder()
                        .icon("🧳")
                        .title("Selecciona un huésped")
                        .description("Elige una salida de la lista para revisar su folio y cobrar.")
                        .style("flex: 1; margin-top: 3rem;")
                        .build()
                : DetailIsland.of("/checkout/" + seleccionado, CheckOutDetail.class);
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

  static QueueItem item(Stay stay, boolean departingToday, boolean selected) {
    var guest = FrontOffice.guests().findById(stay.guestId()).orElseThrow();
    var badges = new ArrayList<Chip>();
    if (departingToday) {
      badges.add(Chip.builder().label("SALIDA HOY").color("warning").build());
    }
    badges.add(Chip.builder().label(guest.tier().name()).color("contrast").build());
    return QueueItem.builder()
        .id(stay.id())
        .title(guest.name())
        .caption("Hab " + stay.roomNumber() + " · " + stay.nights() + "N")
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
