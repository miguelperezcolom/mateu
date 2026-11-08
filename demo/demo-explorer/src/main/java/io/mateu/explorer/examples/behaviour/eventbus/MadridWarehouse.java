package io.mateu.explorer.examples.behaviour.eventbus;

import io.mateu.uidl.annotations.Emits;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.data.UICommand;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;
import java.util.Map;

/** An emitter island, named {@code madrid} on the bus (what a COMPONENT subscriber filters by). */
@Emits(name = "madrid", events = {"stock-changed", "inner-ping"})
public class MadridWarehouse implements ComponentTreeSupplier {

  @Override
  public Component component(HttpRequest httpRequest) {
    return HorizontalLayout.builder()
        .spacing(true)
        .content(
            List.of(
                Button.builder()
                    .label("Madrid: stock changed")
                    .actionId("madridStock")
                    .callable(
                        () -> UICommand.dispatchEvent("stock-changed", Map.of("warehouse", "Madrid")))
                    .build(),
                Button.builder()
                    .label("Madrid: inner ping")
                    .actionId("madridPing")
                    .callable(
                        () -> UICommand.dispatchEvent("inner-ping", Map.of("warehouse", "Madrid")))
                    .build()))
        .build();
  }
}
