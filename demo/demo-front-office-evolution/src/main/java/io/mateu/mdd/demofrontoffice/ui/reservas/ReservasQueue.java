package io.mateu.mdd.demofrontoffice.ui.reservas;

import io.mateu.mdd.demofrontoffice.domain.stay.Stay;
import io.mateu.mdd.demofrontoffice.domain.stay.StayStatus;
import io.mateu.mdd.demofrontoffice.ui.checkin.CheckInWizard;
import io.mateu.mdd.demofrontoffice.ui.checkout.CheckOutDetail;
import io.mateu.mdd.demofrontoffice.ui.common.DetailIsland;
import io.mateu.mdd.demofrontoffice.ui.common.FrontOffice;
import io.mateu.mdd.demofrontoffice.ui.encasa.EnCasaDetail;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.AutoSave;
import io.mateu.uidl.annotations.Colspan;
import io.mateu.uidl.annotations.FormLayout;
import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.SubscribeTo;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.Chip;
import io.mateu.uidl.data.EmptyState;
import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.data.QueueGroup;
import io.mateu.uidl.data.QueueItem;
import io.mateu.uidl.data.TaskQueue;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.Callable;
import lombok.Getter;
import lombok.Setter;

/**
 * Reservas unificadas (sustituye a los menús Check-In / Check-Out / En Casa): un único buscador y
 * un listado de TODAS las reservas con su estado por línea — "Llega hoy/mañana/&lt;fecha&gt;" para
 * las pendientes, "Sale hoy/mañana/&lt;fecha&gt;" para las in house, "Salió &lt;fecha&gt;" para
 * las salidas. El clic abre el detalle según el estado (wizard de check-in / 360 de en casa /
 * folio de check-out); las in house llevan además la opción de línea "Check-out" (y el 360 emite
 * el evento {@code checkout-solicitado} desde su toolbar) que fuerza la pantalla de check-out.
 */
@Getter
@Setter
@Route(value = "/reservas", parentRoute = "")
@Title("Reservas")
@FormLayout(columns = 3)
@AutoSave(action = "filtrar", debounceMillis = 400)
@SubscribeTo(event = "checkout-solicitado", action = "checkoutGuest")
public class ReservasQueue {

  private static final DateTimeFormatter FECHA =
      DateTimeFormatter.ofPattern("d MMM", Locale.forLanguageTag("es"));

  @Hidden String seleccionado;
  @Hidden boolean forzarCheckout;

  // el buscador único — banda superior a todo el ancho
  @Section(value = "", frameless = true)
  @Label("Buscar reserva (huésped, habitación, estado…)")
  String buscar;

  // listado a la izquierda, el detalle según estado como isla a la derecha
  @Colspan(3)
  @Section(value = " ", frameless = true)
  @Label("")
  Callable<Component> contenido =
      () -> {
        var stays =
            FrontOffice.stays().findAll().stream()
                .filter(this::matches)
                .sorted(
                    Comparator.comparing((Stay s) -> s.status().ordinal())
                        .thenComparing(s -> s.status() == StayStatus.ARRIVING ? s.checkIn() : s.checkOut()))
                .toList();
        var queue =
            TaskQueue.builder()
                .actionId("openGuest")
                .style("flex: 0 0 26%; min-width: 300px;")
                .groups(
                    List.of(
                        QueueGroup.builder()
                            .label("Reservas — " + stays.size())
                            .items(
                                stays.stream()
                                    .map(s -> item(s, s.id().equals(seleccionado)))
                                    .toList())
                            .build()))
                .build();
        return HorizontalLayout.builder()
            .spacing(true)
            .fullWidth(true)
            .style("align-items: flex-start; gap: 1.5rem; width: 100%;")
            .content(List.of(queue, detail()))
            .build();
      };

  private Component detail() {
    if (seleccionado == null) {
      return EmptyState.builder()
          .icon("🏨")
          .title("Selecciona una reserva")
          .description(
              "Se abrirá su check-in, su 360 de en casa o su check-out según el estado.")
          .style("flex: 1; margin-top: 3rem;")
          .build();
    }
    var stay = FrontOffice.stays().findById(seleccionado).orElse(null);
    if (stay == null) {
      return EmptyState.builder().icon("🏨").title("Reserva no encontrada").build();
    }
    return switch (stay.status()) {
      case ARRIVING -> DetailIsland.of("/checkin/" + seleccionado, CheckInWizard.class);
      case IN_HOUSE ->
          forzarCheckout
              ? DetailIsland.of("/checkout/" + seleccionado, CheckOutDetail.class)
              : DetailIsland.of("/encasa/" + seleccionado, EnCasaDetail.class);
      case DEPARTED -> DetailIsland.of("/checkout/" + seleccionado, CheckOutDetail.class);
    };
  }

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
                + stay.roomType()
                + " "
                + estadoLabel(stay))
            .toLowerCase();
    for (var word : buscar.trim().toLowerCase().split("\\s+")) {
      if (!hay.contains(word)) {
        return false;
      }
    }
    return true;
  }

  QueueItem item(Stay stay, boolean selected) {
    var guest = FrontOffice.guests().findById(stay.guestId()).orElseThrow();
    var builder =
        QueueItem.builder()
            .id(stay.id())
            .title(guest.name())
            .caption("Hab " + stay.roomNumber() + " · " + stay.nights() + "N")
            .badges(
                List.of(
                    estadoChip(stay),
                    Chip.builder().label(guest.tier().name()).color("contrast").build()))
            .selected(selected);
    if (stay.status() == StayStatus.IN_HOUSE) {
      // la opción de línea solo para las in house: fuerza la pantalla de check-out
      builder.actionLabel("Check-out").actionId("checkoutGuest");
    }
    return builder.build();
  }

  // ── estado por línea ─────────────────────────────────────────────────────────

  static Chip estadoChip(Stay stay) {
    var today = LocalDate.now();
    return switch (stay.status()) {
      case ARRIVING ->
          Chip.builder()
              .label(estadoLabel(stay))
              .color(stay.checkIn().isAfter(today) ? "contrast" : "warning")
              .build();
      case IN_HOUSE ->
          Chip.builder()
              .label(estadoLabel(stay))
              .color(stay.checkOut().isEqual(today) ? "warning" : "success")
              .build();
      case DEPARTED -> Chip.builder().label(estadoLabel(stay)).color("contrast").build();
    };
  }

  static String estadoLabel(Stay stay) {
    var today = LocalDate.now();
    return switch (stay.status()) {
      case ARRIVING -> relativo("Llega", stay.checkIn(), today);
      case IN_HOUSE -> relativo("Sale", stay.checkOut(), today);
      case DEPARTED -> "Salió " + FECHA.format(stay.checkOut());
    };
  }

  private static String relativo(String verbo, LocalDate fecha, LocalDate today) {
    if (fecha.isEqual(today)) {
      return verbo + " hoy";
    }
    if (fecha.isEqual(today.plusDays(1))) {
      return verbo + " mañana";
    }
    return verbo + " " + FECHA.format(fecha);
  }

  // ── acciones ─────────────────────────────────────────────────────────────────

  @Action
  Object openGuest(HttpRequest httpRequest) {
    seleccionado = String.valueOf(httpRequest.runActionRq().parameters().get("_item"));
    forzarCheckout = false;
    return this;
  }

  /** Desde la opción de línea del listado o desde el toolbar del 360 (evento de bus). */
  @Action
  Object checkoutGuest(HttpRequest httpRequest) {
    var item = httpRequest.runActionRq().parameters().get("_item");
    if (item != null) {
      seleccionado = String.valueOf(item);
    }
    forzarCheckout = true;
    return this;
  }

  @Action
  Object filtrar() {
    return this;
  }
}
