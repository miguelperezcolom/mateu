package io.mateu.explorer.examples.behaviour.actioncatalogue;

import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

/**
 * From Java, the same: a button whose actionId is a catalogue id. This view has no method called
 * {@code behaviourPing} — the id resolves from the catalogue (actions.yaml) and runs in the browser.
 */
public class CatalogueButtons implements ComponentTreeSupplier {

  @Override
  public Component component(HttpRequest httpRequest) {
    return VerticalLayout.builder()
        .content(
            List.of(
                new Text("A Java view naming the same catalogue action:"),
                Button.builder().label("Ping (from Java)").actionId("behaviourPing").build()))
        .build();
  }
}
