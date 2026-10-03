package io.mateu.mdd.demovb.infra.in.ui.mastertabs;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.mdd.demovb.infra.in.ui.mastertabs.MasterTabsDb.Invoice;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.interfaces.CrudStore;
import java.util.List;
import java.util.Optional;

/** A sub-resource: the customer's payments, stacked in the overview's Billing tab. */
@Title("Payments")
public class PaymentsOfCustomer extends AutoCrud<Invoice> {

  public String customerId;

  @Override
  public CrudStore<Invoice> store() {
    return new CrudStore<>() {
      @Override
      public Optional<Invoice> findById(String id) {
        return MasterTabsDb.PAYMENTS.stream().filter(i -> i.getId().equals(id)).findFirst();
      }

      @Override
      public String save(Invoice entity) {
        return entity.getId();
      }

      @Override
      public List<Invoice> findAll() {
        return MasterTabsDb.PAYMENTS.stream()
            .filter(i -> i.getCustomerId().equals(customerId))
            .toList();
      }

      @Override
      public void deleteAllById(List<String> selectedIds) {}
    };
  }
}
