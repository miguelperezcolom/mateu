package io.mateu.mdd.demofrontoffice.ui.reservas;

import io.mateu.core.infra.declarative.Listing;
import io.mateu.mdd.demofrontoffice.domain.stay.Stay;
import io.mateu.mdd.demofrontoffice.ui.common.FrontOffice;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Trigger;
import io.mateu.uidl.annotations.TriggerType;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.interfaces.HttpRequest;
import java.net.URI;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

/**
 * Reservas como LISTADO simple (un crud, no un collection-detail): tabla con buscador de todas las
 * estancias, cada línea con su estado — "Llega hoy/mañana/&lt;fecha&gt;", "Sale
 * hoy/mañana/&lt;fecha&gt;", "Salió &lt;fecha&gt;". El clic de fila abre la reserva como PÁGINA
 * aparte según el estado: el wizard de check-in, el 360 de en casa o el folio de check-out (para
 * las in house, el check-out se lanza desde el toolbar del 360).
 */
@Route(value = "/reservas", parentRoute = "")
@Title("Reservas")
@Trigger(type = TriggerType.OnLoad, actionId = "search")
public class ReservasListing extends Listing<ReservasListing.Filtros, ReservasListing.Reserva> {

  private static final DateTimeFormatter FECHA =
      DateTimeFormatter.ofPattern("d MMM", Locale.forLanguageTag("es"));

  public static class Filtros {}

  public record Reserva(
      String id,
      @Label("Huésped") String huesped,
      @Label("Habitación") String habitacion,
      @Label("Noches") long noches,
      @Label("Estado") String estado,
      @Label("Tier") String tier) {}

  @Override
  public ListingData<Reserva> search(
      String searchText, Filtros filtros, Pageable pageable, HttpRequest httpRequest) {
    var rows =
        FrontOffice.stays().findAll().stream()
            .sorted(
                java.util.Comparator.comparing((Stay s) -> s.status().ordinal())
                    .thenComparing(
                        s ->
                            s.status() == io.mateu.mdd.demofrontoffice.domain.stay.StayStatus.ARRIVING
                                ? s.checkIn()
                                : s.checkOut()))
            .map(this::row)
            .filter(row -> matches(row, searchText))
            .toList();
    return ListingData.from(rows);
  }

  private Reserva row(Stay stay) {
    var guest = FrontOffice.guests().findById(stay.guestId()).orElseThrow();
    return new Reserva(
        stay.id(),
        guest.name(),
        "Hab " + stay.roomNumber() + " · " + stay.roomType(),
        stay.nights(),
        estadoLabel(stay),
        guest.tier().name());
  }

  private boolean matches(Reserva row, String searchText) {
    if (searchText == null || searchText.isBlank()) {
      return true;
    }
    var hay = (row.huesped() + " " + row.habitacion() + " " + row.estado() + " " + row.tier())
        .toLowerCase();
    for (var word : searchText.trim().toLowerCase().split("\\s+")) {
      if (!hay.contains(word)) {
        return false;
      }
    }
    return true;
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

  // ── clic de fila: abrir la reserva como página según su estado ───────────────

  @Override
  public boolean supportsAction(String actionId) {
    return "view".equals(actionId) || super.supportsAction(actionId);
  }

  @Override
  public Object handleAction(String actionId, HttpRequest httpRequest) {
    if ("view".equals(actionId)) {
      var id = String.valueOf(httpRequest.runActionRq().parameters().get("id"));
      var stay = FrontOffice.stays().findById(id).orElse(null);
      if (stay == null) {
        return null;
      }
      // ruta ÚNICA: la Reserva 360 muestra el estado y ofrece las acciones que tocan
      return URI.create("/reserva/" + id);
    }
    return super.handleAction(actionId, httpRequest);
  }
}
