package com.example.app;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.CrudStore;

/**
 * The whole UI: a routed view that IS a CRUD over {@link Product}, mounted at the app root. {@code
 * /} is the listing, {@code /new} the create form, {@code /{id}} the detail and {@code /{id}/edit}
 * the editor — all derived. The only code is naming the store.
 */
@UI("")
@Title("Products")
public class Products extends AutoCrud<Product> {

  @Override
  public CrudStore<Product> store() {
    return ProductStore.INSTANCE;
  }
}
