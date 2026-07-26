package io.mateu.mdd.demofrontoffice.ui.reservas;

import io.mateu.mdd.demofrontoffice.domain.room.HousekeepingStatus;
import io.mateu.mdd.demofrontoffice.domain.stay.IncidentStatus;
import io.mateu.mdd.demofrontoffice.domain.stay.Stay;
import io.mateu.mdd.demofrontoffice.domain.stay.StayStatus;
import io.mateu.mdd.demofrontoffice.ui.common.FrontOffice;
import io.mateu.mdd.demofrontoffice.ui.common.GuestHeaders;
import io.mateu.uidl.annotations.FormLayout;
import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.Ledger;
import io.mateu.uidl.data.LedgerLine;
import io.mateu.uidl.data.Meter;
import io.mateu.uidl.data.Notice;
import io.mateu.uidl.data.StatusItem;
import io.mateu.uidl.data.StatusList;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.UserTrigger;
import io.mateu.uidl.interfaces.ActionHandler;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.PostHydrationHandler;
import io.mateu.uidl.interfaces.ToolbarSupplier;
import java.net.URI;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.Callable;
import lombok.Getter;
import lombok.Setter;

/**
 * Reserva 360 — la pantalla ÚNICA de una reserva, sea cual sea su estado: el header del huésped,
 * el resumen de la estancia, los huéspedes con su estado documental y, según el estado, el balance
 * e incidencias (in house) o el folio cerrado (salida). Las ACCIONES del toolbar cambian por
 * estado: "Iniciar check-in" (por llegar) abre el wizard que pide SOLO la información que falta;
 * "Check-out" (in house) abre el folio.
 */
@Getter
@Setter
@Route(value = "/reserva/:id", parentRoute = "")
@Title("Reserva")
@FormLayout(columns = 1)
public class ReservaOverview implements PostHydrationHandler, ToolbarSupplier, ActionHandler {

  private static final DateTimeFormatter DAY =
      DateTimeFormatter.ofPattern("d MMM", Locale.forLanguageTag("es"));

  @Hidden String stayId;

  // ── header del huésped (por estado) ──────────────────────────────────────────
  @Section(value = "", frameless = true)
  @Label("")
  Callable<Component> header =
      () ->
          switch (stay().status()) {
            case ARRIVING -> GuestHeaders.arrivalHeader(stayId);
            case IN_HOUSE -> GuestHeaders.inHouseHeader(stayId);
            case DEPARTED -> GuestHeaders.departureHeader(stayId);
          };

  // ── resumen de la estancia (property list) ───────────────────────────────────
  @Section(value = "Resumen", propertyList = true)
  @Label("Huésped principal")
  String huespedPrincipal;

  @Label("Habitación")
  String habitacion;

  @Label("Estancia")
  String estancia;

  @Label("Régimen")
  String regimen;

  @Label("Estado")
  String estado;

  // ── huéspedes y estado documental ────────────────────────────────────────────
  @Section("Huéspedes en la habitación")
  @Label("")
  Callable<Component> huespedes =
      () -> {
        var view = FrontOffice.stayView(stayId);
        var stay = view.stay();
        var guest = view.guest();
        var items = new ArrayList<StatusItem>();
        items.add(paxItem("principal", guest.name(),
            guest.document() != null && !guest.document().isBlank()
                ? "Doc " + guest.document() + " · Adulto" : "Adulto",
            guest.identityComplete()));
        for (var companion : stay.companions()) {
          items.add(paxItem(companion.companionId(), companion.name(), companion.description(),
              companion.identityComplete()));
        }
        for (int i = 2 + stay.companions().size(); i <= stay.pax(); i++) {
          items.add(paxItem("pax" + i, "Acompañante " + i, "Pendiente de registro", false));
        }
        return StatusList.builder().items(items).compact(true).frameless(true)
            .style("width: 100%;").build();
      };

  // ── lo que aplique según el estado ───────────────────────────────────────────
  @Section(value = " ", frameless = true)
  @Label("")
  Callable<Component> porEstado =
      () -> {
        var stay = stay();
        return switch (stay.status()) {
          case ARRIVING -> paraLlegada(stay);
          case IN_HOUSE -> paraInHouse(stay);
          case DEPARTED -> paraSalida(stay);
        };
      };

  private Component paraLlegada(Stay stay) {
    var faltan = paxPendientes(stay);
    var habitacionLista = habitacionInspeccionada(stay);
    var avisos = new ArrayList<Component>();
    avisos.add(
        Notice.builder()
            .theme(faltan == 0 ? "success" : "warning")
            .text(faltan == 0
                ? "Documentación completa — todo listo para el check-in"
                : "Falta la documentación de " + faltan + " pax — el check-in la pedirá")
            .build());
    avisos.add(
        Notice.builder()
            .theme(habitacionLista ? "success" : "info")
            .text(habitacionLista
                ? "Hab " + stay.roomNumber() + " inspeccionada y lista"
                : "La habitación se elegirá durante el check-in")
            .build());
    return VerticalLayout.builder().content(avisos).style("width: 100%; gap: .5rem;").build();
  }

  private Component paraInHouse(Stay stay) {
    var view = FrontOffice.stayView(stayId);
    var folio = view.folio();
    var balance = folio == null ? 0d : folio.balance().doubleValue();
    var preauth = folio == null || folio.preauthorized() == null
        ? Math.max(balance, 1) : folio.preauthorized().doubleValue();
    var content = new ArrayList<Component>();
    content.add(
        Meter.builder()
            .label("BALANCE ACTUAL")
            .value(balance)
            .max(preauth)
            .unit("€")
            .caption(Math.round(balance / preauth * 100) + "% de la preautorización consumido")
            .warnAt(preauth * 0.8)
            .dangerAt(preauth * 0.95)
            .build());
    var abiertas = stay.incidents().stream()
        .filter(i -> i.status() != IncidentStatus.RESOLVED).toList();
    if (!abiertas.isEmpty()) {
      content.add(
          StatusList.builder()
              .items(abiertas.stream()
                  .map(i -> StatusItem.builder()
                      .id(i.code()).icon(i.icon()).title(i.title())
                      .description(i.description())
                      .status(i.status() == IncidentStatus.IN_PROGRESS ? "En curso" : "Abierta")
                      .statusColor(i.status() == IncidentStatus.IN_PROGRESS ? "warning" : "danger")
                      .build())
                  .toList())
              .compact(true)
              .build());
    }
    return VerticalLayout.builder().content(content).style("width: 100%; gap: 1rem;").build();
  }

  private Component paraSalida(Stay stay) {
    var view = FrontOffice.stayView(stayId);
    var folio = view.folio();
    var content = new ArrayList<Component>();
    content.add(
        Notice.builder().theme("info")
            .text("Salió el " + DAY.format(stay.checkOut()) + " — folio cerrado")
            .build());
    if (folio != null) {
      content.add(
          Ledger.builder()
              .currency("€")
              .totalLabel("Total")
              .lines(folio.lines().stream()
                  .map(l -> LedgerLine.builder()
                      .concept(l.concept())
                      .amount(l.amount() == null ? null : l.amount().doubleValue())
                      .included(l.included())
                      .includedLabel(l.includedLabel())
                      .build())
                  .toList())
              .total(folio.balance().doubleValue())
              .build());
    }
    return VerticalLayout.builder().content(content).style("width: 100%; gap: 1rem;").build();
  }

  // ── toolbar por estado ───────────────────────────────────────────────────────
  @Override
  public Collection<UserTrigger> toolbar() {
    return switch (stay().status()) {
      case ARRIVING -> List.of(
          Button.builder().label("Iniciar check-in").actionId("iniciarCheckin")
              .buttonStyle(io.mateu.uidl.data.ButtonStyle.primary).build());
      case IN_HOUSE -> List.of(
          Button.builder().label("Check-out").actionId("irCheckout").buttonStyle(io.mateu.uidl.data.ButtonStyle.primary).build(),
          Button.builder().label("Añadir cargo").actionId("anadirCargo").build(),
          Button.builder().label("Mensaje huésped").actionId("mensajeHuesped").build());
      case DEPARTED -> List.of(
          Button.builder().label("Ver folio / cobros").actionId("irCheckout").build());
    };
  }

  @Override
  public boolean supportsAction(String actionId) {
    return List.of("iniciarCheckin", "irCheckout", "anadirCargo", "mensajeHuesped")
        .contains(actionId);
  }

  @Override
  public Object handleAction(String actionId, HttpRequest httpRequest) {
    return switch (actionId) {
      case "iniciarCheckin" -> URI.create("/checkin/" + stayId);
      case "irCheckout" -> URI.create("/checkout/" + stayId);
      case "anadirCargo" -> new io.mateu.uidl.data.Message(
          "Aquí se añadiría un cargo al folio (demo)");
      case "mensajeHuesped" -> new io.mateu.uidl.data.Message(
          "Aquí se enviaría un mensaje al huésped (demo)");
      default -> null;
    };
  }

  // ── ciclo de vida / helpers ──────────────────────────────────────────────────
  @Override
  public void onHydrated(HttpRequest httpRequest) {
    if (stayId == null || stayId.isBlank()) {
      stayId = io.mateu.mdd.demofrontoffice.ui.common.GuestHeaders.idFromRoute(
          httpRequest, "reserva");
    }
    var view = FrontOffice.stayView(stayId);
    var stay = view.stay();
    huespedPrincipal = view.guest().name();
    habitacion = stay.roomNumber() + " — " + stay.roomType();
    estancia = DAY.format(stay.checkIn()) + " → " + DAY.format(stay.checkOut())
        + " · " + stay.nights() + "N · " + stay.pax() + "pax";
    regimen = stay.board();
    estado = ReservasListing.estadoLabel(stay);
  }

  private Stay stay() {
    return FrontOffice.stays().findById(stayId).orElseThrow();
  }

  static StatusItem paxItem(String id, String title, String description, boolean complete) {
    return StatusItem.builder()
        .id(id)
        .avatar(initials(title))
        .title(title)
        .description(description)
        .status(complete ? "✓ Identidad verificada" : "Documentación pendiente")
        .statusColor(complete ? "success" : "warning")
        .build();
  }

  static String initials(String name) {
    var parts = name.trim().split("\\s+");
    var sb = new StringBuilder();
    for (var part : parts) {
      if (sb.length() < 2 && !part.isBlank()) {
        sb.append(Character.toUpperCase(part.charAt(0)));
      }
    }
    return sb.toString();
  }

  boolean habitacionInspeccionada(Stay stay) {
    return FrontOffice.rooms().findByNumber(stay.roomNumber())
        .map(room -> room.housekeeping() == HousekeepingStatus.INSPECTED)
        .orElse(false);
  }

  public static int paxPendientes(Stay stay) {
    int faltan = 0;
    var view = FrontOffice.stayView(stay.id());
    if (!view.guest().identityComplete()) {
      faltan++;
    }
    for (var companion : stay.companions()) {
      if (!companion.identityComplete()) {
        faltan++;
      }
    }
    faltan += Math.max(0, stay.pax() - 1 - stay.companions().size());
    return faltan;
  }
}
