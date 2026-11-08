package io.mateu.explorer.examples.behaviour.savedviews;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.explorer.examples.behaviour.listingdata.Order;
import io.mateu.explorer.examples.behaviour.listingdata.Orders;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.interfaces.CrudStore;

/**
 * Nothing to declare: saved views (★ in the search bar) and the column chooser (the columns button
 * beside it) are on EVERY listing. Both live in the browser — the views and the visible columns are
 * remembered per page, per user, without a server round trip.
 */
@Title("Orders — views and columns")
public class OrderViewsCrud extends AutoCrud<Order> {

  @Override
  public CrudStore<Order> store() {
    return Orders.store();
  }
}
