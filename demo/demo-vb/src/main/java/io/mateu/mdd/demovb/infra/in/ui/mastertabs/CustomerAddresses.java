package io.mateu.mdd.demovb.infra.in.ui.mastertabs;

import io.mateu.core.infra.declarative.orchestrators.editableview.AutoEditableView;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.HashMap;
import java.util.Map;
import lombok.Data;

/** The Addresses tab: an editable view (view ↔ edit) of the customer's addresses. */
@Title("Addresses")
public class CustomerAddresses extends AutoEditableView<CustomerAddresses.Addresses> {

  static final Map<String, Addresses> STORE = new HashMap<>();

  @Data
  public static class Addresses {
    String billing = "Calle Mayor 1";
    String shipping = "Calle Mayor 1";
  }

  String customerId;

  @Override
  public Addresses load(HttpRequest httpRequest) {
    return STORE.computeIfAbsent(String.valueOf(customerId), k -> new Addresses());
  }

  @Override
  public void persist(Addresses entity, HttpRequest httpRequest) {
    STORE.put(String.valueOf(customerId), entity);
  }
}
