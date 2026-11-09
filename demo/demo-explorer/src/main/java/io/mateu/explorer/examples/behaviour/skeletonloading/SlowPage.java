package io.mateu.explorer.examples.behaviour.skeletonloading;

import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

/** A page that takes three seconds to build — long enough to see the skeleton the client draws. */
public class SlowPage implements ComponentTreeSupplier {

  @Override
  public Component component(HttpRequest httpRequest) {
    try {
      Thread.sleep(3000);
    } catch (InterruptedException e) {
      Thread.currentThread().interrupt();
    }
    return Form.builder()
        .title("Loaded at last")
        .content(List.of(new Text("This page took three seconds on the server.")))
        .build();
  }
}
