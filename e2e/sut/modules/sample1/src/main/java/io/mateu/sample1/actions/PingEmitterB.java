package io.mateu.sample1.actions;

import io.mateu.uidl.annotations.Emits;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.UICommand;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.Map;

/** A second emitter, named {@code emitter-b}: a COMPONENT subscriber to emitter-a ignores it. */
@Emits(name = "emitter-b", events = "lab-ping")
public class PingEmitterB implements ComponentTreeSupplier {

  @Override
  public Component component(HttpRequest httpRequest) {
    return new Button("Ping B", () -> UICommand.dispatchEvent("lab-ping", Map.of("from", "B")));
  }
}
