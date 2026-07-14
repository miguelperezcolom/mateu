package io.mateu.mdd.demoadminpanel.infra.in.ui.frontoffice;

import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.PaymentMethod;
import io.mateu.uidl.data.PaymentPicker;
import io.mateu.uidl.fluent.Component;
import java.util.List;

/** Demo of the {@link PaymentPicker} component: check-out payment method and confirm CTA. */
@UI("/payment-picker-demo")
@Title("Payment")
public class CheckoutPayment {

  @Section("Cobro")
  Component payment =
      PaymentPicker.builder()
          .actionId("confirmPayment")
          .methods(
              List.of(
                  PaymentMethod.builder().id("card").label("Tarjeta").build(),
                  PaymentMethod.builder().id("cash").label("Efectivo").build(),
                  PaymentMethod.builder().id("points").label("Puntos").build()))
          .selected("card")
          .contextLabel("PREAUTORIZADO")
          .contextValue("€ 1.800,00")
          .confirmLabel("Confirmar — € 1.710,50")
          .build();

  @Action
  Object confirmPayment() {
    return new Message("This would charge the folio and close the check-out");
  }
}
