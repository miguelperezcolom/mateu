package io.mateu.test.docs.crudscreens;

import io.mateu.core.infra.declarative.orchestrators.crud.Crud;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.SearchRequest;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.inject.Inject;
import java.util.List;

/** Level 3: a class per screen — Crud<View, Editor, CreationForm, Filters, Row, IdType>. */
@UI("/accounts")
@Title("Customers")
public class CustomerAccounts
    extends Crud<CustomerCard, CustomerEditor, NewCustomer, CustomerFilters, Customer, String> {

  @Inject CustomerStore customers;

  @Override
  public ListingData<Customer> search(SearchRequest request, HttpRequest httpRequest) {
    return ListingData.from(customers.findAll());
  }

  @Override
  public CustomerCard view(String id, HttpRequest httpRequest) {
    var c = customers.findById(id).orElseThrow();
    return new CustomerCard(
        c.name(), c.email(), c.customerSince(), customers.openOrdersOf(id) + " open orders");
  }

  @Override
  public CustomerEditor edit(String id, HttpRequest httpRequest) {
    var c = customers.findById(id).orElseThrow();
    return new CustomerEditor(c.id(), c.name(), c.email());
  }

  @Override
  public NewCustomer creationForm(HttpRequest httpRequest) {
    return new NewCustomer(customers.nextId(), "");
  }

  @Override
  public String save(HttpRequest httpRequest) {
    var editor = httpRequest.getComponentState(CustomerEditor.class);
    var c = customers.findById(editor.id()).orElseThrow();
    customers.save(
        new Customer(
            c.id(),
            editor.name(),
            editor.email(),
            c.customerSince(),
            c.internalNotes(),
            c.creditLimit(),
            c.openOrders()));
    return editor.id();
  }

  @Override
  public String create(HttpRequest httpRequest) {
    var form = httpRequest.getComponentState(NewCustomer.class);
    return customers.save(new Customer(form.id(), form.name(), null, null, null, 0, 0));
  }

  @Override
  public void deleteAllById(List<String> ids, HttpRequest httpRequest) {
    customers.deleteAllById(ids);
  }
}
