package com.example.app;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.interfaces.CrudStore;

/**
 * A view that IS a CRUD over {@link Product}, reached through its menu entry (a {@code @Menu} field of the Java shell, or a
 * {@code routes.yaml} binding + {@code app.yaml} entry when the shell is YAML):
 * {@code /products} is the listing, {@code /products/new} the create form, {@code /products/{id}}
 * the detail and {@code /products/{id}/edit} the editor — all derived. The only code is naming the
 * store.
 */
@Title("Products")
public class Products extends AutoCrud<Product> {

  @Override
  public CrudStore<Product> store() {
    return ProductStore.INSTANCE;
  }
}
