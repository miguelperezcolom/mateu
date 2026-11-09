package io.mateu.explorer.examples.behaviour.embeddedorchestrators;

import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Inline;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.PlainText;
import io.mateu.uidl.annotations.Section;

/**
 * A normal page with a field whose TYPE is an orchestrator ({@link ShippingAddressView}, an {@code
 * AutoEditableView}). The field becomes an independent island: it toggles view ↔ edit and saves on
 * its own, without re-rendering this page. {@code @Inline} folds its title into the section.
 */
@Title("Customer")
public class CustomerPage {

  @Section("Customer")
  @PlainText
  String name = "Grace Hopper";

  @PlainText String customerSince = "2019";

  @Section("Shipping address")
  @Label("")
  @Inline
  ShippingAddressView address;
}
