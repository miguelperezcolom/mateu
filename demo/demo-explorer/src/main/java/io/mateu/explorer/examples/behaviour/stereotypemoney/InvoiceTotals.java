package io.mateu.explorer.examples.behaviour.stereotypemoney;

import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.PlainText;
import io.mateu.uidl.annotations.Stereotype;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.Amount;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.Message;
import java.math.BigDecimal;

/**
 * Money: {@code @Stereotype(money)} on a number formats it as an amount (thousands separator, two
 * decimals, the UI's locale); a read-only ({@code @PlainText}) one keeps the dense text rendering
 * and is still formatted. An {@link Amount} carries its own currency and is money by itself.
 */
@Title("Invoice")
public class InvoiceTotals {

  @Stereotype(FieldStereotype.money)
  BigDecimal subtotal = new BigDecimal("12450.5");

  @PlainText
  @Stereotype(FieldStereotype.money)
  double creditLimit = 250000;

  @PlainText Amount deposit = new Amount("EUR", 1200.75, "en-GB");

  @Button
  Message show() {
    return Message.success("Subtotal (as the server sees it): " + subtotal);
  }
}
