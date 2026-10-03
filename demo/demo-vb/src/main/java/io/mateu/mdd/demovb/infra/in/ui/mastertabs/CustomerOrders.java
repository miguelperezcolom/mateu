package io.mateu.mdd.demovb.infra.in.ui.mastertabs;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.mdd.demovb.infra.in.ui.mastertabs.MasterTabsDb.Order;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.interfaces.CrudStore;
import java.util.List;
import java.util.Optional;

/**
 * The Orders tab: a crud scoped to the master's customer. {@code customerId} arrives from the URL
 * (:customerId) on every request — it shows as a fixed scope chip, not a removable filter — and a
 * new order created here belongs to that customer.
 */
@Title("Orders")
public class CustomerOrders extends AutoCrud<Order> {

  String customerId;

  @Override
  public CrudStore<Order> store() {
    return new CrudStore<>() {
      @Override
      public Optional<Order> findById(String id) {
        return MasterTabsDb.ORDERS.stream().filter(o -> o.getId().equals(id)).findFirst();
      }

      @Override
      public String save(Order entity) {
        if (entity.getId() == null || entity.getId().isBlank()) {
          entity.setId(customerId + "-" + MasterTabsDb.SEQ.incrementAndGet());
          entity.setCustomerId(customerId);
          MasterTabsDb.ORDERS.add(entity);
        } else {
          MasterTabsDb.ORDERS.replaceAll(o -> o.getId().equals(entity.getId()) ? entity : o);
        }
        return entity.getId();
      }

      @Override
      public List<Order> findAll() {
        return MasterTabsDb.ORDERS.stream()
            .filter(o -> o.getCustomerId().equals(customerId))
            .toList();
      }

      @Override
      public void deleteAllById(List<String> selectedIds) {
        MasterTabsDb.ORDERS.removeIf(o -> selectedIds.contains(o.getId()));
      }
    };
  }
}
