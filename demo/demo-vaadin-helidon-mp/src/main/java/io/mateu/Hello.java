package io.mateu;

import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.State;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

@UI("")
public class Hello implements ComponentTreeSupplier {

  int count = 0;

  Hello increment() {
    count++;
    return this;
  }

  @Override
  public Component component(HttpRequest httpRequest) {
    return new VerticalLayout(
        new Text("Hello from Mateu on Helidon MP!"),
        new Text("Count: ${state.count}"),
        new Button("Increment", () -> new State(increment())));
  }
}
