package io.mateu.explorer.examples.behaviour.editindrawer;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.explorer.examples.behaviour.listingdata.Order;
import io.mateu.explorer.examples.behaviour.listingdata.Orders;
import io.mateu.uidl.UserFacingException;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.CrudDisplay;
import io.mateu.uidl.data.Toggle;
import io.mateu.uidl.interfaces.CrudStore;
import java.util.List;
import java.util.Optional;

/**
 * {@code editInDrawer()}: New and a row click open the form in a drawer over the listing — the
 * listing stays mounted and refreshes in place on save. {@code display()} turns on "Save and next"
 * (it walks the listing's order, {@code nextIdAfter}); a save the store refuses shows as an error
 * banner INSIDE the drawer, keeping what was typed.
 */
@Title("Orders — edit in a drawer")
public class DrawerOrdersCrud extends AutoCrud<Order> {

  @Override
  public boolean editInDrawer() {
    return true;
  }

  @Override
  public CrudDisplay display() {
    return CrudDisplay.defaults().toBuilder().saveAndNext(Toggle.on).build();
  }

  @Override
  public CrudStore<Order> store() {
    var orders = Orders.store();
    return new CrudStore<>() {
      @Override
      public Optional<Order> findById(String id) {
        return orders.findById(id);
      }

      @Override
      public String save(Order order) {
        if (order.amount != null && order.amount > 10_000) {
          throw new UserFacingException("Over the credit limit", "An order cannot exceed 10,000.");
        }
        return orders.save(order);
      }

      @Override
      public List<Order> findAll() {
        return orders.findAll();
      }

      @Override
      public void deleteAllById(List<String> ids) {
        orders.deleteAllById(ids);
      }
    };
  }
}
