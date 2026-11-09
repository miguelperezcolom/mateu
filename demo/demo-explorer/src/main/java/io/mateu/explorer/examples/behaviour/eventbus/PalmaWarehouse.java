package io.mateu.explorer.examples.behaviour.eventbus;

import io.mateu.uidl.annotations.Emits;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.UICommand;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.Map;

/** A second emitter, named {@code palma}: the DOCUMENT subscriber hears it, the COMPONENT one not. */
@Emits(name = "palma", events = {"stock-changed"})
public class PalmaWarehouse implements ComponentTreeSupplier {

  @Override
  public Component component(HttpRequest httpRequest) {
    return Button.builder()
        .label("Palma: stock changed")
        .actionId("palmaStock")
        .callable(() -> UICommand.dispatchEvent("stock-changed", Map.of("warehouse", "Palma")))
        .build();
  }
}
