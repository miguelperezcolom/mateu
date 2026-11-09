package io.mateu.explorer.examples.components.split;

import io.mateu.uidl.data.BulletedList;
import io.mateu.uidl.data.SplitLayout;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

/** A SplitLayout in Java: master and detail, separated by a draggable splitter. */
public class FluentSplit implements ComponentTreeSupplier {

  @Override
  public Component component(HttpRequest httpRequest) {
    return SplitLayout.builder()
        .style("height: 10rem;")
        .master(BulletedList.builder().items(List.of("101 — Standard", "102 — Deluxe", "201 — Junior suite")).build())
        .detail(new Text("Room 102 — Deluxe: 32 m², sea view, king bed."))
        .build();
  }
}
