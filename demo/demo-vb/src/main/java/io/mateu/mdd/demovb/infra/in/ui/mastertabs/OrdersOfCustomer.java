package io.mateu.mdd.demovb.infra.in.ui.mastertabs;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.mdd.demovb.infra.in.ui.mastertabs.MasterTabsDb.Order;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.interfaces.CrudStore;
import java.util.List;
import java.util.Optional;

/** A sub-resource: the customer's orders, embedded in the overview's Orders tab. */
@Title("Orders")
public class OrdersOfCustomer extends AutoCrud<Order> {

  public String customerId;

  @Override
  public CrudStore<Order> store() {
    return new CrudStore<>() {
      @Override
      public Optional<Order> findById(String id) {
        return MasterTabsDb.ORDERS.stream().filter(o -> o.getId().equals(id)).findFirst();
      }

      @Override
      public String save(Order entity) {
        return entity.getId();
      }

      @Override
      public List<Order> findAll() {
        return MasterTabsDb.ORDERS.stream()
            .filter(o -> o.getCustomerId().equals(customerId))
            .toList();
      }

      @Override
      public void deleteAllById(List<String> selectedIds) {}
    };
  }
}
