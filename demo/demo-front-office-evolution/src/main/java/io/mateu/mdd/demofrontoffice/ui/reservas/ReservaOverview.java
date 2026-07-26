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
import io.mateu.mdd.demofrontoffice.domain.folio.Folio;
import io.mateu.mdd.demofrontoffice.domain.folio.FolioLine;
import io.mateu.mdd.demofrontoffice.domain.room.Room;
import io.mateu.uidl.annotations.AutoSave;
import io.mateu.uidl.data.BannerTheme;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.PageBanner;
import io.mateu.uidl.data.PaymentMethod;
import io.mateu.uidl.data.PaymentPicker;
import io.mateu.uidl.data.Text;
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
@AutoSave(action = "buscarCargos", debounceMillis = 350)
public class ReservaOverview implements PostHydrationHandler, ToolbarSupplier, ActionHandler {

  private static final DateTimeFormatter DAY =
      DateTimeFormatter.ofPattern("d MMM", Locale.forLanguageTag("es"));

  @Hidden String stayId;

  // ── modo CHECK-OUT (plegado de la antigua /checkout/:id dentro de la 360) ────
  @Hidden boolean modoCheckout;
  @Hidden String metodoPago = "card";
  @Hidden String cargoBusqueda;
  @Hidden String ultimaBusqueda;

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

  // ── modo check-out: folio + posteo de cargos + cobro (invisibles fuera del modo) ──
  @Section(value = "  ", frameless = true)
  @Label("")
  Callable<Component> checkoutFolio =
      () -> {
        if (!modoCheckout) {
          return new VerticalLayout();
        }
        var f = FrontOffice.stayView(stayId).folio();
        return VerticalLayout.builder()
            .style("width: 100%; gap: .5rem;")
            .content(List.of(
                Text.builder().text("Desglose folio").container(
                    io.mateu.uidl.data.TextContainer.h3).style("margin: 0;").build(),
                io.mateu.uidl.data.Ledger.builder()
                    .style("width: 100%;")
                    .currency("€")
                    .totalLabel("Total")
                    .lines(f == null ? List.of() : f.lines().stream()
                        .map(l -> LedgerLine.builder()
                            .concept(l.concept())
                            .amount(l.amount() == null ? null : l.amount().doubleValue())
                            .included(l.included())
                            .includedLabel(l.includedLabel())
                            .build())
                        .toList())
                    .total(f == null ? 0 : f.balance().doubleValue())
                    .build()))
            .build();
      };

  @Section(value = "   ", frameless = true)
  @Label("")
  Callable<Component> checkoutCargos =
      () -> {
        if (!modoCheckout) {
          return new VerticalLayout();
        }
        var content = new ArrayList<Component>();
        content.add(Text.builder().text("Postear cargo").container(
            io.mateu.uidl.data.TextContainer.h3).style("margin: 0;").build());
        content.add(FormField.builder()
            .id("cargoBusqueda")
            .label("Buscar por nombre o código")
            .dataType(FieldDataType.string)
            .style("width: 100%; max-width: 32rem;")
            .build());
        if (cargoBusqueda != null && !cargoBusqueda.isBlank()) {
          var busca = cargoBusqueda.trim().toLowerCase();
          var matches = FrontOffice.chargeCatalog().findAll().stream()
              .filter(item -> item.name().toLowerCase().contains(busca)
                  || item.code().toLowerCase().contains(busca))
              .toList();
          content.add(matches.isEmpty()
              ? Notice.builder().theme("warning")
                  .text("Sin coincidencias para \"" + cargoBusqueda + "\"").slim(true)
                  .fullWidth(true).build()
              : StatusList.builder()
                  .rowActionId("seleccionarCargo")
                  .compact(true)
                  .style("width: 100%;")
                  .items(matches.stream()
                      .map(item -> StatusItem.builder()
                          .id(item.code()).title(item.name()).description(item.code())
                          .status(GuestHeaders.euros(item.price())).statusColor("contrast")
                          .build())
                      .toList())
                  .build());
        }
        return VerticalLayout.builder().style("width: 100%; gap: .5rem;").content(content).build();
      };

  @Section(value = "    ", frameless = true)
  @Label("")
  Callable<Component> checkoutCobro =
      () -> {
        if (!modoCheckout) {
          return new VerticalLayout();
        }
        var f = FrontOffice.stayView(stayId).folio();
        return VerticalLayout.builder()
            .style("width: 100%; gap: .5rem;")
            .content(List.of(
                Text.builder().text("Cobro").container(
                    io.mateu.uidl.data.TextContainer.h3).style("margin: 0;").build(),
                PaymentPicker.builder()
                    .actionId("confirmPayment")
                    .methodActionId("cambiarMetodo")
                    .methods(List.of(
                        PaymentMethod.builder().id("card").label("Tarjeta").build(),
                        PaymentMethod.builder().id("cash").label("Efectivo").build(),
                        PaymentMethod.builder().id("points").label("Puntos").build()))
                    .selected(metodoPago)
                    .contextLabel("PREAUTORIZADO")
                    .contextValue(GuestHeaders.euros(f == null ? null : f.preauthorized()))
                    .confirmLabel("Confirmar — " + GuestHeaders.euros(GuestHeaders.balance(f)))
                    .build()))
            .build();
      };

  /** One row of the check-in operations checklist. */
  private record Op(
      String id, String icon, String title, String pendiente, String hecha,
      boolean done, String actionLabel, String actionId) {}

  /** The check-in operations of an arriving stay — completed and pending, with quick actions. */
  private List<Op> operaciones(Stay stay) {
    var ops = FrontOffice.checkInOps().of(stay.id());
    var faltan = paxPendientes(stay);
    var habitacionLista = habitacionInspeccionada(stay);
    return List.of(
        new Op("documentos", "🪪", "Datos de huéspedes",
            "Falta la documentación de " + faltan + " pax — escaneo de documento en el check-in",
            "Documentación de los " + stay.pax() + " pax completa",
            faltan == 0, "Completar", "iniciarCheckin"),
        new Op("habitacion", "🛏️", "Habitación",
            "Hab " + stay.roomNumber() + " pre-asignada · pendiente de inspección",
            "Hab " + stay.roomNumber() + " inspeccionada y lista",
            habitacionLista, null, null),
        new Op("wifi", "📶", "Tarjeta wifi",
            "Crear las credenciales de acceso del huésped",
            "Credenciales creadas y entregadas",
            ops.wifi(), "Crear", "opWifi"),
        new Op("llave", "🔑", "Llave / pulsera",
            "Grabar la llave o pulsera de la Hab " + stay.roomNumber(),
            "Llave / pulsera grabada",
            ops.llave(), "Grabar", "opLlave"),
        new Op("firma", "✍️", "Firma del registro",
            "Se enviará a la tablet durante el check-in",
            "Firmada por el huésped en la tablet",
            ops.firma(), null, null),
        new Op("cobro", "💳", "Cobro / preautorización",
            "Preautorizar " + GuestHeaders.euros(stay.total()) + " en el check-in",
            "Preautorización completada",
            ops.cobro(), null, null),
        new Op("extras", "🎁", "Ancillaries",
            "Ofrecer los extras opcionales en el check-in",
            "Selección de extras cerrada",
            ops.extras(), null, null));
  }

  private Component paraLlegada(Stay stay) {
    var lista = operaciones(stay);
    var hechas = (int) lista.stream().filter(Op::done).count();
    var banner =
        io.mateu.uidl.data.TaskProgress.builder()
            .label("Operaciones de check-in")
            .total(lista.size())
            .done(hechas)
            .build();
    var checklist =
        StatusList.builder()
            .compact(true)
            .frameless(true)
            .columns(3)
            .style("width: 100%;")
            .items(lista.stream()
                .map(op -> StatusItem.builder()
                    .id(op.id())
                    .avatar(op.icon())
                    .title(op.title())
                    .description(op.done() ? op.hecha() : op.pendiente())
                    .status(op.done() ? "✓ Hecha" : "Pendiente")
                    .statusColor(op.done() ? "success" : "warning")
                    .actionLabel(op.done() ? null : op.actionLabel())
                    .actionId(op.done() ? null : op.actionId())
                    .build())
                .toList())
            .build();
    return VerticalLayout.builder()
        .content(List.of(banner, checklist))
        .style("width: 100%; gap: .5rem;")
        .build();
  }

  private Component paraInHouse(Stay stay) {
    if (modoCheckout) {
      return new VerticalLayout(); // en modo check-out mandan el folio y el cobro
    }
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
    if (modoCheckout) {
      return List.of(Button.builder().label("Volver a la reserva").actionId("volverReserva").build());
    }
    return switch (stay().status()) {
      case ARRIVING -> List.of(
          Button.builder().label("Confirmar check-in").actionId("iniciarCheckin")
              .buttonStyle(io.mateu.uidl.data.ButtonStyle.primary).build());
      case IN_HOUSE -> List.of(
          Button.builder().label("Check-out").actionId("irCheckout")
              .buttonStyle(io.mateu.uidl.data.ButtonStyle.primary).build(),
          Button.builder().label("Mensaje huésped").actionId("mensajeHuesped").build());
      case DEPARTED -> List.of();
    };
  }

  @Override
  public boolean supportsAction(String actionId) {
    return List.of("iniciarCheckin", "irCheckout", "volverReserva", "mensajeHuesped",
            "opWifi", "opLlave",
            "buscarCargos", "seleccionarCargo", "cambiarMetodo", "confirmPayment")
        .contains(actionId);
  }

  @Override
  public Object handleAction(String actionId, HttpRequest httpRequest) {
    return switch (actionId) {
      case "iniciarCheckin" -> URI.create("/checkin/" + stayId);
      case "irCheckout" -> {
        modoCheckout = true;
        yield this;
      }
      case "volverReserva" -> {
        modoCheckout = false;
        cargoBusqueda = null;
        ultimaBusqueda = null;
        yield this;
      }
      case "mensajeHuesped" -> new Message("Aquí se enviaría un mensaje al huésped (demo)");
      case "opWifi" -> {
        FrontOffice.checkInOps().save(stayId, FrontOffice.checkInOps().of(stayId).withWifi(true));
        yield List.of(this,
            new Message("Tarjeta wifi creada — red HOTEL_GUEST · clave " + claveWifi()));
      }
      case "opLlave" -> {
        FrontOffice.checkInOps().save(stayId, FrontOffice.checkInOps().of(stayId).withLlave(true));
        yield List.of(this,
            new Message("Llave / pulsera grabada — Hab " + stay().roomNumber()));
      }
      case "buscarCargos" -> {
        if (java.util.Objects.equals(cargoBusqueda, ultimaBusqueda)) {
          yield null; // otro campo disparó el auto-save — sin re-render
        }
        ultimaBusqueda = cargoBusqueda;
        yield this;
      }
      case "seleccionarCargo" -> {
        var code = String.valueOf(httpRequest.runActionRq().parameters().get("_item"));
        var item = FrontOffice.chargeCatalog().findByCode(code).orElse(null);
        if (item == null) {
          yield new Message("Cargo no encontrado: " + code);
        }
        var view = FrontOffice.stayView(stayId);
        var folio = view.folio() != null
            ? view.folio()
            : Folio.openFor("f-" + view.stay().id(), view.stay().id(), null);
        FrontOffice.folios().save(folio.post(FolioLine.charge(item.name(), item.price())));
        cargoBusqueda = null;
        ultimaBusqueda = null;
        yield List.of(this,
            new Message("Cargo posteado — " + item.name() + " " + GuestHeaders.euros(item.price())));
      }
      case "cambiarMetodo" -> {
        metodoPago = String.valueOf(httpRequest.runActionRq().parameters().get("_method"));
        yield this;
      }
      case "confirmPayment" -> {
        var params = httpRequest.runActionRq().parameters();
        var method = params != null && params.get("_method") != null
            ? String.valueOf(params.get("_method")) : "card";
        var methodLabel = switch (method) {
          case "cash" -> "Efectivo";
          case "points" -> "Puntos";
          default -> "Tarjeta";
        };
        var view = FrontOffice.stayView(stayId);
        var total = GuestHeaders.euros(GuestHeaders.balance(view.folio()));
        if (view.stay().inHouse()) {
          FrontOffice.stays().save(view.stay().completeCheckOut());
          FrontOffice.rooms()
              .findByNumber(view.stay().roomNumber())
              .map(Room::release)
              .ifPresent(room -> FrontOffice.rooms().save(room));
        }
        modoCheckout = false;
        yield List.of(
            this,
            new Message("Cobro confirmado — " + total + " (" + methodLabel + ")"),
            new PageBanner(
                BannerTheme.SUCCESS,
                "Check-out completado",
                view.guest().name() + " · Hab " + view.stay().roomNumber() + " · Cobrados "
                    + total + " con " + methodLabel + "."));
      }
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

  /** A memorable per-stay wifi key for the demo toast. */
  private String claveWifi() {
    return "HG-" + Math.abs(stayId.hashCode() % 9000 + 1000);
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
