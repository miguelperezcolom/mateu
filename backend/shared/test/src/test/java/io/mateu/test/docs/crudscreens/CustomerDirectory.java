package io.mateu.test.docs.crudscreens;

import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.SearchRequest;
import io.mateu.uidl.interfaces.Creatable;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Listing;
import io.mateu.uidl.interfaces.Navigable;
import jakarta.inject.Inject;

/** Level 3, à la carte: a detail and a creation form of their own, and no editor at all. */
@UI("/directory")
@Title("Customers")
public class CustomerDirectory
    implements Listing<Customer>, Navigable<CustomerCard, String>, Creatable<NewCustomer, String> {

  @Inject CustomerStore customers;

  @Override
  public ListingData<Customer> search(SearchRequest request, HttpRequest httpRequest) {
    return ListingData.from(customers.findAll());
  }

  @Override
  public CustomerCard view(String id, HttpRequest httpRequest) {
    var c = customers.findById(id).orElseThrow();
    return new CustomerCard(c.name(), c.email(), c.customerSince(), "");
  }

  @Override
  public NewCustomer creationForm(HttpRequest httpRequest) {
    return new NewCustomer(customers.nextId(), "");
  }

  @Override
  public String create(HttpRequest httpRequest) {
    var form = httpRequest.getComponentState(NewCustomer.class);
    return customers.save(new Customer(form.id(), form.name(), null, null, null, 0, 0));
  }
}
