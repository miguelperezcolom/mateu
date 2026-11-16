package com.example.workshop;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.interfaces.CrudStore;
import io.mateu.uidl.interfaces.HttpRequest;

/**
 * A view that IS a CRUD over {@link Product}, reached through its menu entry (a {@code @Menu} field of the Java shell, or a
 * {@code routes.yaml} binding + {@code app.yaml} entry when the shell is YAML):
 * {@code /products} is the listing, {@code /products/new} the create form, {@code /products/{id}}
 * the detail and {@code /products/{id}/edit} the editor — all derived. The only code is naming the
 * store.
 *
 * <p>Workshop, lab 08: {@code creationForm} gives the New screen its own starting values; {@code
 * view} and {@code edit} do the same for the detail and the editor.
 */
@Title("Products")
public class Products extends AutoCrud<Product> {

  @Override
  public CrudStore<Product> store() {
    return ProductStore.INSTANCE;
  }

  /** New starts with the next free code, and as Available. */
  @Override
  public Product creationForm(HttpRequest httpRequest) {
    return new Product(
        ProductStore.INSTANCE.nextId(), "", 0, 0, ProductStatus.Available, null);
  }
}
