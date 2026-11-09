package io.mateu.explorer.examples.behaviour.eventbus;

import io.mateu.uidl.annotations.SubscribeTo;
import io.mateu.uidl.annotations.SubscriptionSource;
import io.mateu.uidl.data.State;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

/** A listener island: {@code stock-changed} only FROM {@code madrid} (COMPONENT scope). */
@SubscribeTo(
    event = "stock-changed",
    action = "heard",
    source = SubscriptionSource.COMPONENT,
    from = "madrid")
public class MadridListener implements ComponentTreeSupplier {

  int times = 0;

  @Override
  public Component component(HttpRequest httpRequest) {
    return new Text("madrid-listener", "Madrid listener heard ${state.times} event(s)");
  }

  public State heard(HttpRequest httpRequest) {
    times++;
    return new State(this);
  }
}
