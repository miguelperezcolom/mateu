package io.mateu.explorer.examples.components.partial;

import io.mateu.uidl.data.ComponentRef;
import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.data.Partial;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

/** The same references from Java: a Partial by its file, a ComponentRef by its catalogue name. */
public class MuseumInfo implements ComponentTreeSupplier {

  @Override
  public Component component(HttpRequest httpRequest) {
    return HorizontalLayout.builder()
        .spacing(true)
        .wrap(true)
        .content(
            List.of(
                new Partial("explorer/components/partial/opening-hours.yaml"),
                new ComponentRef("ExplorerTicketPrices")))
        .build();
  }
}
