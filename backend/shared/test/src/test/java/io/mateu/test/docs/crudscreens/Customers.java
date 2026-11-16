package io.mateu.test.docs.crudscreens;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.CrudStore;
import jakarta.inject.Inject;

/** Level 1: the annotations on {@link Customer} do all the work. */
@UI("/customers")
@Title("Customers")
public class Customers extends AutoCrud<Customer> {

  @Inject CustomerStore customers;

  @Override
  public CrudStore<Customer> store() {
    return customers;
  }
}
