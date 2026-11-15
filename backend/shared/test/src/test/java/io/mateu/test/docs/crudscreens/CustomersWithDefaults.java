package io.mateu.test.docs.crudscreens;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.CrudStore;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.inject.Inject;

/** Level 2: the same record, other content per screen. */
@UI("/customers-v2")
@Title("Customers")
public class CustomersWithDefaults extends AutoCrud<Customer> {

  @Inject CustomerStore customers;

  @Override
  public CrudStore<Customer> store() {
    return customers;
  }

  /** New: the next free code and a starting credit limit. */
  @Override
  public Customer creationForm(HttpRequest httpRequest) {
    return new Customer(customers.nextId(), "", null, null, null, 1000, 0);
  }

  /** The detail: a value computed only for this screen. */
  @Override
  public Customer view(String id, HttpRequest httpRequest) {
    return super.view(id, httpRequest).withOpenOrders(customers.openOrdersOf(id));
  }

  /** The editor: proposes an e-mail when the record has none. */
  @Override
  public Customer edit(String id, HttpRequest httpRequest) {
    var customer = super.edit(id, httpRequest);
    return customer.email() != null
        ? customer
        : customer.withEmail(customer.name().toLowerCase().replace(' ', '.') + "@example.com");
  }
}
