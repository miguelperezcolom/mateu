package io.mateu.mdd.redwoodshowcase.ui.forms;

import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.Amount;
import io.mateu.uidl.data.FieldStereotype;
import java.math.BigDecimal;

/**
 * Review fixture for the typed inputs: email, link (URL) and money fields, editable and read-only,
 * as plain numbers and as {@link Amount}s carrying their own currency.
 */
@UI("/typed-inputs")
@Title("Typed inputs")
public class ContactAndMoneyFields {

  @Section(value = "Editable", columns = 2)
  @Stereotype(FieldStereotype.email)
  String email = "ada@example.com";

  @Stereotype(FieldStereotype.link)
  String website = "https://mateu.io";

  @Stereotype(FieldStereotype.money)
  BigDecimal salary = new BigDecimal("98000");

  @Label("Deposit (USD Amount)")
  Amount deposit = new Amount("USD", 1250.5, "en-US");

  @Section(value = "Read only", columns = 2)
  @ReadOnly
  @Stereotype(FieldStereotype.email)
  String supportEmail = "support@example.com";

  @ReadOnly
  @Stereotype(FieldStereotype.link)
  String docs = "https://mateu.io/docs";

  @ReadOnly
  @Stereotype(FieldStereotype.money)
  BigDecimal budget = new BigDecimal("12500.75");

  @ReadOnly
  @Label("Balance (GBP Amount)")
  Amount balance = new Amount("GBP", 320.0, "en-GB");
}
