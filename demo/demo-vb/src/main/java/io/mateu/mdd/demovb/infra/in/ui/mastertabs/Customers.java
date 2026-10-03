package io.mateu.mdd.demovb.infra.in.ui.mastertabs;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.mdd.demovb.infra.in.ui.mastertabs.MasterTabsDb.Customer;
import io.mateu.uidl.annotations.RowRoute;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.interfaces.CrudStore;
import java.util.List;
import java.util.Optional;

/** The listing a record master is opened from: a row goes to /customers/:customerId. */
@Title("Customers")
@RowRoute("/customers/${row.id}")
public class Customers extends AutoCrud<Customer> {

  @Override
  public CrudStore<Customer> store() {
    return new CrudStore<>() {
      @Override
      public Optional<Customer> findById(String id) {
        return Optional.ofNullable(MasterTabsDb.customer(id));
      }

      @Override
      public String save(Customer entity) {
        return entity.getId();
      }

      @Override
      public List<Customer> findAll() {
        return MasterTabsDb.CUSTOMERS;
      }

      @Override
      public void deleteAllById(List<String> selectedIds) {}
    };
  }
}
