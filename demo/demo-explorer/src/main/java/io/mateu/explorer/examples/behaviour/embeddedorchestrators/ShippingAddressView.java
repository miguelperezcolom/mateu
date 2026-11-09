package io.mateu.explorer.examples.behaviour.embeddedorchestrators;

import io.mateu.core.infra.declarative.orchestrators.editableview.AutoEditableView;
import io.mateu.uidl.interfaces.HttpRequest;

/**
 * The embedded orchestrator: read-only view with an Edit button, then the editor with Save /
 * Cancel. It needs a route of its own (registered by the entry's {@code pages:}) — its island loads
 * it there.
 */
public class ShippingAddressView extends AutoEditableView<ShippingAddressView.Address> {

  public static class Address {
    public String street = "1 Navy Yard";
    public String city = "Arlington";
    public String postalCode = "22202";
  }

  private static Address stored = new Address();

  @Override
  public Address load(HttpRequest httpRequest) {
    return stored;
  }

  @Override
  public void persist(Address address, HttpRequest httpRequest) {
    stored = address;
  }
}
