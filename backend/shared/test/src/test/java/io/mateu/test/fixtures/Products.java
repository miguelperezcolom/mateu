package io.mateu.test.fixtures;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.interfaces.CrudStore;
import jakarta.inject.Inject;

/** The starter's CRUD; its store is injected, like a Spring {@code @Service} would be. */
@Title("Products")
public class Products extends AutoCrud<Product> {

  @Inject ProductStore store;

  @Override
  public CrudStore<Product> store() {
    return store;
  }
}
