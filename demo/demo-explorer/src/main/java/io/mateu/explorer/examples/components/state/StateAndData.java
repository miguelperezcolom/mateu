package io.mateu.explorer.examples.components.state;

import io.mateu.uidl.data.AppData;
import io.mateu.uidl.data.AppState;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.Data;
import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.data.State;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

/**
 * What an action can answer besides components: the four scopes of values the browser holds. The
 * texts below read them with {@code ${…}} interpolation, so each button visibly changes one.
 *
 * <ul>
 *   <li>{@link State} — this component's state (its fields: what travels back with every action);
 *   <li>{@link Data} — this component's data (read-only values for the screen: options, lookups…);
 *   <li>{@link AppState} — state shared by every component of the app (sent with every request);
 *   <li>{@link AppData} — data shared by the whole app (fetched once, read anywhere).
 * </ul>
 */
public class StateAndData implements ComponentTreeSupplier {

  int visitors = 0;

  @Override
  public Component component(HttpRequest httpRequest) {
    return VerticalLayout.builder()
        .spacing(true)
        .content(
            List.of(
                new Text("state.visitors = ${state.visitors}"),
                new Text("data.lastUpdate = ${data.lastUpdate}"),
                new Text("appState.language = ${appState.language}"),
                new Text("appData.museum = ${appData.museum}"),
                HorizontalLayout.builder()
                    .spacing(true)
                    .wrap(true)
                    .content(
                        List.of(
                            button("Return State", "newState"),
                            button("Return Data", "newData"),
                            button("Return AppState", "newAppState"),
                            button("Return AppData", "newAppData")))
                    .build()))
        .build();
  }

  static Button button(String label, String actionId) {
    return Button.builder().label(label).actionId(actionId).build();
  }

  /** A new state for this component: here the view itself, with its field changed. */
  public State newState() {
    visitors++;
    return new State(this);
  }

  public Data newData() {
    return new Data(Map.of("lastUpdate", LocalTime.now().withNano(0).toString()));
  }

  public AppState newAppState() {
    return new AppState(Map.of("language", "es"));
  }

  public AppData newAppData() {
    return new AppData(Map.of("museum", "Rijksmuseum, Amsterdam"));
  }
}
