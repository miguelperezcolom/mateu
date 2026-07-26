package io.mateu.mdd.demofrontoffice.ui.checkout;

import io.mateu.mdd.demofrontoffice.domain.folio.Folio;
import io.mateu.mdd.demofrontoffice.domain.folio.FolioLine;
import io.mateu.mdd.demofrontoffice.domain.room.Room;
import io.mateu.mdd.demofrontoffice.ui.common.FrontOffice;
import io.mateu.mdd.demofrontoffice.ui.common.GuestHeaders;
import io.mateu.uidl.StyleConstants;
import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.BannerTheme;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.data.Ledger;
import io.mateu.uidl.data.LedgerLine;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.Notice;
import io.mateu.uidl.data.PageBanner;
import io.mateu.uidl.data.PaymentMethod;
import io.mateu.uidl.data.PaymentPicker;
import io.mateu.uidl.data.StatusItem;
import io.mateu.uidl.data.StatusList;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.PostHydrationHandler;
import java.util.List;
import java.util.concurrent.Callable;
import lombok.Getter;
import lombok.Setter;

/**
 * Check-out of one departing stay (route {@code /checkout/:id}): the guest banner, the folio
 * ledger and the payment picker for every audience; posting catalog charges and emailing the
 * invoice are staff-only ({@code @Audience("Staff")}) — the Cliente projection mirrors the guest
 * self-checkout screen. Confirming the payment completes the real check-out: the stay departs and
 * the room is released for housekeeping.
 */
@Getter
@Setter
@Route(value = "/checkout/:id", parentRoute = "")
@Title("Check-Out")
@FormLayout(columns = 1)
@Style(StyleConstants.CONTAINER)
@AutoSave(action = "buscarCargos", debounceMillis = 350)
public class CheckOutDetail implements PostHydrationHandler {

  @Hidden String stayId;

  @Label("")
  Callable<Component> header = () -> GuestHeaders.departureHeader(stayId);

  @Section("Desglose folio")
  @Label("")
  Callable<Component> folio =
      () -> {
        var f = FrontOffice.stayView(stayId).folio();
        return Ledger.builder()
            .style("width: 100%; max-width: 900px;")
            .currency("€")
            .totalLabel("Total")
            .lines(f == null ? List.of() : f.lines().stream().map(CheckOutDetail::line).toList())
            .total(f == null ? 0 : f.balance().doubleValue())
            .build();
      };

  static LedgerLine line(FolioLine line) {
    return LedgerLine.builder()
        .concept(line.concept())
        .amount(line.amount() == null ? null : line.amount().doubleValue())
        .included(line.included())
        .includedLabel(line.includedLabel())
        .build();
  }

  // Posting charges lives right below the folio breakdown it feeds: a full-width live-search
  // text field (@AutoSave re-runs buscarCargos as you type) whose matches render as clickable
  // rows — picking one posts it to the folio, clears the matches and resets the search box.
  @Section("Postear cargo")
  @Audience("Staff")
  @Label("Buscar por nombre o código")
  String cargoBusqueda;

  @Hidden String ultimaBusqueda;

  @Audience("Staff")
  @Label("")
  Callable<Component> resultadosCargos =
      () -> {
        if (cargoBusqueda == null || cargoBusqueda.isBlank()) {
          return new VerticalLayout();
        }
        var s = cargoBusqueda.trim().toLowerCase();
        var matches =
            FrontOffice.chargeCatalog().findAll().stream()
                .filter(
                    item ->
                        item.name().toLowerCase().contains(s)
                            || item.code().toLowerCase().contains(s))
                .toList();
        if (matches.isEmpty()) {
          return Notice.builder()
              .theme("warning")
              .text("Sin coincidencias para \"" + cargoBusqueda + "\"")
              .slim(true)
              .fullWidth(true)
              .build();
        }
        return StatusList.builder()
            .rowActionId("seleccionarCargo")
            .compact(true)
            .style("width: 100%;")
            .items(
                matches.stream()
                    .map(
                        item ->
                            StatusItem.builder()
                                .id(item.code())
                                .title(item.name())
                                .description(item.code())
                                .status(GuestHeaders.euros(item.price()))
                                .statusColor("contrast")
                                .build())
                    .toList())
            .build();
      };

  @Hidden String metodoPago = "card";
  @Hidden Integer puntosAUtilizar;

  @Section("Cobro")
  @Label("")
  Callable<Component> cobro =
      () -> {
        var f = FrontOffice.stayView(stayId).folio();
        return PaymentPicker.builder()
            .actionId("confirmPayment")
            // picking a method re-renders the section (shows the redeem-points panel on "points")
            .methodActionId("cambiarMetodo")
            .methods(
                List.of(
                    PaymentMethod.builder().id("card").label("Tarjeta").build(),
                    PaymentMethod.builder().id("cash").label("Efectivo").build(),
                    PaymentMethod.builder().id("points").label("Puntos").build()))
            .selected(metodoPago)
            .contextLabel("PREAUTORIZADO")
            .contextValue(GuestHeaders.euros(f == null ? null : f.preauthorized()))
            .confirmLabel("Confirmar — " + GuestHeaders.euros(GuestHeaders.balance(f)))
            .build();
      };

  // The redeem-points panel, shown while the "Puntos" method is picked: available points on the
  // right, the points input with its local-currency equivalence, and the Redimir action.
  @Audience("Staff")
  @Label("")
  Callable<Component> panelPuntos =
      () -> {
        if (!"points".equals(metodoPago)) {
          return new VerticalLayout();
        }
        var guest = FrontOffice.stayView(stayId).guest();
        var puntos = puntosAUtilizar == null ? 0 : puntosAUtilizar;
        return Notice.builder()
            .theme("info")
            .noIcon(true)
            .text("Redimir puntos de fidelidad")
            .status("Disponibles: " + GuestHeaders.points(guest) + " pts")
            .fullWidth(true)
            .content(
                List.of(
                    Text.builder()
                        .text("PUNTOS A UTILIZAR")
                        .noMargins(true)
                        .style(
                            "font-size: .65rem; font-weight: 600; letter-spacing: .05em;"
                                + " color: #1a5dad;")
                        .build(),
                    HorizontalLayout.builder()
                        .style("gap: .6rem; align-items: center; flex-wrap: wrap;")
                        .content(
                            List.of(
                                FormField.builder()
                                    .id("puntosAUtilizar")
                                    .label("")
                                    .dataType(FieldDataType.integer)
                                    .style("width: 8rem;")
                                    .build(),
                                Text.builder()
                                    .text(
                                        "= "
                                            + GuestHeaders.euros(puntos / 100.0)
                                            + " (100 pts = 1 €)")
                                    .noMargins(true)
                                    .style("color: #1a5dad;")
                                    .build(),
                                new Button("Redimir", "redimirPuntos")))
                        .build(),
                    Text.builder()
                        .text(
                            "Equivalencia en moneda local. El importe redimido se descontará del"
                                + " total a pagar.")
                        .noMargins(true)
                        .style("font-size: .7rem; color: #1a5dad; opacity: .8;")
                        .build()))
            .build();
      };

  // Emailing the invoice stays at the bottom: a single-line band — label, the email input inline
  // and the send action on the right. The input is a fluent FormField bound to the hidden state
  // field below.
  @Audience("Staff")
  @Hidden
  String emailFactura;

  @Section(value = "", frameless = true)
  @Audience("Staff")
  @Label("")
  Callable<Component> enviarFacturaBanda =
      () ->
          Notice.builder()
              .theme("info")
              .icon("✉")
              .text("Enviar factura por email")
              .fullWidth(true)
              .inlineContent(true)
              .content(
                  List.of(
                      FormField.builder()
                          .id("emailFactura")
                          .label("")
                          .dataType(FieldDataType.string)
                          .style("width: 18rem;")
                          .build()))
              .actionLabel("Enviar factura")
              .actionId("enviarFactura")
              .build();

  @Audience("Staff")
  @Action
  Object enviarFactura() {
    return new Message("Factura enviada a " + emailFactura);
  }

  @Hidden Integer ultimosPuntos;

  /** Live refresh: re-render only when the charge search or the points to redeem changed. */
  @Action
  Object buscarCargos() {
    var cambio =
        !java.util.Objects.equals(cargoBusqueda, ultimaBusqueda)
            || !java.util.Objects.equals(puntosAUtilizar, ultimosPuntos);
    if (!cambio) {
      return null; // another field (e.g. the email input) fired the auto-save — no re-render
    }
    ultimaBusqueda = cargoBusqueda;
    ultimosPuntos = puntosAUtilizar;
    return this;
  }

  /** The payment method changed — re-render so the points panel shows/hides. */
  @Action
  Object cambiarMetodo(HttpRequest httpRequest) {
    metodoPago = String.valueOf(httpRequest.runActionRq().parameters().get("_method"));
    return this;
  }

  /** Redeems the typed points: posts the discount line and resets the input. */
  @Audience("Staff")
  @Action
  Object redimirPuntos() {
    var puntos = puntosAUtilizar == null ? 0 : puntosAUtilizar;
    var guest = FrontOffice.stayView(stayId).guest();
    if (puntos <= 0) {
      return new Message("Indica los puntos a redimir");
    }
    if (puntos > guest.loyaltyPoints()) {
      return new Message("Solo hay " + GuestHeaders.points(guest) + " pts disponibles");
    }
    var importe = java.math.BigDecimal.valueOf(-puntos / 100.0);
    var view = FrontOffice.stayView(stayId);
    var f =
        view.folio() != null
            ? view.folio()
            : Folio.openFor("f-" + view.stay().id(), view.stay().id(), null);
    FrontOffice.folios().save(
        f.post(FolioLine.charge("Redención puntos (" + puntos + " pts)", importe)));
    puntosAUtilizar = null;
    ultimosPuntos = null;
    return List.of(
        this,
        new Message(
            "Redimidos " + puntos + " pts — " + GuestHeaders.euros(importe.doubleValue())));
  }

  /** A clicked match: post it to the folio, clear the matches and reset the search box. */
  @Audience("Staff")
  @Action
  Object seleccionarCargo(HttpRequest httpRequest) {
    var code = String.valueOf(httpRequest.runActionRq().parameters().get("_item"));
    var item = FrontOffice.chargeCatalog().findByCode(code).orElse(null);
    if (item == null) {
      return new Message("Cargo no encontrado: " + code);
    }
    var view = FrontOffice.stayView(stayId);
    var f =
        view.folio() != null
            ? view.folio()
            : Folio.openFor("f-" + view.stay().id(), view.stay().id(), null);
    FrontOffice.folios().save(f.post(FolioLine.charge(item.name(), item.price())));
    cargoBusqueda = null;
    ultimaBusqueda = null;
    return List.of(
        this, new Message("Cargo posteado — " + item.name() + " " + GuestHeaders.euros(item.price())));
  }

  @Action
  Object confirmPayment(HttpRequest httpRequest) {
    var params = httpRequest.runActionRq().parameters();
    var method =
        params != null && params.get("_method") != null
            ? String.valueOf(params.get("_method"))
            : "card";
    var methodLabel =
        switch (method) {
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
    return List.of(
        new Message("Cobro confirmado — " + total + " (" + methodLabel + ")"),
        new PageBanner(
            BannerTheme.SUCCESS,
            "Check-out completado",
            view.guest().name()
                + " · Hab "
                + view.stay().roomNumber()
                + " · Cobrados "
                + total
                + " con "
                + methodLabel
                + ". Factura disponible en el folio."));
  }

  @Override
  public void onHydrated(HttpRequest httpRequest) {
    if (stayId == null || stayId.isBlank()) {
      stayId = GuestHeaders.idFromRoute(httpRequest, "checkout");
      emailFactura = FrontOffice.stayView(stayId).guest().email();
    }
  }
}
