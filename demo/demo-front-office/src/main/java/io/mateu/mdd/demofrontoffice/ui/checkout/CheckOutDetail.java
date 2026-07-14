package io.mateu.mdd.demofrontoffice.ui.checkout;

import io.mateu.mdd.demofrontoffice.data.HotelData;
import io.mateu.mdd.demofrontoffice.ui.common.GuestHeaders;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Audience;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.FormLayout;
import io.mateu.uidl.annotations.Lookup;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.BannerTheme;
import io.mateu.uidl.data.Ledger;
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
 * Check-out of one departing guest (route {@code /checkout/:id}): the guest banner, the folio
 * ledger and the payment picker for every audience; posting catalog charges and emailing the
 * invoice are staff-only ({@code @Audience("Staff")}) — the Cliente projection mirrors the guest
 * self-checkout screen.
 */
@Getter
@Setter
@Route(value = "/checkout/:id", parentRoute = "")
@Title("Check-Out")
@FormLayout(columns = 1)
public class CheckOutDetail implements PostHydrationHandler {

  @Hidden String guestId;

  @Label("")
  Callable<Component> header = () -> GuestHeaders.departureHeader(guestId);

  @Section("Desglose folio")
  @Label("")
  Callable<Component> folio =
      () -> {
        var g = HotelData.departure(guestId);
        return Ledger.builder()
            .style("width: 100%; max-width: 900px;")
            .currency("€")
            .totalLabel("Total")
            .lines(g.folio())
            .total(g.total())
            .build();
      };

  @Section("Cobro")
  @Label("")
  Callable<Component> cobro =
      () -> {
        var g = HotelData.departure(guestId);
        return PaymentPicker.builder()
            .actionId("confirmPayment")
            .methods(
                List.of(
                    PaymentMethod.builder().id("card").label("Tarjeta").build(),
                    PaymentMethod.builder().id("cash").label("Efectivo").build(),
                    PaymentMethod.builder().id("points").label("Puntos").build()))
            .selected("card")
            .contextLabel("PREAUTORIZADO")
            .contextValue(GuestHeaders.euros(g.preauthorized()))
            .confirmLabel("Confirmar — " + GuestHeaders.euros(g.total()))
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

  @Action
  Object confirmPayment(HttpRequest httpRequest) {
    var params = httpRequest.runActionRq().parameters();
    var method = params != null && params.get("_method") != null ? String.valueOf(params.get("_method")) : "card";
    var methodLabel =
        switch (method) {
          case "cash" -> "Efectivo";
          case "points" -> "Puntos";
          default -> "Tarjeta";
        };
    var g = HotelData.departure(guestId);
    return List.of(
        new Message("Cobro confirmado — " + GuestHeaders.euros(g.total()) + " (" + methodLabel + ")"),
        new PageBanner(
            BannerTheme.SUCCESS,
            "Check-out completado",
            g.name()
                + " · Hab "
                + g.room()
                + " · Cobrados "
                + GuestHeaders.euros(g.total())
                + " con "
                + methodLabel
                + ". Factura disponible en el folio."));
  }

  @Override
  public void onHydrated(HttpRequest httpRequest) {
    if (guestId == null || guestId.isBlank()) {
      guestId = GuestHeaders.idFromRoute(httpRequest, "checkout");
      emailFactura = HotelData.departure(guestId).email();
    }
  }
}
