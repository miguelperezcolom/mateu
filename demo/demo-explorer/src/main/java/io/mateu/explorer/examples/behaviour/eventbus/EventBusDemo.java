package io.mateu.explorer.examples.behaviour.eventbus;

import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.PlainText;
import io.mateu.uidl.annotations.SubscribeTo;
import io.mateu.uidl.annotations.SubscriptionSource;
import io.mateu.uidl.data.State;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;

/**
 * Components talk through named events. An emitter returns {@code UICommand.dispatchEvent(name,
 * payload)}; a subscriber declares {@code @SubscribeTo(event, action)} and Mateu runs that action,
 * on the subscriber, with the payload as parameters. The scope says what is heard:
 *
 * <ul>
 *   <li>{@code DOCUMENT} (default) — the global bus: this page hears {@code stock-changed} from
 *       either warehouse;
 *   <li>{@code COMPONENT} — only from a named emitter: {@link MadridListener} hears {@code
 *       stock-changed} only from {@code @Emits(name = "madrid")};
 *   <li>{@code SELF} — only events bubbling up from inside: this page hears {@code inner-ping} from
 *       the islands it contains.
 * </ul>
 */
@Title("Warehouses")
@SubscribeTo(event = "stock-changed", action = "onStockChanged")
@SubscribeTo(event = "inner-ping", action = "onInnerPing", source = SubscriptionSource.SELF)
public class EventBusDemo {

  @PlainText String heardOnTheBus = "nothing yet";

  @PlainText String heardFromInside = "nothing yet";

  Component madrid = new MadridWarehouse();

  Component palma = new PalmaWarehouse();

  Component listener = new MadridListener();

  public State onStockChanged(HttpRequest httpRequest) {
    heardOnTheBus = "stock changed in " + httpRequest.runActionRq().parameters().get("warehouse");
    return new State(this);
  }

  public State onInnerPing(HttpRequest httpRequest) {
    heardFromInside = "ping from " + httpRequest.runActionRq().parameters().get("warehouse");
    return new State(this);
  }
}
