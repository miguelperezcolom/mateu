package io.mateu.sample1.actions;

import io.mateu.uidl.annotations.Emits;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.data.UICommand;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.Map;

/** An island that emits, named {@code emitter-a} on the bus. */
@Emits(
    name = "emitter-a",
    events = {"lab-ping", "child-ping"})
public class PingEmitterA implements ComponentTreeSupplier {

  @Override
  public Component component(HttpRequest httpRequest) {
    return new HorizontalLayout(
        new Button("Ping A", () -> UICommand.dispatchEvent("lab-ping", Map.of("from", "A"))),
        new Button(
            "Child ping A", () -> UICommand.dispatchEvent("child-ping", Map.of("from", "A"))));
  }
}
