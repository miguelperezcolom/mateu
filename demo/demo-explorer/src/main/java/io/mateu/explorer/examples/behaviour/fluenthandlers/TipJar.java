package io.mateu.explorer.examples.behaviour.fluenthandlers;

import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.data.State;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

/**
 * A component tree whose buttons carry their OWN handler — a lambda run on the server against this
 * instance — instead of naming an action method. The handler returns what an action returns (here,
 * the new state). No {@code actionId} is needed: Mateu names the action after the label.
 */
public class TipJar implements ComponentTreeSupplier {

  int tips = 0;

  @Override
  public Component component(HttpRequest httpRequest) {
    return VerticalLayout.builder()
        .content(
            java.util.List.of(
                new Text("Tips today: ${state.tips} €"),
                HorizontalLayout.builder()
                    .spacing(true)
                    .content(
                        java.util.List.of(
                            Button.builder()
                                .label("+1 €")
                                .callable(() -> {
                                  tips += 1;
                                  return new State(this);
                                })
                                .build(),
                            Button.builder()
                                .label("+5 €")
                                .callable(() -> {
                                  tips += 5;
                                  return new State(this);
                                })
                                .build()))
                    .build()))
        .build();
  }
}
