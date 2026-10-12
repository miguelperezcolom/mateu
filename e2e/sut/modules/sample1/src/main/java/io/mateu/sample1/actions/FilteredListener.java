package io.mateu.sample1.actions;

import io.mateu.uidl.annotations.SubscribeTo;
import io.mateu.uidl.annotations.SubscriptionSource;
import io.mateu.uidl.data.State;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

/** An island that listens to {@code lab-ping} from {@code emitter-a} only (COMPONENT scope). */
@SubscribeTo(
    event = "lab-ping",
    action = "heard",
    source = SubscriptionSource.COMPONENT,
    from = "emitter-a")
public class FilteredListener implements ComponentTreeSupplier {

  int times = 0;
  String last = "nothing";

  @Override
  public Component component(HttpRequest httpRequest) {
    return new Text("listener", "Listener heard ${state.last} (${state.times})");
  }

  public State heard(HttpRequest httpRequest) {
    times++;
    last = "from " + httpRequest.runActionRq().parameters().get("from");
    return new State(this);
  }
}
