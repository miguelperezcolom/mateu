package io.mateu.explorer.examples.behaviour.searchfilters;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.explorer.examples.behaviour.listingdata.Order;
import io.mateu.explorer.examples.behaviour.listingdata.Orders;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.interfaces.CrudStore;

/**
 * A complete CRUD over 50 orders. The listing's smart search bar, its filters, sorting and paging —
 * and keeping all of them in the URL — come with {@code AutoCrud}; the store only lists, finds,
 * saves and deletes.
 */
@Title("Orders")
public class OrdersCrud extends AutoCrud<Order> {

  @Override
  public CrudStore<Order> store() {
    return Orders.store();
  }
}
