package io.mateu.mdd.demofrontoffice.ui.reservas;

import io.mateu.mdd.demofrontoffice.domain.room.HousekeepingStatus;
import io.mateu.mdd.demofrontoffice.domain.stay.IncidentStatus;
import io.mateu.mdd.demofrontoffice.domain.stay.Stay;
import io.mateu.mdd.demofrontoffice.domain.stay.StayStatus;
import io.mateu.mdd.demofrontoffice.ui.common.CheckInFlow;
import io.mateu.mdd.demofrontoffice.ui.common.FrontOffice;
import io.mateu.mdd.demofrontoffice.ui.common.GuestHeaders;
import io.mateu.mdd.demofrontoffice.ui.common.Paxes;
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
import io.mateu.uidl.data.UICommand;
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
// anatomía RDS del foldout: página a sangre (sin gutters ni tope de ancho)
@io.mateu.uidl.annotations.PageWidth(io.mateu.uidl.annotations.PageWidthStyle.EDGE_TO_EDGE)
@FormLayout(columns = 1)
@io.mateu.uidl.annotations.SubscribesTo({
  @io.mateu.uidl.annotations.SubscribeTo(event = "documento-escaneado", action = "refrescarReserva"),
  @io.mateu.uidl.annotations.SubscribeTo(event = "firma-capturada-360", action = "opFirmaDone"),
  // el drawer del cardex cierra emitiendo este evento → el rail de huéspedes se refresca
  @io.mateu.uidl.annotations.SubscribeTo(event = "cardex-guardado", action = "refrescarReserva")
})
@AutoSave(action = "buscarCargos", debounceMillis = 350)
public class ReservaOverview
    implements PostHydrationHandler, ToolbarSupplier, ActionHandler,
        io.mateu.uidl.fluent.ActionSupplier {

  @Override
  public List<io.mateu.uidl.fluent.Action> actions(HttpRequest httpRequest) {
    return List.of(
        io.mateu.uidl.fluent.Action.builder().id("*").build(),
        io.mateu.uidl.fluent.Action.builder().id("opFirma").sse(true).build(),
        io.mateu.uidl.fluent.Action.builder().id("escanearPax").sse(true).build());
  }

  private static final DateTimeFormatter DAY =
      DateTimeFormatter.ofPattern("d MMM", Locale.forLanguageTag("es"));

  @Hidden String stayId;

  // ── modo CHECK-OUT (plegado de la antigua /checkout/:id dentro de la 360) ────
  @Hidden boolean modoCheckout;

  // ── modo HABITACIÓN (cambiar la pre-asignada / upgrade, desde su tarjeta) ────
  @Hidden boolean modoHabitacion;

  // ── pax al que apunta la isla del documento (1 = huésped principal) ──────────
  @Hidden int paxSeleccionado = 1;

  // ── modos COBRO y EXTRAS + firma en curso (tablet) ───────────────────────────
  @Hidden boolean modoCobro;
  @Hidden boolean modoExtras;
  @Hidden boolean firmaEnviada;

  // ── cardex manual del huésped seleccionado (el formulario abre en un drawer) ─
  @Hidden String paxDocumento;
  @Hidden String paxNombre;
  @Hidden String paxEmail;
  @Hidden String paxTelefono;
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

// ── cuerpo: huéspedes + operativa en dos columnas; en el check-in, envuelto en un
  // foldout con la info accesoria del cliente (perfil) como panel lateral plegado ──────
  @Section(value = "\u2009", frameless = true)
  @Label("")
  Callable<Component> cuerpo =
      () -> {
        var stay = stay();
        var conFoldout = stay.status() == StayStatus.ARRIVING;
        if (stay.status() == StayStatus.IN_HOUSE && !modoCheckout) {
          // EN CASA: anatomía General Overview — el renderer monta el template nativo
          // (oj-sp-general-overview-page) con el slot MAIN (KPI + incidencias) primero
          // y el slot INFO (huéspedes + salida) como complementario; los fondos y el
          // ancho del info los pone el propio template
          return io.mateu.uidl.data.HorizontalLayout.builder()
              .style("width: 100%; gap: 1.5rem;")
              .wrap(true)
              .content(List.of(
                  VerticalLayout.builder()
                      .style("flex: 1 1 calc(62% - 1.5rem); min-width: min(20rem, 100%); gap: 1rem;")
                      .content(List.of(
                          Text.builder().text("Estancia · " + balanceResumen())
                              .container(io.mateu.uidl.data.TextContainer.h2)
                              .style("margin: 0;").build(),
                          paraInHouse(stay)))
                      .build(),
                  VerticalLayout.builder()
                      .style("flex: 1 1 calc(38% - 1.5rem); min-width: min(16rem, 100%); gap: .25rem;")
                      .content(infoSecundaria(stay))
                      .build()))
              .build();
        }
        if (!conFoldout) {
          // salida / modo check-out: dos columnas planas (huéspedes | operativa)
          return io.mateu.uidl.data.HorizontalLayout.builder()
              .style("width: 100%; gap: 1rem;")
              .wrap(true)
              .content(List.of(
                  VerticalLayout.builder()
                      .style("flex: 1 1 calc(36% - 1rem); min-width: min(20rem, 100%);")
                      .content(List.of(huespedesRail(stay)))
                      .build(),
                  VerticalLayout.builder()
                      .style("flex: 1 1 calc(64% - 1rem); min-width: min(20rem, 100%); gap: 1rem;")
                      .content(List.of(
                          operativaPorEstado(stay),
                          checkoutFolioPanel(),
                          checkoutCargosPanel(),
                          checkoutCobroPanel()))
                      .build()))
              .build();
        }
        // check-in / en casa (foldout, anatomía RDS): overview = rail de huéspedes;
        // panel ancho = la operativa (checklist de llegada o cockpit de estancia); y la
        // info accesoria del cliente (perfil) como TERCER panel, plegado
        return io.mateu.uidl.data.FoldoutLayout.builder()
            // el overview lleva su propio título de panel (no el de la página)
            .headerTitle("Huéspedes")
            .overview(VerticalLayout.builder()
                .style("width: 100%; gap: 1rem;")
                .content(List.of(huespedesRail(stay, false)))
                .build())
            .panels(List.of(
                io.mateu.uidl.data.FoldoutPanel.builder()
                    .id("operaciones")
                    .title(stay.status() == StayStatus.ARRIVING ? "Operaciones" : "Estancia")
                    // el contador vive en el header del panel: "N de 7" en llegada,
                    // el balance del folio en casa
                    .subtitle(stay.status() == StayStatus.ARRIVING
                        ? opsResumen(stay) : balanceResumen())
                    .open(true)
                    // 2 celdas fijas de 22rem + gap 40 + gutters 24 + 24px de holgura
                    // anti-scrollbar (ver .mateu-grid-cell)
                    .width("51rem")
                    .content(operativaPorEstado(stay))
                    .build(),
                io.mateu.uidl.data.FoldoutPanel.builder()
                    .id("perfil")
                    // título corto: "Perfil del cliente" no cabe en la cabecera Redwood a 17rem
                    .title("Perfil")
                    .open(false)
                    // info accesoria: estrecha
                    .width("14rem")
                    .content(perfilCliente())
                    .build()))
            .build();
      };

  private Component huespedesRail(Stay stay) {
    return huespedesRail(stay, true);
  }

  /**
   * El carril de huéspedes: cada pax con su estado documental y sus acciones. {@code withHeading}
   * pinta el h3 "Huéspedes en la habitación" — fuera cuando el contenedor ya titula (el panel
   * overview del foldout se llama "Huéspedes").
   */
  private Component huespedesRail(Stay stay, boolean withHeading) {
    var guest = FrontOffice.stayView(stayId).guest();
    var ops = FrontOffice.checkInOps().of(stay.id());
    var items = new ArrayList<StatusItem>();
    items.add(paxItem(1, guest.name(),
        guest.document() != null && !guest.document().isBlank()
            ? "Doc " + guest.document() + " · Adulto" : "Adulto",
        guest.identityComplete(), ops.isNoShow(1)));
    var companions = stay.companions();
    for (int i = 0; i < companions.size(); i++) {
      var companion = companions.get(i);
      items.add(paxItem(i + 2, companion.name(), companion.description(),
          companion.identityComplete(), ops.isNoShow(i + 2)));
    }
    for (int i = 2 + companions.size(); i <= stay.pax(); i++) {
      items.add(paxItem(i, "Acompañante " + i, "Pendiente de registro", false, ops.isNoShow(i)));
    }
    var contenido = new ArrayList<Component>();
    if (withHeading) {
      contenido.add(
          Text.builder().text("Huéspedes en la habitación")
              .container(io.mateu.uidl.data.TextContainer.h3).style("margin: 0;").build());
    }
    contenido.add(
        StatusList.builder().items(items).compact(true).frameless(true)
            .style("width: 100%;").build());
    return VerticalLayout.builder()
        .style("width: 100%; gap: .5rem;")
        .content(contenido)
        .build();
  }

  /** Preferencias, última estancia, quejas pendientes e historial del huésped principal. */
  private Component perfilCliente() {
    var guest = FrontOffice.stayView(stayId).guest();
    var contenido = new ArrayList<Component>();
    contenido.add(Text.builder().text("Preferencias")
        .container(io.mateu.uidl.data.TextContainer.h3).style("margin: 0;").build());
    contenido.add(io.mateu.uidl.data.BulletedList.builder()
        .items(guest.preferences().stream().map(p -> p.text()).toList())
        .build());
    contenido.add(Text.builder().text("Última estancia")
        .container(io.mateu.uidl.data.TextContainer.h3).style("margin: 1.5rem 0 0;").build());
    contenido.add(Text.builder().text(guest.lastStaySummary()).noMargins(true).build());
    contenido.add(Text.builder().text(guest.lastStayComplementaryInfo())
        .size(io.mateu.uidl.data.TextSize.xs).noMargins(true).build());
    if (guest.complaints() > 0) {
      contenido.add(Notice.builder()
          .text(guest.complaints() + " quejas pendientes")
          .theme("danger").slim(true).fullWidth(true)
          .build());
    }
    contenido.add(Text.builder()
        .text(guest.stays() + " estancias · Cliente desde "
            + (java.time.LocalDate.now().getYear() - guest.yearsAsClient() - 1))
        .size(io.mateu.uidl.data.TextSize.xs).noMargins(true).build());
    return VerticalLayout.builder().style("width: 100%; gap: .25rem;").content(contenido).build();
  }

  /** Lo que aplique según el estado (checklist de llegada, balance in-house, salida). */
  private Component operativaPorEstado(Stay stay) {
    return switch (stay.status()) {
      case ARRIVING -> paraLlegada(stay);
      case IN_HOUSE -> paraInHouse(stay);
      case DEPARTED -> paraSalida(stay);
    };
  }

  /** Modo check-out: el desglose del folio (vacío fuera del modo). */
  private Component checkoutFolioPanel() {
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
      }

  /** Modo check-out: posteo de cargos (vacío fuera del modo). */
  private Component checkoutCargosPanel() {
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
      }

  /** Modo check-out: el cobro (vacío fuera del modo). */
  private Component checkoutCobroPanel() {
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
      }

  // ── drawers de operación: las tareas que abren formulario van en un Drawer (el id
  // lógico estable permite que el server REFRESQUE el drawer abierto devolviendo otro
  // con el mismo id — p.ej. al cambiar el método de cobro) ──────────────────────────
  // Los drawers se COMPONEN de campos y botones (la gramática que el renderer VB pinta
  // en su panel: FormFields → formulario, Buttons → fila de acciones). El id lógico
  // estable permite REFRESCAR el drawer abierto devolviendo otro con el mismo id.
  private io.mateu.uidl.data.Drawer drawerHabitacion(Stay stay) {
    // el picker COMPLETO (grid de habitaciones con housekeeping + oferta de upgrade) —
    // el drawer VB pinta bloques display, no solo campos y botones
    return io.mateu.uidl.data.Drawer.builder()
        .id("drawer-habitacion")
        .headerTitle("Elegir habitación")
        .width("52rem")
        .content(elegirHabitacion(stay, false))
        .initialData(java.util.Map.of("stayId", stayId))
        .build();
  }

  private io.mateu.uidl.data.Drawer drawerCobro(Stay stay) {
    var guest = FrontOffice.stayView(stayId).guest();
    var puntos = String.format("%,d", guest.loyaltyPoints()).replace(',', '.');
    var botones = new ArrayList<Component>();
    record Metodo(String id, String label) {}
    for (var metodo : List.of(new Metodo("card", "Tarjeta"), new Metodo("cash", "Efectivo"),
        new Metodo("points", "Puntos (" + puntos + ")"))) {
      var activo = metodo.id().equals(metodoPago);
      botones.add(Button.builder()
          .label((activo ? "● " : "") + metodo.label())
          .actionId("metodoCobro")
          .parameters(java.util.Map.of("_method", metodo.id()))
          .build());
    }
    botones.add(Button.builder()
        .label("Preautorizar — " + GuestHeaders.euros(stay.total()))
        .actionId("confirmarCobro")
        .parameters(java.util.Map.of("_method", metodoPago))
        .buttonStyle(io.mateu.uidl.data.ButtonStyle.primary)
        .build());
    return io.mateu.uidl.data.Drawer.builder()
        .id("drawer-cobro")
        .headerTitle("Cobro / preautorización — " + GuestHeaders.euros(stay.total()))
        .width("28rem")
        .content(VerticalLayout.builder().content(botones).build())
        .initialData(java.util.Map.of("stayId", stayId, "metodoPago", metodoPago))
        .build();
  }

  private io.mateu.uidl.data.Drawer drawerExtras(Stay stay) {
    var seleccionados = stay.addOns().stream()
        .map(io.mateu.mdd.demofrontoffice.domain.stay.SelectedAddOn::addOnId)
        .collect(java.util.stream.Collectors.toSet());
    var contenido = new ArrayList<Component>();
    var initialData = new java.util.HashMap<String, Object>();
    initialData.put("stayId", stayId);
    for (var item : FrontOffice.addOnCatalog().findAll()) {
      var incluido = item.includedLabel() != null && !item.includedLabel().isBlank();
      if (incluido) {
        continue; // los incluidos en el régimen no se seleccionan
      }
      var campo = "addon_" + item.id();
      initialData.put(campo, seleccionados.contains(item.id()));
      contenido.add(FormField.builder()
          .id(campo)
          .label(item.icon() + " " + item.title()
              + (item.price() != null ? " — € " + item.price() : ""))
          .dataType(FieldDataType.bool)
          .build());
    }
    contenido.add(Button.builder().label("Guardar extras").actionId("guardarExtras")
        .buttonStyle(io.mateu.uidl.data.ButtonStyle.primary).build());
    return io.mateu.uidl.data.Drawer.builder()
        .id("drawer-extras")
        .headerTitle("Ancillaries")
        .width("30rem")
        .content(VerticalLayout.builder().content(contenido).build())
        .initialData(initialData)
        .build();
  }

  /** "N de M" — operaciones de check-in completadas, para el header del panel. */
  private String opsResumen(Stay stay) {
    var lista = operaciones(stay);
    var hechas = lista.stream().filter(Op::done).count();
    return hechas + " de " + lista.size();
  }

  /** One row of the check-in operations checklist. */
  private record Op(
      String id, String icon, String title, String pendiente, String hecha,
      boolean done, String actionLabel, String actionId, String actionIcon) {}

  /** The check-in operations of an arriving stay — completed and pending, with quick actions. */
  private List<Op> operaciones(Stay stay) {
    var ops = FrontOffice.checkInOps().of(stay.id());
    var faltan = Paxes.paxPendientes(stay);
    // asignada ⇒ tarea completada (la inspección es detalle de housekeeping, se muestra como info)
    var habitacionLista = CheckInFlow.habitacionAsignada(stay);
    return List.of(
        new Op("documentos", "🪪", "Datos de huéspedes",
            "Falta la documentación de " + faltan + " pax — escaneo de documento en el check-in",
            "Documentación de los " + stay.pax() + " pax completa",
            faltan == 0, "Completar", "iniciarCheckin", null),
        new Op("habitacion", "🛏️",
            habitacionLista ? "Habitación " + stay.roomNumber() : "Habitación",
            "Sin habitación asignada — elegir una para la estancia",
            stay.roomType() + " asignada"
                + (habitacionInspeccionada(stay) ? " · inspeccionada y lista" : " · pendiente de inspección"),
            habitacionLista, "Cambiar", "opHabitacion", "vaadin:exchange"),
        new Op("wifi", "📶", "Tarjeta wifi",
            "Crear las credenciales de acceso del huésped",
            "Credenciales creadas y entregadas",
            ops.wifi(), "Crear", "opWifi", "vaadin:wifi"),
        new Op("llave", "🔑", "Llave / pulsera",
            "Grabar la llave o pulsera de la Hab " + stay.roomNumber(),
            "Llave / pulsera grabada",
            ops.llave(), "Grabar", "opLlave", "vaadin:key"),
        new Op("firma", "✍️", "Firma del registro",
            firmaEnviada
                ? "Enviada a la tablet · esperando la firma del huésped…"
                : "Enviar el registro a la tablet para su firma",
            "Firmada por el huésped en la tablet",
            ops.firma(), firmaEnviada ? null : "Enviar a tablet", "opFirma", "vaadin:pen"),
        new Op("cobro", "💳", "Cobro / preautorización",
            "Preautorizar " + GuestHeaders.euros(stay.total()) + " — tarjeta, efectivo o puntos",
            "Preautorización completada",
            ops.cobro(), "Cobrar", "opCobro", "vaadin:credit-card"),
        new Op("extras", "🎁", "Ancillaries",
            "Ofrecer los extras opcionales de la estancia",
            extrasHecha(stay),
            ops.extras(), "Elegir", "opExtras", "vaadin:gift"));
  }

  /** Modo habitación: la cuadrícula de disponibles + la oferta de upgrade, en el carril
   *  operativo — elegir una asigna y vuelve a la checklist. */
  private Component elegirHabitacion(Stay stay) {
    return elegirHabitacion(stay, true);
  }

  private Component elegirHabitacion(Stay stay, boolean conTitulo) {
    var guest = FrontOffice.stayView(stayId).guest();
    var content = new ArrayList<Component>();
    if (conTitulo) {
      content.add(Text.builder().text("Elegir habitación")
          .container(io.mateu.uidl.data.TextContainer.h3).style("margin: 0;").build());
    }
    content.add(io.mateu.uidl.data.HorizontalLayout.builder()
        .spacing(true).wrap(true)
        .content(guest.preferences().stream()
            .map(pref -> (Component) io.mateu.uidl.data.Badge.builder()
                .text(pref.text()).pill(true).build())
            .toList())
        .build());
    content.add(io.mateu.uidl.data.ResourceGrid.builder()
        .style("width: 100%;")
        .actionId("elegirHabitacion")
        .columns(4)
        .recommendedLabel("RECOMENDADA")
        .items(FrontOffice.rooms().findByFloor(12).stream()
            .map(room -> io.mateu.mdd.demofrontoffice.ui.checkin.HabitacionStep.item(
                room, stay.roomNumber(), stay.roomNumber()))
            .toList())
        .build());
    var upgrade = FrontOffice.rooms().findByNumber("1401").orElse(null);
    content.add(io.mateu.uidl.data.HorizontalLayout.builder()
        .spacing(true).wrap(true)
        .content(List.of(
            io.mateu.uidl.data.OfferCard.builder()
                .id("asignada")
                .style("flex: 1 1 340px; min-width: 320px;")
                .tag("HABITACIÓN ASIGNADA")
                .title(stay.roomType())
                .subtitle("Hab. " + stay.roomNumber())
                .features(List.of("42 m²", "Vista mar lateral", "Cama King", "Balcón"))
                .current(true)
                .currentLabel("✓ Incluida en tu reserva")
                .build(),
            io.mateu.uidl.data.OfferCard.builder()
                .id("upgrade")
                .style("flex: 1 1 340px; min-width: 320px;")
                .tag("UPGRADE DISPONIBLE")
                .title("Master Oceanfront Suite")
                .subtitle("Hab. 1401 · Planta 14 · Primera línea")
                .features(List.of("68 m²", "Vista mar frontal", "Terraza + jacuzzi", "Sofá lounge"))
                .priceLabel("+ € 65 / noche")
                .actionLabel("Mejorar a esta habitación")
                .actionId("upgrade360")
                .added(upgrade != null && !upgrade.assignable())
                .addedLabel("✓ Upgrade aplicado")
                .build()))
        .build());
    return VerticalLayout.builder().content(content).style("width: 100%; gap: 1rem;").build();
  }

  /** Texto de la operación de extras hecha, con lo contratado. */
  private String extrasHecha(Stay stay) {
    var n = stay.addOns().size();
    return n == 0 ? "Selección cerrada — sin extras" : "Selección cerrada — " + n + " extras";
  }

  /** Modo cobro: preautorización con tarjeta / efectivo / puntos de fidelidad. */
  private Component panelCobro(Stay stay) {
    return panelCobro(stay, true);
  }

  private Component panelCobro(Stay stay, boolean conTitulo) {
    var guest = FrontOffice.stayView(stayId).guest();
    var contenido = new ArrayList<Component>();
    if (conTitulo) {
      contenido.add(Text.builder().text("Cobro / preautorización").container(
          io.mateu.uidl.data.TextContainer.h3).style("margin: 0;").build());
    }
    contenido.add(PaymentPicker.builder()
                .actionId("confirmarCobro")
                .methodActionId("metodoCobro")
                .methods(List.of(
                    PaymentMethod.builder().id("card").label("Tarjeta").build(),
                    PaymentMethod.builder().id("cash").label("Efectivo").build(),
                    PaymentMethod.builder().id("points")
                        .label("Puntos (" + String.format("%,d", guest.loyaltyPoints())
                            .replace(',', '.') + ")").build()))
                .selected(metodoPago)
                .contextLabel("TOTAL RESERVA")
                .contextValue(GuestHeaders.euros(stay.total()))
                .confirmLabel("Preautorizar — " + GuestHeaders.euros(stay.total()))
                .build());
    return VerticalLayout.builder()
        .style("width: 100%; gap: .5rem;")
        .content(contenido)
        .build();
  }

  /** Modo extras: el catálogo de ancillaries con total en vivo + cierre de la selección. */
  private Component panelExtras(Stay stay) {
    return panelExtras(stay, true);
  }

  private Component panelExtras(Stay stay, boolean conTitulo) {
    var seleccionados = stay.addOns().stream()
        .map(io.mateu.mdd.demofrontoffice.domain.stay.SelectedAddOn::addOnId)
        .collect(java.util.stream.Collectors.toSet());
    var contenido = new ArrayList<Component>();
    if (conTitulo) {
      contenido.add(Text.builder().text("Ancillaries").container(
          io.mateu.uidl.data.TextContainer.h3).style("margin: 0;").build());
    }
    contenido.add(io.mateu.uidl.data.AddOnPicker.builder()
                .actionId("extras360")
                .currency("€")
                .totalLabel("Total extras")
                .items(FrontOffice.addOnCatalog().findAll().stream()
                    .map(item -> io.mateu.uidl.data.AddOn.builder()
                        .id(item.id())
                        .icon(item.icon())
                        .title(item.title())
                        .description(item.description())
                        .price(item.price() == null ? null : item.price().doubleValue())
                        .unit(item.unit())
                        .includedLabel(item.includedLabel())
                        .added(seleccionados.contains(item.id()))
                        .build())
                    .toList())
                .build());
    contenido.add(Button.builder().label("Cerrar selección").actionId("cerrarExtras")
        .buttonStyle(io.mateu.uidl.data.ButtonStyle.primary).build());
    return VerticalLayout.builder()
        .style("width: 100%; gap: .75rem;")
        .content(contenido)
        .build();
  }

  /**
   * El formulario del cardex del huésped seleccionado, a mano (documento/nombre/contacto) —
   * contenido del DRAWER que abre "Editar"/"A mano"; el título viaja en el header del drawer.
   */
  private Component formularioPax() {
    var campos = new ArrayList<Component>();
    campos.add(campoPax("paxDocumento", "Documento"));
    campos.add(campoPax("paxNombre", "Nombre"));
    campos.add(campoPax("paxEmail", "Email"));
    campos.add(campoPax("paxTelefono", "Teléfono"));
    campos.add(Button.builder().label("Guardar cardex").actionId("guardarPax")
        .buttonStyle(io.mateu.uidl.data.ButtonStyle.primary).build());
    return VerticalLayout.builder().content(campos).style("width: 100%; gap: .5rem;").build();
  }

  private Component campoPax(String id, String label) {
    return FormField.builder()
        .id(id)
        .label(label)
        .dataType(FieldDataType.string)
        .style("width: 100%; max-width: 28rem;")
        .build();
  }

  private Component paraLlegada(Stay stay) {
    if (modoHabitacion) {
      return elegirHabitacion(stay);
    }
    if (modoCobro) {
      return panelCobro(stay);
    }
    if (modoExtras) {
      return panelExtras(stay);
    }
    var lista = operaciones(stay);
    // la operación "datos de huéspedes" NO lleva tarjeta: la sección de huéspedes de
    // arriba ya muestra ese estado por pax (sí cuenta en el contador del header)
    var tarjetas = lista.stream().filter(op -> !"documentos".equals(op.id())).toList();
    var checklist =
        StatusList.builder()
            .compact(true)
            .frameless(true)
            // cockpit a DOS columnas: dentro del panel ancho (44rem) las 6 tarjetas
            // quedan en 3 filas y se ven todas sin scroll interno
            .columns(2)
            .style("width: 100%;")
            .items(tarjetas.stream()
                .map(op -> {
                  // una operación hecha CONSERVA su acción: el recepcionista puede repetirla
                  // (regrabar una llave defectuosa, repetir la firma, cambiar de habitación…)
                  var conAccion = op.actionLabel() != null;
                  return StatusItem.builder()
                      .id(op.id())
                      .avatar(op.icon())
                      .title(op.title())
                      .description(op.done() ? op.hecha() : op.pendiente())
                      .status(op.done() ? "✓ Hecha" : "Pendiente")
                      .statusColor(op.done() ? "success" : "warning")
                      .actionLabel(conAccion ? op.actionLabel() : null)
                      .actionId(conAccion ? op.actionId() : null)
                      .actionIcon(conAccion ? op.actionIcon() : null)
                      .build();
                })
                .toList())
            .build();
    return VerticalLayout.builder()
        .content(List.of(checklist))
        .style("width: 100%; gap: .5rem;")
        .build();
  }

  /** El balance del folio para el header del panel Estancia: "€ 1.710,50 · 95% preaut.". */
  private String balanceResumen() {
    var folio = FrontOffice.stayView(stayId).folio();
    if (folio == null) {
      return "sin cargos";
    }
    var balance = folio.balance().doubleValue();
    var preauth = folio.preauthorized() == null
        ? Math.max(balance, 1) : folio.preauthorized().doubleValue();
    return GuestHeaders.euros(balance) + " · " + Math.round(balance / preauth * 100) + "% preaut.";
  }

  /** ¿El folio ya lleva el cargo del late check-out? (el flag es el propio cargo) */
  private boolean lateCheckoutContratado(io.mateu.mdd.demofrontoffice.domain.folio.Folio folio) {
    return folio != null && folio.lines().stream()
        .anyMatch(l -> l.concept() != null && l.concept().startsWith("Late check-out"));
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
    var pct = (int) Math.round(balance / preauth * 100);
    var content = new ArrayList<Component>();
    // el KPI del balance, tal cual
    content.add(
        Meter.builder()
            .label("BALANCE ACTUAL")
            .value(balance)
            .max(preauth)
            .unit("€")
            .caption(pct + "% de la preautorización consumido · "
                + (folio == null ? 0 : folio.lines().size()) + " cargos")
            .warnAt(preauth * 0.8)
            .dangerAt(preauth * 0.95)
            .build());
    // incidencias: TODAS con la misma ficha (titulo + badge de estado a la derecha) y su
    // CRONOLOGIA debajo (fecha/hora - comentario, abriendo con la descripcion); las
    // resueltas al final del listado
    content.add(Text.builder().text("Incidencias (" + stay.incidents().size() + ")")
        .container(io.mateu.uidl.data.TextContainer.h3).style("margin: 0;").build());
    var incidencias = new ArrayList<>(stay.incidents().stream()
        .filter(i -> i.status() != IncidentStatus.RESOLVED).toList());
    incidencias.addAll(stay.incidents().stream()
        .filter(i -> i.status() == IncidentStatus.RESOLVED).toList());
    if (incidencias.isEmpty()) {
      content.add(Notice.builder()
          .theme("success")
          .text("Sin incidencias en la habitación")
          .fullWidth(true)
          .build());
    } else {
      content.add(StatusList.builder()
          .compact(true).frameless(true)
          .itemHeadingLevel(4)
          .style("width: 100%;")
          .items(incidencias.stream()
              .map(i -> StatusItem.builder()
                  .id("inc-" + i.code())
                  .title(i.title())
                  .description(i.type() != null ? i.type().label() : null)
                  .status(switch (i.status()) {
                    case RESOLVED -> "✓ Resuelta";
                    case IN_PROGRESS -> "En curso";
                    default -> "Abierta";
                  })
                  .statusColor(switch (i.status()) {
                    case RESOLVED -> "success";
                    case IN_PROGRESS -> "warning";
                    default -> "error";
                  })
                  .lines(cronologia(i))
                  .actionLabel(i.status() == IncidentStatus.RESOLVED ? null : "Resolver")
                  .actionId(i.status() == IncidentStatus.RESOLVED ? null : "resolverIncidencia")
                  .actionIcon(i.status() == IncidentStatus.RESOLVED ? null : "vaadin:check")
                  .build())
              .toList())
          .build());
    }
    return VerticalLayout.builder().content(content).style("width: 100%; gap: 1rem;").build();
  }

  private static final DateTimeFormatter FECHA_HORA =
      DateTimeFormatter.ofPattern("d MMM · HH:mm", Locale.forLanguageTag("es"));

  /** La cronologia de una incidencia: apertura (descripcion), curso y resolucion. */
  private List<String> cronologia(io.mateu.mdd.demofrontoffice.domain.stay.Incident i) {
    var lineas = new ArrayList<String>();
    if (i.openedAt() != null) {
      lineas.add(FECHA_HORA.format(i.openedAt()) + " — " + i.description());
    } else {
      lineas.add(i.description());
    }
    if (i.status() == IncidentStatus.IN_PROGRESS && i.openedAt() != null) {
      lineas.add(FECHA_HORA.format(i.openedAt().plusMinutes(35))
          + " — Mantenimiento avisado · en curso");
    }
    if (i.status() == IncidentStatus.RESOLVED && i.resolvedAt() != null) {
      lineas.add(FECHA_HORA.format(i.resolvedAt()) + " — Resuelta por recepción");
    }
    return lineas;
  }

  /** Info secundaria del general overview en casa: los huéspedes (solo datos) y la salida. */
  private List<Component> infoSecundaria(Stay stay) {
    var view = FrontOffice.stayView(stayId);
    var contenido = new ArrayList<Component>();
    contenido.add(Text.builder().text("Información")
        .container(io.mateu.uidl.data.TextContainer.h2).style("margin: 0;").build());
    contenido.add(Text.builder().text("Huéspedes")
        .container(io.mateu.uidl.data.TextContainer.h3).style("margin: 0;").build());
    contenido.add(Text.builder().text(view.guest().name()).noMargins(true).build());
    contenido.add(Text.builder()
        .text("Doc " + view.guest().document() + " · Adulto")
        .size(io.mateu.uidl.data.TextSize.xs).noMargins(true).build());
    for (var companion : stay.companions()) {
      contenido.add(Text.builder().text(companion.name()).noMargins(true).build());
      // la descripción del acompañante ya incluye su documento
      contenido.add(Text.builder().text(companion.description())
          .size(io.mateu.uidl.data.TextSize.xs).noMargins(true).build());
    }
    var late = lateCheckoutContratado(view.folio());
    contenido.add(Text.builder().text("Salida")
        .container(io.mateu.uidl.data.TextContainer.h3).style("margin: 0;").build());
    contenido.add(Text.builder()
        .text(DAY.format(stay.checkOut()) + " · " + (late ? "15:00 (late check-out)" : "12:00"))
        .noMargins(true).build());
    contenido.add(Text.builder()
        .text(stay.nights() + " noches · " + stay.board())
        .size(io.mateu.uidl.data.TextSize.xs).noMargins(true).build());
    return contenido;
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
    if (modoHabitacion || modoCobro || modoExtras) {
      return List.of(
          Button.builder().label("Volver a la reserva").actionId("volverHabitacion").build());
    }
    return switch (stay().status()) {
      case ARRIVING -> {
        // habilitado SOLO con todos los cardex OK (no-shows aparte) y las operaciones hechas
        var listo = operaciones(stay()).stream().allMatch(Op::done);
        yield List.of(
            Button.builder().label("Confirmar check-in").actionId("iniciarCheckin")
                .buttonStyle(io.mateu.uidl.data.ButtonStyle.primary)
                .disabled(!listo)
                .build());
      }
      case IN_HOUSE -> List.of(
          Button.builder().label("Check-out").actionId("irCheckout")
              .buttonStyle(io.mateu.uidl.data.ButtonStyle.primary).build(),
          Button.builder().label("Añadir cargo").actionId("opCargos").build(),
          Button.builder().label("Cambiar habitación").actionId("opHabitacion").build(),
          Button.builder().label("Gestionar folio").actionId("gestionFolio").build(),
          Button.builder().label("Mensaje huésped").actionId("mensajeHuesped").build(),
          Button.builder().label("Registrar petición").actionId("opPeticion").build(),
          Button.builder().label("Nueva incidencia").actionId("opIncidencia").build());
      case DEPARTED -> List.of();
    };
  }

  @Override
  public boolean supportsAction(String actionId) {
    return List.of("iniciarCheckin", "irCheckout", "volverReserva", "mensajeHuesped",
            "opWifi", "opLlave", "opHabitacion", "elegirHabitacion", "upgrade360",
            "volverHabitacion", "escanearPax", "rellenarPax", "guardarPax", "refrescarReserva",
            "siguienteReserva", "volverListado",
            "opCobro", "metodoCobro", "confirmarCobro",
            "opCargos", "postearCargo", "resolverIncidencia", "lateCheckout",
            "gestionFolio", "opPeticion", "registrarPeticion",
            "opIncidencia", "crearIncidencia",
            "opExtras", "extras360", "cerrarExtras", "opFirma", "opFirmaDone",
            "buscarCargos", "seleccionarCargo", "cambiarMetodo", "confirmPayment")
        .contains(actionId);
  }

  @Override
  public Object handleAction(String actionId, HttpRequest httpRequest) {
    return switch (actionId) {
      case "iniciarCheckin" -> {
        // con todo resuelto (pax, habitación, ancillaries) no hay nada que preguntar:
        // check-in directo y la 360 se re-renderiza ya in-house, sin pasar por el wizard
        var stay = stay();
        if (CheckInFlow.listoParaCheckInDirecto(stay)) {
          var checkedIn = CheckInFlow.completar(stayId, null, List.of());
          var resultado = new ArrayList<Object>();
          resultado.add(this);
          resultado.add(new Message(
              "✅ Check-in completado — "
                  + FrontOffice.stayView(stayId).guest().name()
                  + " · Hab "
                  + checkedIn.roomNumber()));
          // solo una reserva DE GRUPO propone seguir con la siguiente llegada del grupo
          // (simulado: mismo grupo = primera palabra de la agencia); sin grupo o sin más
          // llegadas pendientes → directamente de vuelta al listado
          var siguiente = siguienteLlegadaDelGrupo(checkedIn);
          if (siguiente.isPresent()) {
            resultado.add(dialogSiguiente(siguiente.get()));
            yield resultado;
          }
          yield List.of(resultado.get(1), UICommand.navigateTo("/reservas"));
        }
        yield URI.create("/checkin/" + stayId);
      }
      case "siguienteReserva" ->
          URI.create("/reserva/" + httpRequest.runActionRq().parameters().get("_item"));
      case "volverListado" -> URI.create("/reservas");
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
      case "noShowPax" -> {
        var pax = paxDe(httpRequest);
        var ops = FrontOffice.checkInOps().of(stayId).toggleNoShow(pax);
        FrontOffice.checkInOps().save(stayId, ops);
        var nombre = Paxes.nameOf(stayId, pax);
        yield List.of(this, new Message(ops.isNoShow(pax)
            ? "No show registrado — " + nombre
            : "No show revertido — " + nombre));
      }
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
      case "escanearPax" -> {
        // SSE: diálogo de progreso (LongTask) mientras el escáner trabaja; al cerrar,
        // el comando dispara el evento que refresca la 360
        var pax = paxDe(httpRequest);
        var nombre = io.mateu.mdd.demofrontoffice.ui.common.Paxes.nameOf(stayId, pax);
        var idEstancia = stayId;
        yield io.mateu.uidl.data.LongTask.create("Escaneando el documento de " + nombre + "…")
            .withProgressBar()
            .done("Documento verificado", "Identidad leída del documento")
            .closeAfter(1)
            .withCommand(UICommand.dispatchEvent("documento-escaneado"))
            .run(progress ->
                reactor.core.publisher.Flux.range(1, 4)
                    .delayElements(java.time.Duration.ofMillis(450))
                    .map(i -> {
                      if (i == 4) {
                        io.mateu.mdd.demofrontoffice.ui.common.Paxes.scan(idEstancia, pax);
                      }
                      return progress.step(PASOS_ESCANEO[i - 1], i / 4.0);
                    }));
      }
      case "rellenarPax" -> {
        paxSeleccionado = paxDe(httpRequest);
        // el formulario del cardex abre en un DRAWER, precargado con el cardex actual
        // (sirve tanto para registrar como para validar/corregir). Las acciones del
        // drawer postean SU estado (initialData + borrador), no el del host — por eso
        // stayId y paxSeleccionado viajan en el initialData.
        var datos = Paxes.dataOf(stayId, paxSeleccionado);
        var completo = Paxes.identityComplete(stayId, paxSeleccionado);
        var initialData = new java.util.HashMap<String, Object>();
        initialData.put("stayId", stayId);
        initialData.put("paxSeleccionado", paxSeleccionado);
        initialData.put("paxDocumento", datos.document() == null ? "" : datos.document());
        initialData.put("paxNombre", datos.name() == null ? "" : datos.name());
        initialData.put("paxEmail", datos.email() == null ? "" : datos.email());
        initialData.put("paxTelefono", datos.phone() == null ? "" : datos.phone());
        yield io.mateu.uidl.data.Drawer.builder()
            .headerTitle((completo ? "Validar / editar huésped " : "Registrar huésped ")
                + paxSeleccionado + " — " + Paxes.nameOf(stayId, paxSeleccionado))
            .width("28rem")
            .content(formularioPax())
            .initialData(initialData)
            .build();
      }
      case "guardarPax" -> {
        io.mateu.mdd.demofrontoffice.ui.common.Paxes.register(
            stayId, paxSeleccionado, paxDocumento, paxNombre, paxEmail, paxTelefono);
        var nombre = io.mateu.mdd.demofrontoffice.ui.common.Paxes.nameOf(stayId, paxSeleccionado);
        paxDocumento = null;
        paxNombre = null;
        paxEmail = null;
        paxTelefono = null;
        // cierra el drawer emitiendo el evento al que está suscrita la página (refresco del rail)
        yield List.of(
            new Message("Cardex registrado — " + nombre),
            UICommand.closeModal("cardex-guardado"));
      }
      case "refrescarReserva" -> this;
      case "opHabitacion" -> drawerHabitacion(stay());
      case "volverHabitacion" -> {
        modoHabitacion = false;
        modoCobro = false;
        modoExtras = false;
        yield this;
      }
      case "opCobro" -> {
        if (stay().status() == StayStatus.ARRIVING) {
          yield drawerCobro(stay());
        }
        modoCobro = true;
        yield this;
      }
      case "metodoCobro" -> {
        metodoPago = String.valueOf(httpRequest.runActionRq().parameters().get("_method"));
        if (!modoCobro && stay().status() == StayStatus.ARRIVING) {
          // el picker vive en el drawer: refrescarlo en sitio (mismo Drawer.id), sin
          // tocar el host — el foldout ni se entera
          yield drawerCobro(stay());
        }
        yield this;
      }
      case "confirmarCobro" -> {
        var params = httpRequest.runActionRq().parameters();
        var method = params != null && params.get("_method") != null
            ? String.valueOf(params.get("_method")) : metodoPago;
        var guest = FrontOffice.stayView(stayId).guest();
        var texto = switch (method) {
          case "points" -> "Cobro con puntos — " + String.format("%,d", guest.loyaltyPoints())
              .replace(',', '.') + " pts aplicados a " + GuestHeaders.euros(stay().total());
          case "cash" -> "Preautorización registrada — " + GuestHeaders.euros(stay().total())
              + " en efectivo a la llegada";
          default -> "Preautorización completada — " + GuestHeaders.euros(stay().total())
              + " en la tarjeta del huésped";
        };
        FrontOffice.checkInOps().save(stayId, FrontOffice.checkInOps().of(stayId).withCobro(true));
        if (!modoCobro && stay().status() == StayStatus.ARRIVING) {
          // desde el drawer: cerrar + repintar el host (el foldout se actualiza in situ)
          yield List.of(this, new Message(texto), UICommand.closeModal());
        }
        modoCobro = false;
        yield List.of(this, new Message(texto));
      }
      case "opCargos" -> drawerCargos();
      case "gestionFolio" -> drawerFolio();
      case "opIncidencia" -> drawerNuevaIncidencia();
      case "crearIncidencia" -> {
        var tipo = io.mateu.mdd.demofrontoffice.domain.stay.IncidentType.valueOf(
            String.valueOf(httpRequest.runActionRq().parameters().get("_item")));
        var estadoDrawer = httpRequest.runActionRq().componentState();
        var titulo = estadoDrawer != null && estadoDrawer.get("incTitulo") != null
            && !String.valueOf(estadoDrawer.get("incTitulo")).isBlank()
            ? String.valueOf(estadoDrawer.get("incTitulo"))
            : "Incidencia de " + tipo.label().toLowerCase(Locale.forLanguageTag("es"));
        var comentario = estadoDrawer != null && estadoDrawer.get("incComentario") != null
            && !String.valueOf(estadoDrawer.get("incComentario")).isBlank()
            ? String.valueOf(estadoDrawer.get("incComentario"))
            : "Reportada en recepción";
        var incidencia = new io.mateu.mdd.demofrontoffice.domain.stay.Incident(
            "inc-" + System.currentTimeMillis(), tipo, tipo.icon(), titulo, comentario,
            IncidentStatus.OPEN, false, java.time.LocalDateTime.now(), null);
        FrontOffice.stays().save(stay().reportIncident(incidencia));
        yield List.of(this,
            new Message("Incidencia abierta — " + titulo + " (" + tipo.label() + ")"),
            UICommand.closeModal());
      }
      case "opPeticion" -> drawerPeticiones();
      case "registrarPeticion" -> {
        var peticion = String.valueOf(httpRequest.runActionRq().parameters().get("_item"));
        if ("late-checkout".equals(peticion)) {
          var view = FrontOffice.stayView(stayId);
          var folio = view.folio() != null
              ? view.folio()
              : Folio.openFor("f-" + view.stay().id(), view.stay().id(), null);
          FrontOffice.folios().save(folio.post(
              FolioLine.charge("Late check-out (salida 15:00)", new java.math.BigDecimal("50.00"))));
          yield List.of(this,
              new Message("Late check-out contratado — salida a las 15:00 (+ € 50,00)"),
              UICommand.closeModal());
        }
        yield List.of(this,
            new Message("Petición registrada — housekeeping avisado (" + peticion + ")"),
            UICommand.closeModal());
      }
      case "postearCargo" -> {
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
        yield List.of(this,
            new Message("Cargo posteado — " + item.name() + " " + GuestHeaders.euros(item.price())),
            UICommand.closeModal());
      }
      case "resolverIncidencia" -> {
        var code = String.valueOf(httpRequest.runActionRq().parameters().get("_item"))
            .replaceFirst("^inc-", "");
        FrontOffice.stays().save(stay().resolveIncident(code));
        yield List.of(this, new Message("Incidencia resuelta"));
      }
      case "lateCheckout" -> {
        var view = FrontOffice.stayView(stayId);
        var folio = view.folio() != null
            ? view.folio()
            : Folio.openFor("f-" + view.stay().id(), view.stay().id(), null);
        FrontOffice.folios().save(folio.post(
            FolioLine.charge("Late check-out (salida 15:00)", new java.math.BigDecimal("50.00"))));
        yield List.of(this,
            new Message("Late check-out contratado — salida a las 15:00 (+ € 50,00)"));
      }
      case "opExtras" -> {
        if (stay().status() == StayStatus.ARRIVING) {
          yield drawerExtras(stay());
        }
        modoExtras = true;
        yield this;
      }
      case "extras360" -> {
        var params = httpRequest.runActionRq().parameters();
        var item = String.valueOf(params.get("_item"));
        var added = Boolean.parseBoolean(String.valueOf(params.get("_added")));
        FrontOffice.stays().save(added ? stay().addAddOn(item) : stay().removeAddOn(item));
        yield this;
      }
      case "guardarExtras" -> {
        // los switches del drawer viajan en el componentState (addon_<id> = true/false)
        var estado = httpRequest.runActionRq().componentState();
        var stay = stay();
        for (var item : FrontOffice.addOnCatalog().findAll()) {
          var campo = "addon_" + item.id();
          if (estado.containsKey(campo)) {
            var activo = Boolean.parseBoolean(String.valueOf(estado.get(campo)));
            var lo_tiene = stay.addOns().stream()
                .anyMatch(a -> a.addOnId().equals(item.id()));
            if (activo && !lo_tiene) {
              stay = stay.addAddOn(item.id());
            } else if (!activo && lo_tiene) {
              stay = stay.removeAddOn(item.id());
            }
          }
        }
        FrontOffice.stays().save(stay);
        FrontOffice.checkInOps().save(stayId, FrontOffice.checkInOps().of(stayId).withExtras(true));
        yield List.of(this, new Message(extrasHecha(stay)), UICommand.closeModal());
      }
      case "cerrarExtras" -> {
        FrontOffice.checkInOps().save(stayId, FrontOffice.checkInOps().of(stayId).withExtras(true));
        if (!modoExtras && stay().status() == StayStatus.ARRIVING) {
          yield List.of(this, new Message(extrasHecha(stay())), UICommand.closeModal());
        }
        modoExtras = false;
        yield List.of(this, new Message(extrasHecha(stay())));
      }
      case "opFirma" -> {
        // SSE: diálogo de progreso mientras la tablet trabaja; al cerrar, el evento
        // dispara opFirmaDone vía la suscripción de la clase
        yield io.mateu.uidl.data.LongTask.create("Firma en tablet")
            .withProgressBar()
            .done("Firma capturada", "Registro firmado por el huésped")
            .closeAfter(1)
            .withCommand(UICommand.dispatchEvent("firma-capturada-360"))
            .run(progress ->
                reactor.core.publisher.Flux.range(1, 3)
                    .delayElements(java.time.Duration.ofMillis(1200))
                    .map(i -> progress.step(PASOS_FIRMA[i - 1], i / 3.0)));
      }
      case "opFirmaDone" -> {
        firmaEnviada = false;
        FrontOffice.checkInOps().save(stayId, FrontOffice.checkInOps().of(stayId).withFirma(true));
        yield List.of(this, new Message("Firma capturada — registro firmado por el huésped"));
      }
      case "elegirHabitacion" -> {
        var number = String.valueOf(httpRequest.runActionRq().parameters().get("_item"));
        var room = FrontOffice.rooms().findByNumber(number).orElse(null);
        if (room == null || !room.assignable()) {
          yield new Message("La habitación " + number + " no está disponible");
        }
        FrontOffice.stays().save(stay().assignRoom(number, tipoDe(room)));
        if (!modoHabitacion && stay().status() == StayStatus.ARRIVING) {
          yield List.of(this,
              new Message("Habitación cambiada — Hab " + number + " (" + tipoDe(room) + ")"),
              UICommand.closeModal());
        }
        modoHabitacion = false;
        yield List.of(this,
            new Message("Habitación cambiada — Hab " + number + " (" + tipoDe(room) + ")"));
      }
      case "upgrade360" -> {
        var suite = FrontOffice.rooms().findByNumber("1401").orElse(null);
        if (suite == null || !suite.assignable()) {
          yield new Message("La suite del upgrade no está disponible");
        }
        FrontOffice.stays().save(stay().assignRoom("1401", tipoDe(suite)));
        if (!modoHabitacion && stay().status() == StayStatus.ARRIVING) {
          yield List.of(this,
              new Message("Upgrade aplicado — Master Oceanfront Suite (Hab 1401, + € 65 / noche)"),
              UICommand.closeModal());
        }
        modoHabitacion = false;
        yield List.of(this,
            new Message("Upgrade aplicado — Master Oceanfront Suite (Hab 1401, + € 65 / noche)"));
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

  StatusItem paxItem(int pax, String title, String description, boolean complete, boolean noShow) {
    // también con la identidad verificada: el recepcionista puede querer volver a escanear
    // el documento o validar/corregir algún dato del cardex. Un pax NO SHOW pierde las
    // acciones de registro y queda solo con la de revertir la marca.
    return StatusItem.builder()
        .id(String.valueOf(pax))
        .avatar(initials(title))
        .title(title)
        .description(noShow ? "No se ha presentado" : description)
        .status(noShow ? "No show" : complete ? "Cardex OK" : "Sin cardex")
        .statusColor(noShow ? "error" : complete ? "success" : "warning")
        .actionLabel(noShow ? null : (complete ? "Reescanear" : "Escanear"))
        .actionId(noShow ? null : "escanearPax")
        .actionIcon(noShow ? null : "vaadin:barcode")
        .actionLabel2(noShow ? null : (complete ? "Editar" : "A mano"))
        .actionId2(noShow ? null : "rellenarPax")
        .actionIcon2(noShow ? null : "vaadin:pencil")
        .actionLabel3(noShow ? "Revertir" : "No show")
        .actionId3("noShowPax")
        .actionIcon3(noShow ? "vaadin:rotate-left" : "vaadin:ban")
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

  private static final String[] PASOS_ESCANEO = {
    "Encendiendo el escáner…", "Leyendo el documento…", "Extrayendo los datos…",
    "Verificando la identidad…"
  };

  private static final String[] PASOS_FIRMA = {
    "Enviando el registro a la tablet…", "Esperando la firma del huésped…",
    "Recibiendo la firma…"
  };

  /** Drawer con el catálogo de cargos: una fila clicable por artículo → postearCargo. */
  private io.mateu.uidl.data.Drawer drawerCargos() {
    return io.mateu.uidl.data.Drawer.builder()
        .id("drawer-cargos")
        .headerTitle("Postear cargo")
        .width("26rem")
        .content(StatusList.builder()
            .rowActionId("postearCargo")
            .compact(true)
            .style("width: 100%;")
            .items(FrontOffice.chargeCatalog().findAll().stream()
                .map(item -> StatusItem.builder()
                    .id(item.code()).title(item.name()).description(item.code())
                    .status(GuestHeaders.euros(item.price())).statusColor("contrast")
                    .build())
                .toList())
            .build())
        .initialData(java.util.Map.of("stayId", stayId))
        .build();
  }

  /** Drawer con el desglose del folio (Ledger) — gestión de folio. */
  private io.mateu.uidl.data.Drawer drawerFolio() {
    var folio = FrontOffice.stayView(stayId).folio();
    return io.mateu.uidl.data.Drawer.builder()
        .id("drawer-folio")
        .headerTitle("Folio de la estancia")
        .width("30rem")
        .content(Ledger.builder()
            .style("width: 100%;")
            .currency("€")
            .totalLabel("Total")
            .lines(folio == null ? List.of() : folio.lines().stream()
                .map(l -> LedgerLine.builder()
                    .concept(l.concept())
                    .amount(l.amount() == null ? null : l.amount().doubleValue())
                    .included(l.included())
                    .includedLabel(l.includedLabel())
                    .build())
                .toList())
            .total(folio == null ? 0 : folio.balance().doubleValue())
            .build())
        .initialData(java.util.Map.of("stayId", stayId))
        .build();
  }

  /** Drawer de alta de incidencia: título/comentario + el TIPO como filas clicables. */
  private io.mateu.uidl.data.Drawer drawerNuevaIncidencia() {
    var contenido = new ArrayList<Component>();
    contenido.add(FormField.builder()
        .id("incTitulo").label("Título").dataType(FieldDataType.string)
        .style("width: 100%;").build());
    contenido.add(FormField.builder()
        .id("incComentario").label("Comentario").dataType(FieldDataType.string)
        .style("width: 100%;").build());
    contenido.add(Text.builder().text("Crear como…")
        .container(io.mateu.uidl.data.TextContainer.h3).style("margin: 0;").build());
    contenido.add(StatusList.builder()
        .rowActionId("crearIncidencia")
        .compact(true)
        .style("width: 100%;")
        .items(java.util.Arrays.stream(
                io.mateu.mdd.demofrontoffice.domain.stay.IncidentType.values())
            .map(tipo -> StatusItem.builder()
                .id(tipo.name())
                .icon(tipo.icon())
                .title(tipo.label())
                .build())
            .toList())
        .build());
    return io.mateu.uidl.data.Drawer.builder()
        .id("drawer-nueva-incidencia")
        .headerTitle("Nueva incidencia")
        .width("26rem")
        .content(VerticalLayout.builder().style("gap: .5rem;").content(contenido).build())
        .initialData(java.util.Map.of("stayId", stayId))
        .build();
  }

  /** Drawer de peticiones del huésped: filas clicables → registrarPeticion. */
  private io.mateu.uidl.data.Drawer drawerPeticiones() {
    record Peticion(String id, String titulo, String detalle) {}
    var peticiones = List.of(
        new Peticion("late-checkout", "Late check-out", "Salida a las 15:00 · + € 50,00"),
        new Peticion("cuna", "Cuna para la habitación", "Sin cargo"),
        new Peticion("toallas", "Toallas extra", "Sin cargo"),
        new Peticion("limpieza", "Limpieza adicional", "Sin cargo"));
    return io.mateu.uidl.data.Drawer.builder()
        .id("drawer-peticiones")
        .headerTitle("Registrar petición")
        .width("26rem")
        .content(StatusList.builder()
            .rowActionId("registrarPeticion")
            .compact(true)
            .style("width: 100%;")
            .items(peticiones.stream()
                .map(pet -> StatusItem.builder()
                    .id(pet.id()).title(pet.titulo()).description(pet.detalle())
                    .build())
                .toList())
            .build())
        .initialData(java.util.Map.of("stayId", stayId))
        .build();
  }

  /** El "grupo" de una reserva — SIMULACIÓN: la primera palabra de la agencia
   *  ("TUI Deutschland" y "TUI Group · …" comparten el grupo TUI). */
  private static String grupoDe(Stay stay) {
    if (stay.agency() == null || stay.agency().isBlank()) {
      return null;
    }
    return stay.agency().trim().split("\\s+")[0];
  }

  /** La siguiente llegada PENDIENTE del mismo grupo (vacío si la reserva no es de grupo
   *  o no queda ninguna otra por llegar). */
  private java.util.Optional<Stay> siguienteLlegadaDelGrupo(Stay hecha) {
    var grupo = grupoDe(hecha);
    if (grupo == null) {
      return java.util.Optional.empty();
    }
    return FrontOffice.stays().findAll().stream()
        .filter(s -> s.status() == StayStatus.ARRIVING && !s.id().equals(hecha.id()))
        .filter(s -> grupo.equals(grupoDe(s)))
        .findFirst();
  }

  /** El modal de decisión post-check-in: seguir con la siguiente llegada del grupo o
   *  volver al listado. */
  private io.mateu.uidl.data.Dialog dialogSiguiente(Stay siguiente) {
    var guest = FrontOffice.stayView(siguiente.id()).guest();
    return io.mateu.uidl.data.Dialog.builder()
        .id("dialog-siguiente-checkin")
        .headerTitle("Check-in completado")
        .width("28rem")
        .content(VerticalLayout.builder()
            .style("gap: .25rem;")
            .content(List.of(
                Text.builder()
                    .text(guest.name() + " también está por llegar con el grupo "
                        + grupoDe(siguiente) + " — " + siguiente.pax() + " pax · "
                        + siguiente.roomType() + " (" + siguiente.agency() + ").")
                    .build(),
                Text.builder().text("¿Seguimos con su check-in?").noMargins(true).build(),
                Button.builder()
                    .label("Check-in de " + guest.name())
                    .actionId("siguienteReserva")
                    .parameters(java.util.Map.of("_item", siguiente.id()))
                    .buttonStyle(io.mateu.uidl.data.ButtonStyle.primary)
                    .build(),
                Button.builder().label("Volver al listado").actionId("volverListado").build()))
            .build())
        .build();
  }

  /** El pax de la fila pulsada ({_item} numérico de la lista de huéspedes). */
  private int paxDe(HttpRequest httpRequest) {
    var raw = httpRequest.runActionRq().parameters().get("_item");
    return (int) Double.parseDouble(String.valueOf(raw));
  }

  /** The room's type from the inventory, falling back to the reservation's. */
  private String tipoDe(io.mateu.mdd.demofrontoffice.domain.room.Room room) {
    return room.type() != null ? room.type() : "Planta " + room.floor();
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

}
