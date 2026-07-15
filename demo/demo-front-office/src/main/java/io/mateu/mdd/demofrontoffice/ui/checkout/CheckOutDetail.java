package io.mateu.mdd.demofrontoffice.ui.checkout;

import io.mateu.mdd.demofrontoffice.domain.folio.Folio;
import io.mateu.mdd.demofrontoffice.domain.folio.FolioLine;
import io.mateu.mdd.demofrontoffice.domain.room.Room;
import io.mateu.mdd.demofrontoffice.ui.common.FrontOffice;
import io.mateu.mdd.demofrontoffice.ui.common.GuestHeaders;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Audience;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.FormLayout;
import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Lookup;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.BannerTheme;
import io.mateu.uidl.data.Ledger;
import io.mateu.uidl.data.LedgerLine;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.PageBanner;
import io.mateu.uidl.data.PaymentMethod;
import io.mateu.uidl.data.PaymentPicker;
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

  @Section("Cobro")
  @Label("")
  Callable<Component> cobro =
      () -> {
        var f = FrontOffice.stayView(stayId).folio();
        return PaymentPicker.builder()
            .actionId("confirmPayment")
            .methods(
                List.of(
                    PaymentMethod.builder().id("card").label("Tarjeta").build(),
                    PaymentMethod.builder().id("cash").label("Efectivo").build(),
                    PaymentMethod.builder().id("points").label("Puntos").build()))
            .selected("card")
            .contextLabel("PREAUTORIZADO")
            .contextValue(GuestHeaders.euros(f == null ? null : f.preauthorized()))
            .confirmLabel("Confirmar — " + GuestHeaders.euros(GuestHeaders.balance(f)))
            .build();
      };

  @Section("Postear cargo")
  @Audience("Staff")
  @Lookup(search = CatalogOptionsSupplier.class, label = CatalogLabelSupplier.class)
  @Label("Buscar por nombre, código o descripción")
  String cargo;

  @Audience("Staff")
  @Label("Enviar factura por email")
  String emailFactura;

  @Audience("Staff")
  @Button
  @Label("Enviar factura")
  Object enviarFactura() {
    return new Message("Factura enviada a " + emailFactura);
  }

  /** Posts the picked catalog charge to the folio and re-renders the ledger. */
  @Audience("Staff")
  @Button
  @Label("Postear al folio")
  Object postearCargo() {
    if (cargo == null || cargo.isBlank()) {
      return new Message("Selecciona un cargo del catálogo");
    }
    var item = FrontOffice.chargeCatalog().findByCode(cargo).orElse(null);
    if (item == null) {
      return new Message("Cargo no encontrado: " + cargo);
    }
    var view = FrontOffice.stayView(stayId);
    var f =
        view.folio() != null
            ? view.folio()
            : Folio.openFor("f-" + view.stay().id(), view.stay().id(), null);
    FrontOffice.folios().save(f.post(FolioLine.charge(item.name(), item.price())));
    cargo = null;
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
