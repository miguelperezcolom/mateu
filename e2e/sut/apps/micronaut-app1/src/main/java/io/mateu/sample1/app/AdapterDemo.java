package io.mateu.sample1.app;

import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.interfaces.HttpRequest;

/**
 * A plain domain object carrying no Mateu form annotations: its whole UI and state round-trip are
 * defined by {@link AdapterDemoAdapter}, a registered {@code ComponentAdapter<AdapterDemo>}. The
 * {@code @UI} only registers the route; field initializers seed the initial view.
 */
@UI("/adapter-demo")
public class AdapterDemo {

  public String code = "SKU-001";
  public String name = "Sample product";
  public int quantity = 7;

  public AdapterDemo() {}

  /** Runs after the action state has been deserialized back into this instance. */
  Object save(HttpRequest httpRequest) {
    return Message.success("Saved: " + code + " / " + name + " / " + quantity);
  }
}
