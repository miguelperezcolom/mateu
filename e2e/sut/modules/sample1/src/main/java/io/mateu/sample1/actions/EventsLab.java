package io.mateu.sample1.actions;

import io.mateu.uidl.annotations.SubscribeTo;
import io.mateu.uidl.annotations.SubscriptionSource;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.State;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import lombok.Getter;
import lombok.Setter;

/**
 * The event bus walked across its three scopes. Two emitter islands ({@link PingEmitterA},
 * {@link PingEmitterB}) and a listener island ({@link FilteredListener}) sit on this page:
 *
 * <ul>
 *   <li>DOCUMENT — this page hears every {@code lab-ping}, whoever sent it;
 *   <li>COMPONENT — the listener island hears {@code lab-ping} only from {@code emitter-a};
 *   <li>SELF — this page hears {@code child-ping}, which bubbles up from an island inside it.
 * </ul>
 */
@UI("/events-lab")
@Title("Events lab")
@SubscribeTo(event = "lab-ping", action = "onPing")
@SubscribeTo(event = "child-ping", action = "onChild", source = SubscriptionSource.SELF)
@Getter
@Setter
public class EventsLab {

  String heardByPage = "";
  String heardFromChild = "";

  Component emitterA = new PingEmitterA();
  Component emitterB = new PingEmitterB();
  Component listener = new FilteredListener();

  public State onPing(HttpRequest httpRequest) {
    heardByPage = "ping from " + httpRequest.runActionRq().parameters().get("from");
    return new State(this);
  }

  public State onChild(HttpRequest httpRequest) {
    heardFromChild = "child ping from " + httpRequest.runActionRq().parameters().get("from");
    return new State(this);
  }
}
