package io.mateu.sample1.shell;

import io.mateu.uidl.annotations.App;
import io.mateu.uidl.fluent.AppVariant;
import io.mateu.uidl.interfaces.TitleSupplier;

/**
 * A record master whose tabs are its routes.yaml {@code children}: {@code /shell/customers/7}
 * opens {@code /shell/customers/7/orders} inside the master's slot.
 */
@App(AppVariant.TABS)
public class ShellCustomerMaster implements TitleSupplier {

  String customerId;

  @Override
  public String title() {
    return "Customer " + customerId;
  }
}
