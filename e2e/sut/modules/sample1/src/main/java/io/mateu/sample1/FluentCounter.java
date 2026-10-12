package io.mateu.sample1;

import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.Card;
import io.mateu.uidl.data.State;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

/**
 * A component tree whose buttons carry their own handler (a lambda) — the demo.mateu.io counter.
 * No action METHOD backs "increment" (the method is package-private) nor "addTen" (no method at
 * all), so the view has to advertise the buttons' ids or the browser drops the click.
 */
@UI("/fluent-counter")
public class FluentCounter implements ComponentTreeSupplier {

  int count = 0;

  FluentCounter increment() {
    count++;
    return this;
  }

  @Override
  public Component component(HttpRequest httpRequest) {
    return new VerticalLayout(
        new Text("count", "Count: ${state.count}"),
        new Button("Increment", () -> new State(increment())),
        Card.builder()
            .content(
                new Button(
                    "Add ten",
                    () -> {
                      count += 10;
                      return new State(this);
                    }))
            .build());
  }
}
