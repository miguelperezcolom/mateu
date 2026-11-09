package io.mateu.explorer.examples.behaviour.liveheadervalues;

import io.mateu.uidl.LiveHeaderValues;
import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.HeaderValue;
import io.mateu.uidl.interfaces.HeaderValuesSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

/**
 * Values on the app header that change while you look at them:
 *
 * <ul>
 *   <li>{@link HeaderValuesSupplier} gives their initial value;
 *   <li>{@code UICommand.updateHeaderValue(id, value)} changes one in THIS browser (all its tabs);
 *   <li>{@code LiveHeaderValues.publish(id, value)} changes it in EVERY open session — they listen
 *       on one event stream per browser, switched on by {@code @App(liveUpdates = true)}.
 * </ul>
 */
@UI("/apps/live-header")
@Title("Live header values demo")
@App(liveUpdates = true)
public class LiveHeaderDemoApp implements HeaderValuesSupplier {

  @Menu FrontDesk frontDesk;

  @Override
  public List<HeaderValue> headerValues(HttpRequest httpRequest) {
    var current = LiveHeaderValues.current();
    return List.of(
        new HeaderValue("businessDate", "Business date", current.getOrDefault("businessDate", "2026-11-08")),
        new HeaderValue("arrivals", "Arrivals", current.getOrDefault("arrivals", "12")));
  }
}
