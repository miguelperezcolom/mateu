package io.mateu.mdd.demovb.infra.in.ui.mastertabs;

import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Subresource;
import io.mateu.uidl.annotations.Tab;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.PostHydrationHandler;
import io.mateu.uidl.interfaces.TitleSupplier;

/**
 * The other shape of a record master: ONE page whose in-page tabs are URLs ({@code @Tab(key)} —
 * /customer-overview/3/billing opens Billing) and whose sub-listings are {@code @Subresource}s:
 * Orders alone in its tab, fetched with the page and counted on the tab; Invoices and Payments
 * stacked in Billing, each with its title and help, fetched when the tab is opened. They all get
 * the customer as context ({@code customerId}, read off the route), never as a filter to remove.
 */
public class CustomerOverview implements PostHydrationHandler, TitleSupplier {

  @io.mateu.uidl.annotations.Hidden String customerId;

  @Tab(value = "Details", key = "details")
  @ReadOnly
  String name;

  @ReadOnly String email;

  @ReadOnly String city;

  @Subresource(tab = "orders", load = Subresource.Load.EAGER)
  OrdersOfCustomer orders;

  @Subresource(tab = "billing", order = 1, help = "Invoices issued to this customer")
  InvoicesOfCustomer invoices;

  @Subresource(tab = "billing", order = 2, help = "Payments received from this customer")
  PaymentsOfCustomer payments;

  @Tab(value = "Simulator", key = "simulator", show = "simulator")
  @ReadOnly
  String simulatorNote = "Behind the `simulator` flag";

  @Override
  public void onHydrated(HttpRequest httpRequest) {
    var customer = customerId == null ? null : MasterTabsDb.customer(customerId);
    if (customer != null) {
      name = customer.getName();
      email = customer.getEmail();
      city = customer.getCity();
    }
  }

  @Override
  public String title() {
    return name == null ? "Customer " + customerId : name;
  }
}
