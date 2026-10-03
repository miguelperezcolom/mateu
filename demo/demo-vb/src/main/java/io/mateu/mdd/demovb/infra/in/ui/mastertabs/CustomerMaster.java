package io.mateu.mdd.demovb.infra.in.ui.mastertabs;

import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.BackLink;
import io.mateu.uidl.data.AppHeaderAction;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.fluent.AppVariant;
import io.mateu.uidl.interfaces.AppActionsSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.TitleSupplier;
import java.util.List;

/**
 * The record master: /customers/:customerId. An App(TABS) with no menu of its own — its tabs are
 * its children in routes.yaml (orders, addresses, history, and audit behind a feature flag), each
 * one a page with its own URL. The way back up is «← Customers» (backLink = PARENT), not crumbs.
 */
@App(value = AppVariant.TABS, backLink = BackLink.PARENT)
public class CustomerMaster implements TitleSupplier, AppActionsSupplier {

  String customerId;

  @Override
  public String title() {
    var customer = customerId == null ? null : MasterTabsDb.customer(customerId);
    return customer == null ? "Customer " + customerId : customer.getName();
  }

  @Override
  public List<AppHeaderAction> appActions(HttpRequest httpRequest) {
    return List.of(new AppHeaderAction("block", "Block customer", "vaadin:ban"));
  }

  public Message block() {
    return new Message("Customer " + customerId + " blocked");
  }
}
